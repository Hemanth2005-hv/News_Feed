// Shared formatting helpers used across components and pages.

// Turns "2026-08-17T10:00:00Z" into "Aug 17, 2026"
export function formatDate(dateString) {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
