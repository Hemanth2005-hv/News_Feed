import { FiRefreshCw } from 'react-icons/fi'
import { useNews } from '../../context/NewsContext'
import { formatTime } from '../../utils/format'
import './LiveStatus.css'

// Shows where the headlines came from and when they were last refreshed,
// plus a manual refresh for anyone who does not want to wait for the hour.
function LiveStatus() {
  const { updatedAt, refreshing, refresh, error, liveSources, totalSources } =
    useNews()

  return (
    <div className={`live-status${error ? ' live-status-error' : ''}`}>
      <span className="live-status-dot" aria-hidden="true" />
      <span className="live-status-label">{error ? 'Reconnecting' : 'Live'}</span>
      <span className="live-status-meta">
        {updatedAt ? `Updated ${formatTime(updatedAt)}` : 'Loading publishers…'}
        {totalSources > 0 && ` · ${liveSources}/${totalSources} feeds`}
        {' · refreshes hourly'}
      </span>
      <button
        type="button"
        className="live-status-refresh"
        onClick={refresh}
        disabled={refreshing}
        aria-label="Refresh headlines now"
        title="Refresh headlines now"
      >
        <FiRefreshCw className={refreshing ? 'live-status-spinning' : undefined} />
      </button>
    </div>
  )
}

export default LiveStatus
