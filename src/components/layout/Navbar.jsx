import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiLogOut, FiSun, FiMoon } from 'react-icons/fi'
import { IoNewspaperOutline } from 'react-icons/io5'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './Navbar.css'

// The main navigation links — one entry per route
const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/trending', label: 'Trending' },
  { to: '/saved', label: 'Saved' },
]

function Navbar() {
  // Tracks whether the mobile menu is open (phone/tablet only)
  const [menuOpen, setMenuOpen] = useState(false)
  // Auth state: null user = guest, otherwise logged in
  const { user, isAuthenticated, logout } = useAuth()
  // Light/dark mode
  const { isDark, toggleTheme } = useTheme()

  const handleLogout = () => {
    logout()
    setMenuOpen(false)
  }

  return (
    <motion.header
      className="navbar"
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <nav className="navbar-inner container">
        {/* Logo — clicking it always goes Home */}
        <Link to="/" className="navbar-logo" onClick={() => setMenuOpen(false)}>
          <IoNewspaperOutline className="navbar-logo-icon" />
          <span>
            News<span className="navbar-logo-accent">Feed</span>
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="navbar-links">
          {navLinks.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  isActive ? 'nav-link active' : 'nav-link'
                }
              >
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Right side: theme toggle, user menu or guest Login button */}
        <div className="navbar-actions">
          <motion.button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            whileTap={{ rotate: 45, scale: 0.9 }}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <FiSun /> : <FiMoon />}
          </motion.button>

          {isAuthenticated ? (
            <div className="navbar-user">
              <span className="navbar-user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </span>
              <span className="navbar-user-name">{user.name}</span>
              <button
                className="navbar-logout"
                onClick={handleLogout}
                aria-label="Log out"
                title="Log out"
              >
                <FiLogOut />
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary navbar-login">
              Login
            </Link>
          )}
          <button
            className="navbar-toggle"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </nav>

      {/* Mobile menu — slides open only on small screens */}
      <AnimatePresence>
        {menuOpen && (
          <motion.ul
            className="navbar-mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            {navLinks.map((link) => (
              <li key={link.to}>
                <NavLink
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    isActive ? 'nav-link active' : 'nav-link'
                  }
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            <li>
              {isAuthenticated ? (
                <button
                  className="btn btn-danger btn-block navbar-mobile-logout"
                  onClick={handleLogout}
                >
                  <FiLogOut /> Log out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="btn btn-primary navbar-mobile-login"
                  onClick={() => setMenuOpen(false)}
                >
                  Login
                </Link>
              )}
            </li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

export default Navbar
