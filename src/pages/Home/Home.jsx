import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTrendingUp, FiClock, FiExternalLink } from 'react-icons/fi'
import NewsGrid from '../../components/news/NewsGrid'
import SkeletonCard from '../../components/news/SkeletonCard'
import CategoryChips from '../../components/common/CategoryChips'
import SmartImage from '../../components/common/SmartImage'
import LiveStatus from '../../components/common/LiveStatus'
import { useNews } from '../../context/NewsContext'
import { formatRelativeTime } from '../../utils/format'
import './Home.css'

function Home() {
  const { articles, categories, loading, error, refresh, refreshing } = useNews()
  // Currently selected category chip ("All" shows everything)
  const [activeCategory, setActiveCategory] = useState('All')

  // A category can disappear when the feed rotates — fall back to "All"
  useEffect(() => {
    if (activeCategory !== 'All' && !categories.includes(activeCategory)) {
      setActiveCategory('All')
    }
  }, [categories, activeCategory])

  // The newest story in the live feed is promoted as the featured story
  const featured = articles[0]

  const filteredArticles =
    activeCategory === 'All'
      ? articles
      : articles.filter((article) => article.category === activeCategory)

  const showSkeletons = loading && articles.length === 0

  return (
    <div className="home">
      {/* ---------- Hero banner ---------- */}
      <section className="hero">
        <div className="container hero-inner">
          <motion.div
            className="hero-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <span className="badge hero-badge">Live headlines</span>
            <h1 className="hero-title">
              Today&apos;s news,
              <br /> straight from the source.
            </h1>
            <p className="hero-subtitle">
              Real reporting from BBC News, The Guardian, NPR, CNBC and more —
              refreshed automatically every hour.
            </p>
            <div className="hero-actions">
              <Link to="/explore" className="btn btn-primary hero-btn-primary">
                Explore News <FiArrowRight />
              </Link>
              <Link to="/trending" className="btn hero-btn-outline">
                <FiTrendingUp /> Trending
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Featured story ---------- */}
      {featured && (
        <section className="container home-section">
          <div className="section-header">
            <h2>Featured Story</h2>
            <p>The newest story in the live feed.</p>
          </div>

          <div className="card featured-card">
            <div className="featured-media">
              <SmartImage
                src={featured.image}
                alt={featured.title}
                className="featured-image"
              />
              <span className="badge featured-badge">{featured.category}</span>
            </div>
            <div className="featured-body">
              <h3 className="featured-title">
                <a
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="featured-link"
                >
                  {featured.title}
                </a>
              </h3>
              <p className="featured-desc">{featured.description}</p>
              <div className="featured-meta">
                <span className="featured-source">{featured.source}</span>
                <span className="featured-date">
                  <FiClock /> {formatRelativeTime(featured.publishedAt)}
                </span>
                <a
                  className="featured-read"
                  href={featured.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Read full story <FiExternalLink />
                </a>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---------- Latest news + category filter ---------- */}
      <section className="container home-section">
        <div className="home-latest-header">
          <div className="section-header">
            <h2>Latest News</h2>
            <p>Browse today&apos;s stories by category.</p>
            <LiveStatus />
          </div>

          <CategoryChips
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {showSkeletons ? (
          <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
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
        ) : filteredArticles.length === 0 ? (
          <div className="empty-state">
            <h3>No stories in {activeCategory}</h3>
            <p>Pick another category, or check back after the next hourly refresh.</p>
          </div>
        ) : (
          <NewsGrid articles={filteredArticles} />
        )}
      </section>
    </div>
  )
}

export default Home
