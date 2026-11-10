// Live news sources — public RSS feeds from established publishers.
// No API key is needed, and every article keeps its publisher name and link,
// so the app always shows real reporting rather than generated content.

export const FEEDS = [
  // World / general
  { name: 'BBC News', category: 'World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml' },
  { name: 'The Guardian', category: 'World', url: 'https://www.theguardian.com/world/rss' },
  { name: 'Al Jazeera', category: 'World', url: 'https://www.aljazeera.com/xml/rss/all.xml' },
  { name: 'The New York Times', category: 'World', url: 'https://rss.nytimes.com/services/xml/rss/nyt/World.xml' },
  { name: 'NPR', category: 'World', url: 'https://feeds.npr.org/1001/rss.xml' },

  // Technology
  { name: 'BBC News', category: 'Technology', url: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
  { name: 'The Guardian', category: 'Technology', url: 'https://www.theguardian.com/uk/technology/rss' },
  { name: 'TechCrunch', category: 'Technology', url: 'https://techcrunch.com/feed/' },
  { name: 'Ars Technica', category: 'Technology', url: 'https://feeds.arstechnica.com/arstechnica/index' },

  // Business / finance
  { name: 'BBC News', category: 'Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
  { name: 'CNBC', category: 'Business', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html' },

  // Sports
  { name: 'BBC Sport', category: 'Sports', url: 'https://feeds.bbci.co.uk/sport/rss.xml' },
  { name: 'ESPN', category: 'Sports', url: 'https://www.espn.com/espn/rss/news' },

  // Health / science
  { name: 'BBC News', category: 'Health', url: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
  { name: 'BBC News', category: 'Science', url: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
  { name: 'ScienceDaily', category: 'Science', url: 'https://www.sciencedaily.com/rss/top/science.xml' },

  // Entertainment
  { name: 'Variety', category: 'Entertainment', url: 'https://variety.com/feed/' },
]

// Order of the filter chips in the UI. Categories that are not listed here
// still appear, sorted after these.
export const CATEGORY_ORDER = [
  'World',
  'Technology',
  'AI',
  'Business',
  'Finance',
  'Sports',
  'Health',
  'Science',
  'Entertainment',
]
