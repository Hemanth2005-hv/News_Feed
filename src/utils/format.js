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

// "4:15 PM" — used for the "Updated …" live indicator
export function formatTime(dateString) {
  if (!dateString) return ''
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Fresh news reads better as "12m ago" / "3h ago" than as a calendar date.
export function formatRelativeTime(dateString) {
  if (!dateString) return ''
  const time = new Date(dateString).getTime()
  if (Number.isNaN(time)) return ''

  const minutes = Math.floor((Date.now() - time) / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return formatDate(dateString)
}
