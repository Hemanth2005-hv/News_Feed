import { getNews } from '../server/news.js'

// Vercel Functions entry point for GET /api/news. Local development uses the
// same aggregator through the Vite plugin in server/apiPlugin.js, so both
// environments read the exact same feeds and cache implementation.
export default async function handler(req, res) {
  if ((req.method || 'GET').toUpperCase() !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const force = /(?:^|[?&])refresh=1(?:&|$)/.test(req.url || '')

  try {
    const snapshot = await getNews({ force })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    // The function already caches for an hour; keep the CDN from adding a
    // second, staler layer in front of it.
    res.setHeader('Cache-Control', 'no-store')
    res.end(JSON.stringify(snapshot))
  } catch (error) {
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.end(
      JSON.stringify({
        error: 'Live news is temporarily unavailable',
        detail: error.message,
      }),
    )
  }
}
