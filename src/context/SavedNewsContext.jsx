import { createContext, useContext, useState } from 'react'

const SavedNewsContext = createContext(null)

// Shared bookmark state — any NewsCard can toggle a save and the
// Saved page sees the result immediately, no matter which page saved it.
export function SavedNewsProvider({ children }) {
  const [savedIds, setSavedIds] = useState([])

  const toggleSave = (id) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  const isSaved = (id) => savedIds.includes(id)

  return (
    <SavedNewsContext.Provider value={{ savedIds, toggleSave, isSaved }}>
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
