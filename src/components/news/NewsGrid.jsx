import { motion } from 'framer-motion'
import NewsCard from './NewsCard'
import './NewsGrid.css'

// Stagger: each card starts a tiny bit after the previous one,
// creating a smooth cascading entrance.
const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08 },
  },
}

function NewsGrid({ articles }) {
  if (!articles || articles.length === 0) {
    return (
      <div className="empty-state">
        <h3>No articles found</h3>
        <p>Check back soon for new stories.</p>
      </div>
    )
  }

  return (
    <motion.div
      className="news-grid"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {articles.map((article) => (
        <NewsCard key={article.id} article={article} />
      ))}
    </motion.div>
  )
}

export default NewsGrid
