import { motion } from 'framer-motion'
import { HiOutlineSparkles } from 'react-icons/hi'
import './PagePlaceholder.css'

// Temporary screen used until each page gets its real content
function PagePlaceholder({ title, description }) {
  return (
    <motion.section
      className="page page-placeholder"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="page-placeholder-card card">
          <HiOutlineSparkles className="page-placeholder-icon" />
          <h1>{title}</h1>
          <p>{description}</p>
          <span className="badge">Coming soon</span>
        </div>
      </div>
    </motion.section>
  )
}

export default PagePlaceholder
