import { createContext, useContext, useState } from 'react'

const SavedNewsContext = createContext(null)

// Shared bookmark state — any NewsCard can toggle a save and the
// Saved page sees the result immediately, no matter which page saved it.
// We keep the article itself (not just its id) so a bookmark stays readable
// even after the live feed rotates that story out on an hourly refresh.
export function SavedNewsProvider({ children }) {
  const [savedArticles, setSavedArticles] = useState([])

  const toggleSave = (article) => {
    setSavedArticles((prev) =>
      prev.some((item) => item.id === article.id)
        ? prev.filter((item) => item.id !== article.id)
        : [article, ...prev],
    )
  }

  const isSaved = (id) => savedArticles.some((item) => item.id === id)

  return (
    <SavedNewsContext.Provider
      value={{ savedArticles, savedIds: savedArticles.map((a) => a.id), toggleSave, isSaved }}
    >
      {children}
    </SavedNewsContext.Provider>
  )
}

// Hook that components use to read/write saved articles
// (disable-next-line: context files intentionally export a hook + provider)
// eslint-disable-next-line react/only-export-components
export function useSavedNews() {
  const ctx = useContext(SavedNewsContext)
  if (!ctx) {
    throw new Error('useSavedNews must be used within a SavedNewsProvider')
  }
  return ctx
}
