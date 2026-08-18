import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiMail, FiAlertCircle, FiCheckCircle } from 'react-icons/fi'
import { IoNewspaperOutline } from 'react-icons/io5'
import AuthCard from '../../components/auth/AuthCard'
import './ForgotPassword.css'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  // After "sending", swap the form for a success message
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email) {
      setError('Please enter your email address.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    // Simulates calling the backend (real reset email comes with Phase 7)
    setTimeout(() => {
      setLoading(false)
      setSent(true)
    }, 600)
  }

  return (
    <AuthCard
      icon={<IoNewspaperOutline className="auth-brand-icon" />}
      title="Forgot password?"
      subtitle="We&apos;ll email you a link to reset it."
    >
      {sent ? (
        <div className="auth-success">
          <FiCheckCircle className="auth-success-icon" />
          <h3>Check your inbox</h3>
          <p>
            If an account exists for <strong>{email}</strong>, a reset link is
            on its way.
          </p>
          <Link to="/login" className="btn btn-primary btn-block auth-submit">
            Back to Login
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="auth-error">
              <FiAlertCircle /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="auth-input-wrap">
                <FiMail className="auth-input-icon" />
                <input
                  id="email"
                  type="email"
                  className="form-input auth-input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block auth-submit"
              disabled={loading}
            >
              {loading ? <span className="auth-spinner" /> : 'Send Reset Link'}
            </button>
          </form>

          <p className="auth-footer">
            Remembered your password?{' '}
            <Link to="/login" className="auth-link">
              Login
            </Link>
          </p>
        </>
      )}
    </AuthCard>
  )
}

export default ForgotPassword
