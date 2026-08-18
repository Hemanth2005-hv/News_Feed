import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowRight, FiTrendingUp, FiClock } from 'react-icons/fi'
import NewsGrid from '../../components/news/NewsGrid'
import SkeletonCard from '../../components/news/SkeletonCard'
import CategoryChips from '../../components/common/CategoryChips'
import SmartImage from '../../components/common/SmartImage'
import { newsArticles, categories } from '../../data/news'
import { formatDate } from '../../utils/format'
import './Home.css'

function Home() {
  // Currently selected category chip ("All" shows everything)
  const [activeCategory, setActiveCategory] = useState('All')
  // Simulated fetch — shows the skeleton loading state briefly
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600)
    return () => clearTimeout(timer)
  }, [])

  // The first article is promoted as the "featured story"
  const featured = newsArticles[0]

  // Filter the grid by the selected category
  const filteredArticles =
    activeCategory === 'All'
      ? newsArticles
      : newsArticles.filter((a) => a.category === activeCategory)

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
            <span className="badge hero-badge">Stay informed</span>
            <h1 className="hero-title">
              News that matters,
              <br /> delivered daily.
            </h1>
            <p className="hero-subtitle">
              Discover breaking news, trending stories, and in-depth coverage
              from trusted sources around the world.
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
      <section className="container home-section">
        <div className="section-header">
          <h2>Featured Story</h2>
          <p>A deep dive into today&apos;s biggest story.</p>
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
            <h3 className="featured-title">{featured.title}</h3>
            <p className="featured-desc">{featured.description}</p>
            <div className="featured-meta">
              <span className="featured-source">{featured.source}</span>
              <span className="featured-date">
                <FiClock /> {formatDate(featured.publishedAt)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Latest news + category filter ---------- */}
      <section className="container home-section">
        <div className="home-latest-header">
          <div className="section-header">
            <h2>Latest News</h2>
            <p>Browse stories by category.</p>
          </div>

          <CategoryChips
            categories={categories}
            active={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>

        {loading ? (
          <div className="news-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <NewsGrid articles={filteredArticles} />
        )}
      </section>
    </div>
  )
}

export default Home
