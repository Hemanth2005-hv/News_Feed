import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { FiBookmark, FiCompass } from 'react-icons/fi'
import NewsGrid from '../../components/news/NewsGrid'
import { useSavedNews } from '../../context/SavedNewsContext'
import './Saved.css'

function Saved() {
  // Shared bookmark state — shows articles saved on ANY page, and keeps the
  // article even after it rotates out of the hourly live feed.
  const { savedArticles } = useSavedNews()

  return (
    <motion.section
      className="page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="section-header">
          <h1>Saved Articles</h1>
          <p>Your bookmarked stories, all in one place.</p>
        </div>

        {savedArticles.length > 0 ? (
          <NewsGrid articles={savedArticles} />
        ) : (
          <div className="empty-state saved-empty card">
            <FiBookmark className="saved-empty-icon" />
            <h3>No saved articles yet</h3>
            <p>Tap the bookmark icon on any article to save it here.</p>
            <Link to="/explore" className="btn btn-primary">
              Explore News <FiCompass />
            </Link>
          </div>
        )}
      </div>
    </motion.section>
  )
}

export default Saved
