import { motion } from 'framer-motion'
import { FiEye } from 'react-icons/fi'
import { FaFire } from 'react-icons/fa'
import SmartImage from '../../components/common/SmartImage'
import { newsArticles } from '../../data/news'
import { formatDate } from '../../utils/format'
import './Trending.css'

// Rank articles by popularity (most views first)
const trending = [...newsArticles].sort((a, b) => b.views - a.views)

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
          <p>What the world is reading — ranked by popularity.</p>
        </div>

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
                  <h3 className="trending-title">{article.title}</h3>
                  <div className="trending-meta">
                    <span className="trending-source">{article.source}</span>
                    <span className="trending-dot">·</span>
                    <span>{formatDate(article.publishedAt)}</span>
                    <span className="trending-dot">·</span>
                    <span className="trending-views">
                      <FiEye /> {article.views.toLocaleString()} views
                    </span>
                  </div>
                </div>
              </motion.article>
            )
          })}
        </motion.div>
      </div>
    </motion.section>
  )
}

export default Trending
