import { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext(null)

// Read the saved theme once at startup (falls back to light)
function getInitialTheme() {
  try {
    const stored = localStorage.getItem('newsfeed_theme')
    if (stored === 'light' || stored === 'dark') return stored
  } catch {
    // ignore — default to light
  }
  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme)

  // Apply the theme as a data attribute on <html>.
  // All component colors read CSS variables, so [data-theme='dark']
  // swaps every token at once.
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    try {
      localStorage.setItem('newsfeed_theme', theme)
    } catch {
      // ignore — storage unavailable
    }
  }, [theme])

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: theme === 'dark', toggleTheme }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

// Hook that components use to read/toggle the theme
// (disable-next-line: context files intentionally export a hook + provider)
// eslint-disable-next-line react/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider')
  return ctx
}
