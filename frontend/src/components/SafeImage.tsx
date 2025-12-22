import { useState } from 'react'
import { ImageOff } from 'lucide-react'

interface SafeImageProps {
  src: string | undefined
  alt: string
  className?: string
  fallback?: string
}

export default function SafeImage({ src, alt, className = '', fallback = '/placeholder.jpg' }: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src || fallback)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc(fallback)
    }
  }

  // Если нет src или это placeholder, показываем placeholder
  if (!src || src === '' || hasError) {
    return (
      <div className={`bg-dark-hover flex items-center justify-center ${className}`}>
        <ImageOff className="w-8 h-8 text-dark-text-secondary" />
      </div>
    )
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      onError={handleError}
      loading="lazy"
    />
  )
}







