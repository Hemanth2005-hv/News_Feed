import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { IoNewspaperOutline } from 'react-icons/io5'
import AuthCard from '../../components/auth/AuthCard'
import { useAuth } from '../../context/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  // Where to go after login — the page the guest tried to open, or Home
  const from = location.state?.from || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Shown when the user was redirected here from a protected page (e.g. Saved)
  const redirectMessage = location.state?.from
    ? 'Please log in to continue to that page.'
    : ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)
    try {
      await login(email)
      navigate(from, { replace: true })
    } catch {
      setError('Login failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthCard
      icon={<IoNewspaperOutline className="auth-brand-icon" />}
      title="Welcome back"
      subtitle="Sign in to your NewsFeed account."
    >
      {redirectMessage && (
        <div className="auth-notice">
          <FiAlertCircle /> {redirectMessage}
        </div>
      )}
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

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <div className="auth-input-wrap">
            <FiLock className="auth-input-icon" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              className="form-input auth-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="auth-eye"
              onClick={() => setShowPassword((s) => !s)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
        </div>

        <div className="auth-row">
          <label className="auth-checkbox">
            <input type="checkbox" /> Remember me
          </label>
          <Link to="/forgot-password" className="auth-link">
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block auth-submit"
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : 'Sign In'}
        </button>
      </form>

      <p className="auth-footer">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="auth-link">
          Register
        </Link>
      </p>
    </AuthCard>
  )
}

export default Login
