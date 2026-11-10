import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiSearch, FiX } from 'react-icons/fi'
import NewsGrid from '../../components/news/NewsGrid'
import CategoryChips from '../../components/common/CategoryChips'
import LiveStatus from '../../components/common/LiveStatus'
import { useNews } from '../../context/NewsContext'
import './Explore.css'

function Explore() {
  const { articles, categories, loading, error, refresh, refreshing } = useNews()
  // What the user typed in the search bar
  const [query, setQuery] = useState('')
  // Currently selected category chip
  const [activeCategory, setActiveCategory] = useState('All')

  // useMemo: only re-run the filter when the data, query or category changes
  const filteredArticles = useMemo(() => {
    const q = query.trim().toLowerCase()

    return articles.filter((article) => {
      const matchesCategory =
        activeCategory === 'All' || article.category === activeCategory

      if (!q) return matchesCategory

      const matchesQuery =
        article.title.toLowerCase().includes(q) ||
        article.description.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q) ||
        article.source.toLowerCase().includes(q)

      return matchesCategory && matchesQuery
    })
  }, [articles, query, activeCategory])

  const showSkeletons = loading && articles.length === 0

  return (
    <motion.section
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="section-header explore-header">
          <h1>Explore News</h1>
          <p>Search today&apos;s reporting from every publisher in the feed.</p>
          <LiveStatus />
        </div>

        {/* Search bar */}
        <div className="explore-search">
          <FiSearch className="explore-search-icon" />
          <input
            type="text"
            className="explore-search-input"
            placeholder="Search articles, topics, sources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <button
              className="explore-search-clear"
              onClick={() => setQuery('')}
              aria-label="Clear search"
            >
              <FiX />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="explore-filters">
          <CategoryChips
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {/* Results (or empty state) */}
        {showSkeletons ? (
          <div className="loading-state">
            <span className="spinner" />
            <p>Fetching the latest headlines…</p>
          </div>
        ) : error && articles.length === 0 ? (
          <div className="error-state">
            <h3>Live news is unavailable</h3>
            <p>{error}. The feed retries automatically every hour.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={refresh}
              disabled={refreshing}
            >
              {refreshing ? 'Connecting…' : 'Try again'}
            </button>
          </div>
        ) : filteredArticles.length > 0 ? (
          <NewsGrid articles={filteredArticles} />
        ) : (
          <div className="empty-state explore-empty">
            <h3>No articles found</h3>
            <p>
              Nothing matches &quot;{query.trim() || activeCategory}&quot;. Try a
              different search or category.
            </p>
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Explore
