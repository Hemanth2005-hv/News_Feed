import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

// When the route changes, jump back to the top of the page.
// Without this, navigating leaves you scrolled halfway down the old page.
function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default ScrollToTop
