import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { FiGlobe } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import SmartImage from '../../components/common/SmartImage'
import LiveStatus from '../../components/common/LiveStatus'
import { useNews } from '../../context/NewsContext'
import { formatRelativeTime } from '../../utils/format'
import './Trending.css'

// Staggered entrance for the rows
const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0, transition: { duration: 0.35, ease: 'easeOut' } },
}

function Trending() {
  const { articles, loading, error, refresh, refreshing } = useNews()

  // Ranked by how many publishers are running the story, then by freshness.
  // Both signals come from the live feed — no invented view counts.
  const trending = useMemo(
    () =>
      [...articles]
        .sort(
          (a, b) =>
            (b.coverage || 1) - (a.coverage || 1) ||
            Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
        )
        .slice(0, 20),
    [articles],
  )

  return (
    <motion.section
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="section-header trending-header">
          <h1>Trending Now</h1>
          <p>Stories the most publishers are covering right now.</p>
          <LiveStatus />
        </div>

        {loading && articles.length === 0 ? (
          <div className="loading-state">
            <span className="spinner" />
            <p>Ranking today&apos;s stories…</p>
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
        ) : (
          <motion.div
            className="card trending-list"
            variants={listVariants}
            initial="hidden"
            animate="show"
          >
            {trending.map((article, index) => {
              const rank = index + 1
              return (
                <motion.article
                  className="trending-row"
                  key={article.id}
                  variants={rowVariants}
                >
                  {/* Rank number — top 3 highlighted */}
                  <span
                    className={rank <= 3 ? 'trending-rank top' : 'trending-rank'}
                  >
                    {rank}
                  </span>

                  <SmartImage
                    src={article.image}
                    alt={article.title}
                    className="trending-thumb"
                  />

                  <div className="trending-info">
                    <div className="trending-topline">
                      <span className="badge">{article.category}</span>
                      {rank <= 3 && (
                        <span className="trending-hot">
                          <FaFire /> Hot
                        </span>
                      )}
                    </div>
                    <h3 className="trending-title">
                      <a
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="trending-link"
                      >
                        {article.title}
                      </a>
                    </h3>
                    <div className="trending-meta">
                      <span className="trending-source">{article.source}</span>
                      <span className="trending-dot">·</span>
                      <span>{formatRelativeTime(article.publishedAt)}</span>
                      {article.coverage > 1 && (
                        <>
                          <span className="trending-dot">·</span>
                          <span className="trending-views">
                            <FiGlobe /> {article.coverage} outlets
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </motion.article>
              )
            })}
          </motion.div>
        )}
      </div>
    </motion.section>
  )
}

export default Trending
