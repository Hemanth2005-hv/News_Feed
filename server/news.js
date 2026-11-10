import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { FEEDS, CATEGORY_ORDER } from './feeds.js'

// ---------------------------------------------------------------------------
// Live news aggregator
//
// Fetches public RSS feeds from established publishers, normalises them into
// the shape the UI already uses and keeps the result in memory for one hour.
// Nothing here is generated or invented: every article comes from a real feed,
// keeps its publisher name and links back to the original story.
// ---------------------------------------------------------------------------

const USER_AGENT = 'NewsFeed/1.0 (local demo aggregator)'
const FETCH_TIMEOUT_MS = 10_000
const CACHE_TTL_MS = 60 * 60 * 1000 // refresh hourly
const FRESH_WINDOW_MS = 48 * 60 * 60 * 1000 // "today's news" first
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // never older than a week
const MIN_FRESH_ARTICLES = 40
const MAX_ARTICLES = 120
const CACHE_FILE = new URL('../.cache/news.json', import.meta.url)

// Some publishers (CNBC, ESPN, Al Jazeera, …) ship no image at all in their
// RSS. For those articles we read the story page and take its social image.
const OG_TIMEOUT_MS = 8_000
const OG_BLOCKING_BUDGET_MS = 3_500
const OG_CONCURRENCY = 12

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  rsquo: '’',
  lsquo: '‘',
  ldquo: '“',
  rdquo: '”',
  copy: '©',
  middleDot: '·',
}

const STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'with', 'at',
  'by', 'from', 'as', 'is', 'are', 'was', 'were', 'be', 'been', 'it', 'its',
  'this', 'that', 'these', 'those', 'after', 'over', 'into', 'about', 'says',
  'said', 'new', 'how', 'why', 'what', 'who', 'will', 'has', 'have', 'had',
])

let cache = null
let inFlight = null
let diskLoaded = false

/* ------------------------------ text helpers ----------------------------- */

function decodeEntities(text) {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => safeCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => safeCodePoint(parseInt(dec, 10)))
    .replace(/&([a-z]+);/gi, (match, name) => {
      const value = NAMED_ENTITIES[name.toLowerCase()]
      return value === undefined ? match : value
    })
}

function safeCodePoint(code) {
  try {
    return String.fromCodePoint(code)
  } catch {
    return ''
  }
}

function unwrapCdata(text) {
  const cdata = text.match(/<!\[CDATA\[([\s\S]*?)\]\]>/)
  return cdata ? cdata[1] : text
}

