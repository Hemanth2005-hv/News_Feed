import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi'
import { IoNewspaperOutline } from 'react-icons/io5'
import AuthCard from '../../components/auth/AuthCard'
import { useAuth } from '../../context/AuthContext'
import './Register.css'

function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!name || !email || !password || !confirm) {
      setError('Please fill in all fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      await register(name, email)
      navigate('/', { replace: true })
    } catch {
      setError('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <AuthCard
      icon={<IoNewspaperOutline className="auth-brand-icon" />}
      title="Create your account"
      subtitle="Join NewsFeed and start saving stories."
    >
      {error && (
        <div className="auth-error">
          <FiAlertCircle /> {error}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="name">Full name</label>
          <div className="auth-input-wrap">
            <FiUser className="auth-input-icon" />
            <input
              id="name"
              type="text"
              className="form-input auth-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

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
              placeholder="At least 6 characters"
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

        <div className="form-group">
          <label htmlFor="confirm">Confirm password</label>
          <div className="auth-input-wrap">
            <FiLock className="auth-input-icon" />
            <input
              id="confirm"
              type={showPassword ? 'text' : 'password'}
              className="form-input auth-input"
              placeholder="Repeat your password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-block auth-submit"
          disabled={loading}
        >
          {loading ? <span className="auth-spinner" /> : 'Create Account'}
        </button>
      </form>

      <p className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Login
        </Link>
      </p>
    </AuthCard>
  )
}

export default Register
