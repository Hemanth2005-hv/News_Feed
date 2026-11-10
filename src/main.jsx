import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { NewsProvider } from './context/NewsContext'
import { SavedNewsProvider } from './context/SavedNewsContext'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <NewsProvider>
          <AuthProvider>
            <SavedNewsProvider>
              <App />
            </SavedNewsProvider>
          </AuthProvider>
        </NewsProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