// Plain text from RSS HTML/escaped HTML fragments, truncated on a word boundary.
function cleanText(raw, maxLength = 240) {
  if (!raw) return ''

  let text = decodeEntities(unwrapCdata(raw))
  text = text
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]*>/g, ' ')
  text = decodeEntities(text)
  text = text
    .replace(/The post .*? appeared first on .*?\.?$/i, ' ')
    .replace(/Continue reading[.…]*$/i, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trim()}…`
}

function tagContent(block, tag) {
  const match = block.match(
    new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'),
  )
  return match ? unwrapCdata(match[1]).trim() : ''
}

function attribute(tag, name) {
  const match = tag.match(new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))
  return match ? decodeEntities(match[2] ?? match[3] ?? '').trim() : ''
}

const BAD_IMAGE_PATTERN = /(pixel|tracking|spacer|blank\.(gif|png)|1x1)/i

const OG_IMAGE_PATTERNS = [
  /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*property=["']og:image(?::secure_url)?["']/i,
  /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]*content=["']([^"']+)["']/i,
  /<meta[^>]+content=["']([^"']+)["'][^>]*name=["']twitter:image(?::src)?["']/i,
]

function isUsableImage(url) {
  return (
    typeof url === 'string' &&
    /^https?:\/\//i.test(url) &&
    !BAD_IMAGE_PATTERN.test(url)
  )
}

function firstImageTag(html) {
  const match = html.match(/<img\b[^>]*>/gi)
  if (!match) return ''
  for (const tag of match) {
    const src = attribute(tag, 'src') || attribute(tag, 'data-src')
    if (isUsableImage(src)) return src
  }
  return ''
}

function pickImage(block) {
  // 1. media:thumbnail / media:content (BBC, many others)
  for (const tag of block.match(/<media:(?:thumbnail|content)\b[^>]*>/gi) || []) {
    const type = attribute(tag, 'type')
    if (type && !type.startsWith('image')) continue
    const url = attribute(tag, 'url')
    if (isUsableImage(url)) return url
  }

  // 2. <enclosure type="image/jpeg">
  for (const tag of block.match(/<enclosure\b[^>]*>/gi) || []) {
    const type = attribute(tag, 'type')
    if (type && !type.startsWith('image')) continue
    const url = attribute(tag, 'url')
    if (isUsableImage(url)) return url
  }

  // 3. First <img> inside the full content or the summary
  const rich = tagContent(block, 'content:encoded') || tagContent(block, 'description')
  return firstImageTag(decodeEntities(unwrapCdata(rich)))
}

function canonicalLink(url) {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    // Drop tracking params (BBC adds at_medium/at_campaign, others add utm_*)
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|at_|ref$|source$|fbclid$|gclid$)/i.test(key)) {
        parsed.searchParams.delete(key)
      }
    }
    parsed.search = parsed.searchParams.toString()
      ? `?${parsed.searchParams.toString()}`
      : ''
    return parsed.toString()
  } catch {
    return url
  }
}

function articleId(link) {
  return createHash('sha1').update(link).digest('hex').slice(0, 12)
}

function parseDate(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function titleTokens(title) {
  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !STOPWORDS.has(word))
  return new Set(words)
}

// Two headlines describe the same story when their meaningful words overlap.
function sameStory(a, b) {
  if (!a.size || !b.size) return false
  let shared = 0
  for (const token of a) if (b.has(token)) shared += 1
  const union = a.size + b.size - shared
  return union > 0 && shared / union >= 0.5
}

/* ------------------------------- fetching -------------------------------- */

async function fetchFeed(feed) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    const response = await fetch(feed.url, {
      headers: { 'user-agent': USER_AGENT, accept: 'application/rss+xml, application/xml, text/xml' },
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const xml = await response.text()
    return { feed, xml }
  } finally {
    clearTimeout(timer)
  }
}

function parseFeed({ feed, xml }, now) {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) || []
  const articles = []

  for (const block of blocks) {
    const title = cleanText(tagContent(block, 'title'), 300)
    const rawLink = tagContent(block, 'link') || tagContent(block, 'guid')
    const url = canonicalLink(rawLink)
    if (!title || !/^https?:\/\//i.test(url)) continue

    const publishedAt = parseDate(tagContent(block, 'pubDate'))
    if (!publishedAt) continue

    const timestamp = publishedAt.getTime()
    // Skip items skewed far into the future (bad timezone data in some feeds)
    if (timestamp > now + 6 * 60 * 60 * 1000) continue
    if (timestamp < now - MAX_AGE_MS) continue

    const description = cleanText(
      tagContent(block, 'description') || tagContent(block, 'content:encoded'),
      240,
    )

    let category = feed.category
    // Promote technology stories that are really about AI
    if (
      category === 'Technology' &&
      /\b(ai|a\.i\.|artificial intelligence|openai|chatgpt|gemini|llm|machine learning|anthropic|copilot)\b/i.test(
        `${title} ${description}`,
      )
    ) {
      category = 'AI'
    }

    articles.push({
      id: articleId(url),
      title,
      description,
      image: pickImage(block),
      category,
      source: feed.name,
      publishedAt: new Date(Math.min(timestamp, now)).toISOString(),
      url,
      coverage: 1,
    })
  }

  return articles
}

/* ------------------------------ aggregation ------------------------------ */

function dedupe(articles) {
  const seen = new Map()
  for (const article of articles) {
    if (!seen.has(article.id)) seen.set(article.id, article)
  }
  return [...seen.values()]
}

// Groups near-identical headlines and records how many publishers ran the story.
function annotateCoverage(articles) {
  const clusters = []

  for (const article of articles) {
    const tokens = titleTokens(article.title)
    const match = clusters.find((cluster) => sameStory(cluster.tokens, tokens))
    if (match) {
      match.articles.push(article)
      match.sources.add(article.source)
    } else {
      clusters.push({ tokens, articles: [article], sources: new Set([article.source]) })
    }
  }

  for (const cluster of clusters) {
    for (const article of cluster.articles) {
      article.coverage = cluster.sources.size
    }
  }

  return articles
}

function categoryList(articles) {
  const present = new Set(articles.map((article) => article.category))
  const ordered = CATEGORY_ORDER.filter((category) => present.has(category))
  const extras = [...present]
    .filter((category) => !CATEGORY_ORDER.includes(category))
    .sort((a, b) => a.localeCompare(b))
  return ['All', ...ordered, ...extras]
}

/* --------------------------- image enrichment ---------------------------- */

// Remember social images for the process lifetime — an article that stays in
// the feed across refreshes should not be fetched again every hour.
const ogImageCache = new Map()

function ogImageFromHtml(html, pageUrl) {
  for (const pattern of OG_IMAGE_PATTERNS) {
    const match = html.match(pattern)
    if (!match) continue
    const raw = decodeEntities(match[1]).trim()
    if (!raw) continue
    try {
      const resolved = new URL(raw, pageUrl).toString()
      if (isUsableImage(resolved)) return resolved
    } catch {
      // malformed meta value — try the next pattern
    }
  }
  return ''
}

async function fetchOgImage(pageUrl, deadline) {
  if (ogImageCache.has(pageUrl)) return ogImageCache.get(pageUrl)

  const remaining = deadline - Date.now()
  if (remaining <= 0) return ''

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), Math.min(OG_TIMEOUT_MS, remaining))
  try {
    const response = await fetch(pageUrl, {
      headers: {
        // Keep this short: NPR stalls requests whose UA advertises a URL.
        'user-agent': 'Mozilla/5.0 (compatible; NewsFeed/1.0) AppleWebKit/537.36',
        accept: 'text/html,application/xhtml+xml',
      },
      signal: controller.signal,
      redirect: 'follow',
    })
    if (!response.ok) return ''
    const image = ogImageFromHtml(await response.text(), pageUrl)
    // Only remember successes: a timeout now should not hide the image
    // forever, and the next refresh can try the page again.
    if (image) {
      if (ogImageCache.size > 1000) ogImageCache.clear()
      ogImageCache.set(pageUrl, image)
    }
    return image
  } catch {
    return ''
  } finally {
    clearTimeout(timer)
  }
}

async function enrichImages(articles, budgetMs = Infinity) {
  const missing = articles.filter((article) => !article.image)
  if (!missing.length) return articles

  const deadline = Date.now() + budgetMs
  let index = 0

  const worker = async () => {
    while (index < missing.length) {
      if (Date.now() >= deadline) return
      const article = missing[index++]
      const image = await fetchOgImage(article.url, deadline)
      if (image) article.image = image
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(OG_CONCURRENCY, missing.length) }, worker),
  )
  return articles
}

async function refresh() {
  const now = Date.now()
  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFeed(feed)))

  const articles = []
  const sources = []

  results.forEach((result, index) => {
    const feed = FEEDS[index]
    if (result.status === 'fulfilled') {
      const parsed = parseFeed(result.value, now)
      articles.push(...parsed)
      sources.push({ name: feed.name, category: feed.category, ok: true, count: parsed.length })
    } else {
      sources.push({
        name: feed.name,
        category: feed.category,
        ok: false,
        count: 0,
        error: result.reason?.message || 'Feed unavailable',
      })
    }
  })

  if (!articles.length) {
    throw new Error('No publisher feeds could be read')
  }

  let recent = articles.filter((article) => now - Date.parse(article.publishedAt) <= FRESH_WINDOW_MS)
  // Quiet periods on some feeds: widen the window rather than show an empty page
  const considered = recent.length >= MIN_FRESH_ARTICLES ? recent : articles

  const finalArticles = annotateCoverage(dedupe(considered))
    .sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt))
    .slice(0, MAX_ARTICLES)

  // Only enrich the articles we actually show, and only those missing a
  // thumbnail — the feed image is always preferred when it exists. Most
  // pages answer well under the blocking budget; the rest finish in the
  // background so the first page load is not held up by slow publishers.
  await enrichImages(finalArticles, OG_BLOCKING_BUDGET_MS)

  cache = {
    articles: finalArticles,
    categories: categoryList(finalArticles),
    sources,
    updatedAt: new Date(now).toISOString(),
    windowHours: considered === recent ? 48 : 168,
  }

  persist(cache).catch(() => {})

  // The article objects are shared with the cache, so late images show up in
  // the next snapshot without another full feed refresh.
  const snapshot = cache
  enrichImages(finalArticles)
    .then(() => {
      if (cache === snapshot) return persist(snapshot)
      return undefined
    })
    .catch(() => {})

  return cache
}

/* -------------------------------- caching -------------------------------- */

async function persist(snapshot) {
  await mkdir(new URL('../.cache/', import.meta.url), { recursive: true })
  await writeFile(CACHE_FILE, JSON.stringify(snapshot))
}

async function loadDiskCache() {
  if (diskLoaded) return
  diskLoaded = true
  try {
    const raw = await readFile(CACHE_FILE, 'utf8')
    const snapshot = JSON.parse(raw)
    if (snapshot?.articles?.length) {
      // Keep the disk copy only as a starting point; refresh right after.
      cache = { ...snapshot, stale: true }
    }
  } catch {
    // no cache on disk yet — first run
  }
}

const MIN_FORCE_AGE_MS = 5 * 60 * 1000

export async function getNews({ force = false } = {}) {
  await loadDiskCache()
  const age = cache ? Date.now() - Date.parse(cache.updatedAt) : Infinity

  // Several tabs can ask at once; only hit the publishers if the snapshot is
  // actually old enough to be refreshed.
  const shouldForce = force && age >= MIN_FORCE_AGE_MS

  if (!shouldForce && cache && age < CACHE_TTL_MS) {
    return { ...cache, stale: false, ageMs: age, refreshInMs: CACHE_TTL_MS - age }
  }

  if (!inFlight) {
    inFlight = refresh()
      .catch((error) => {
        // Network hiccup: keep serving the last good headlines rather than
        // replacing real news with anything invented.
        if (cache?.articles?.length) {
          return { ...cache, stale: true, error: error.message }
        }
        throw error
      })
      .finally(() => {
        inFlight = null
      })
  }

  const snapshot = await inFlight
  return { ...snapshot, stale: Boolean(snapshot.stale), ageMs: Date.now() - Date.parse(snapshot.updatedAt) }
}

// Warms the cache on startup so the first page load is not empty.
export function warmNewsCache() {
  getNews().catch((error) => {
    console.warn(`[news] could not warm the news cache: ${error.message}`)
  })
}

export const NEWS_CONSTANTS = { CACHE_TTL_MS, MAX_ARTICLES }
