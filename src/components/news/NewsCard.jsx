import { motion } from 'framer-motion'
import { FiClock } from 'react-icons/fi'
import { FaRegBookmark, FaBookmark } from 'react-icons/fa'
import SmartImage from '../common/SmartImage'
import { useSavedNews } from '../../context/SavedNewsContext'
import { formatDate } from '../../utils/format'
import './NewsCard.css'

// Animation variants — the grid staggers cards by driving these states
const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function NewsCard({ article }) {
  // Saved state now lives in shared context (SavedNewsContext)
  const { isSaved, toggleSave } = useSavedNews()
  const saved = isSaved(article.id)

  return (
    <motion.article
      className="card news-card"
      variants={cardVariants}
      initial="hidden"
      animate="show"
    >
      {/* Image area */}
      <div className="news-card-media">
        <SmartImage
          src={article.image}
          alt={article.title}
          className="news-card-image"
        />
        {article.category && (
          <span className="badge news-card-badge">{article.category}</span>
        )}
      </div>

      {/* Text area */}
      <div className="news-card-body">
        <h3 className="news-card-title">{article.title}</h3>
        <p className="news-card-desc">{article.description}</p>

        {/* Footer: source + date (left), save button (right) */}
        <div className="news-card-footer">
          <div className="news-card-meta">
            {article.source && (
              <span className="news-card-source">{article.source}</span>
            )}
            {article.publishedAt && (
              <>
                <span className="news-card-meta-dot">·</span>
                <span className="news-card-date">
                  <FiClock /> {formatDate(article.publishedAt)}
                </span>
              </>
            )}
          </div>

          <button
            className={saved ? 'news-card-save saved' : 'news-card-save'}
            onClick={() => toggleSave(article.id)}
            aria-label={saved ? 'Remove from saved' : 'Save article'}
            title={saved ? 'Remove from saved' : 'Save article'}
          >
            {saved ? <FaBookmark /> : <FaRegBookmark />}
          </button>
        </div>
      </div>
    </motion.article>
  )
}

export default NewsCard
