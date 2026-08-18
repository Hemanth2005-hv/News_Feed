import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

// Mock authentication — stores the logged-in user in localStorage.
// In Phase 7 this is replaced by real JWT calls to the Spring Boot backend,
// but the component API (login/register/logout) stays the same.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('newsfeed_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // Simulates a backend login (small delay for realism)
  const login = (email) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { name: email.split('@')[0], email }
        localStorage.setItem('newsfeed_user', JSON.stringify(newUser))
        setUser(newUser)
        resolve(newUser)
      }, 600)
    })

  // Simulates a backend registration (auto-logs the user in)
  const register = (name, email) =>
    new Promise((resolve) => {
      setTimeout(() => {
        const newUser = { name, email }
        localStorage.setItem('newsfeed_user', JSON.stringify(newUser))
        setUser(newUser)
        resolve(newUser)
      }, 600)
    })

  const logout = () => {
    localStorage.removeItem('newsfeed_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Hook that pages/components use to read auth state
// (disable-next-line: context files intentionally export a hook + provider)
// eslint-disable-next-line react/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
