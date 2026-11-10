import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

const NewsContext = createContext(null)

// The server caches publisher feeds for an hour; the app asks for a fresh
// snapshot on the same schedule so an open tab updates itself.
const REFRESH_MS = 60 * 60 * 1000
// If the tab was asleep or hidden, catch up as soon as it is visible again
const CATCH_UP_AFTER_MS = 55 * 60 * 1000

export function NewsProvider({ children }) {
  const [articles, setArticles] = useState([])
  const [categories, setCategories] = useState(['All'])
  const [sources, setSources] = useState([])
  const [updatedAt, setUpdatedAt] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState(null)

  const lastFetchedAt = useRef(0)
  const requestId = useRef(0)

  const load = useCallback(async ({ force = false, quiet = false } = {}) => {
    const id = ++requestId.current
    if (!quiet) setRefreshing(true)

    try {
      const response = await fetch(`/api/news${force ? '?refresh=1' : ''}`, {
        headers: { accept: 'application/json' },
      })
      if (!response.ok) throw new Error(`Live news request failed (${response.status})`)

      const data = await response.json()
      if (id !== requestId.current) return

      setArticles(Array.isArray(data.articles) ? data.articles : [])
      if (Array.isArray(data.categories) && data.categories.length) {
        setCategories(data.categories)
      }
      setSources(Array.isArray(data.sources) ? data.sources : [])
      setUpdatedAt(data.updatedAt || new Date().toISOString())
      setError(null)
    } catch (err) {
      if (id !== requestId.current) return
      // Keep whatever is already on screen; the next hourly attempt retries.
      setError(err.message || 'Live news is unavailable')
    } finally {
      if (id === requestId.current) {
        lastFetchedAt.current = Date.now()
        setLoading(false)
        setRefreshing(false)
      }
    }
  }, [])

  useEffect(() => {
    load()

    const timer = setInterval(() => load({ force: true, quiet: true }), REFRESH_MS)

    const catchUp = () => {
      if (
        document.visibilityState === 'visible' &&
        Date.now() - lastFetchedAt.current > CATCH_UP_AFTER_MS
      ) {
        load({ force: true, quiet: true })
      }
    }
    document.addEventListener('visibilitychange', catchUp)

    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', catchUp)
    }
  }, [load])

  const refresh = useCallback(() => load({ force: true }), [load])

  const liveSources = useMemo(
    () => sources.filter((source) => source.ok).length,
    [sources],
  )

  const value = useMemo(
    () => ({
      articles,
      categories,
      sources,
      liveSources,
      totalSources: sources.length,
      updatedAt,
      loading,
      refreshing,
      error,
      refresh,
    }),
    [
      articles,
      categories,
      sources,
      liveSources,
      updatedAt,
      loading,
      refreshing,
      error,
      refresh,
    ],
  )

  return <NewsContext.Provider value={value}>{children}</NewsContext.Provider>
}

// Hook that pages/components use to read the live news state
// (disable-next-line: context files intentionally export a hook + provider)
// eslint-disable-next-line react/only-export-components
export function useNews() {
  const ctx = useContext(NewsContext)
  if (!ctx) throw new Error('useNews must be used within a NewsProvider')
  return ctx
}
