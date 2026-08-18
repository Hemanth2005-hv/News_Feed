import { motion } from 'framer-motion'
import './AuthCard.css'

// Shared shell for the Login / Register / Forgot Password pages.
// Props: icon (React element), title, subtitle, children (the form).
function AuthCard({ icon, title, subtitle, children }) {
  return (
    <motion.section
      className="page auth-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
    >
      <div className="container">
        <div className="auth-card card">
          <div className="auth-brand">
            {icon}
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          {children}
        </div>
      </div>
    </motion.section>
  )
}

export default AuthCard
