import { useState } from 'react'
import fallbackImage from '../../assets/news-fallback.svg'

// An <img> that never shows a broken-image icon:
// if the src fails or is missing, it swaps in the local fallback.
function SmartImage({ src, alt = '', className = '', ...rest }) {
  const [error, setError] = useState(false)

  return (
    <img
      src={error || !src ? fallbackImage : src}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => setError(true)}
      {...rest}
    />
  )
}

export default SmartImage
