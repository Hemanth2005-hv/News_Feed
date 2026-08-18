import { Link } from 'react-router-dom'
import { IoNewspaperOutline } from 'react-icons/io5'
import { categories } from '../../data/news'
import './Footer.css'

const quickLinks = [
  { to: '/', label: 'Home' },
  { to: '/explore', label: 'Explore' },
  { to: '/trending', label: 'Trending' },
  { to: '/saved', label: 'Saved' },
]

function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        {/* Brand */}
        <div className="footer-brand">
          <Link to="/" className="footer-logo">
            <IoNewspaperOutline />
            <span>
              News<span>Feed</span>
            </span>
          </Link>
          <p>
            Your daily news, all in one place. Discover, explore, and save the
            stories that matter to you.
          </p>
        </div>

        {/* Quick links */}
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Top categories */}
        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            {categories
              .filter((c) => c !== 'All')
              .slice(0, 6)
              .map((category) => (
                <li key={category}>
                  <Link to="/explore">{category}</Link>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container">
          <p>
            © {new Date().getFullYear()} NewsFeed · Built with React &amp;
            Spring Boot
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
