import './SkeletonCard.css'

// A gray "ghost" card with a shimmer effect, shown while content loads.
function SkeletonCard() {
  return (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line w-60" />
        <div className="skeleton skeleton-line w-90" />
        <div className="skeleton skeleton-line w-80" />
        <div className="skeleton skeleton-line w-40" />
      </div>
    </div>
  )
}

export default SkeletonCard
