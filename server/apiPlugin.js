import { getNews, warmNewsCache } from './news.js'

// Serves GET /api/news from the same origin as the app, so there is no CORS
// setup and no API key in the browser bundle. The cache is shared by every
// request and refreshed at most once an hour.
async function newsMiddleware(req, res, next) {
  const pathname = (req.url || '').split('?')[0]
  if (pathname !== '/api/news') return next()

  if (req.method !== 'GET') {
    res.statusCode = 405
    res.setHeader('Allow', 'GET')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  const force = /(?:^|[?&])refresh=1(?:&|$)/.test(req.url || '')

  try {
    const snapshot = await getNews({ force })
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json; charset=utf-8')
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

// Vite plugin: mounts the endpoint in `vite` (dev) and `vite preview`.
export function liveNewsApi() {
  return {
    name: 'newsfeed-live-news',
    configureServer(server) {
      // Start fetching publishers immediately so the first page load is fast
      warmNewsCache()
      server.middlewares.use(newsMiddleware)
    },
    configurePreviewServer(server) {
      warmNewsCache()
      server.middlewares.use(newsMiddleware)
    },
  }
}
