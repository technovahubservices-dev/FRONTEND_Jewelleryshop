import { useState, useRef, useEffect } from 'react'
import { resolveImageUrl, resolveVideoUrl } from '../../utils/apiUrl'

function getYouTubeId(url) {
  if (!url || typeof url !== 'string') return ''
  const m = url.match(
    /(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )
  return m ? m[1] : ''
}

export default function ProductGallery({ images = [], video = '', productName = '' }) {
  const imageList = images.filter(Boolean)
  const hasVideo = Boolean(video)

  const mediaItems = [
    ...imageList.map((img, idx) => ({
      type: 'image',
      src: img,
      key: `img-${idx}`,
      alt: `${productName} view ${idx + 1}`,
    })),
    ...(hasVideo ? [{ type: 'video', src: video, key: 'video', alt: `${productName} video` }] : []),
  ]

  const hasMultiple = mediaItems.length > 1
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mainImgLoaded, setMainImgLoaded] = useState(false)

  // Fullscreen / Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [zoomScale, setZoomScale] = useState(1)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [lightboxImgLoaded, setLightboxImgLoaded] = useState(false)

  const mainImageRef = useRef(null)
  const lightboxImgRef = useRef(null)

  const currentItem = mediaItems[currentIndex]
  const currentLightboxItem = mediaItems[lightboxIndex]

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
    setMainImgLoaded(false)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
    setMainImgLoaded(false)
  }

  const openLightbox = () => {
    setLightboxIndex(currentIndex)
    setZoomScale(1)
    setLightboxImgLoaded(false)
    setLightboxOpen(true)
    document.body.style.overflow = 'hidden'
  }

  const closeLightbox = () => {
    setLightboxOpen(false)
    setZoomScale(1)
    document.body.style.overflow = ''
  }

  const handleLightboxPrev = () => {
    setLightboxIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
    setZoomScale(1)
    setLightboxImgLoaded(false)
  }

  const handleLightboxNext = () => {
    setLightboxIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
    setZoomScale(1)
    setLightboxImgLoaded(false)
  }

  const handleZoomIn = () => setZoomScale((prev) => Math.min(prev + 0.5, 3))
  const handleZoomOut = () => setZoomScale((prev) => Math.max(prev - 0.5, 1))
  const handleZoomReset = () => {
    setZoomScale(1)
    setZoomPosition({ x: 0, y: 0 })
  }

  const handleMouseMove = (e) => {
    if (zoomScale <= 1 || !lightboxImgRef.current || currentLightboxItem.type !== 'image') return
    const rect = lightboxImgRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return

    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'Escape':
          closeLightbox()
          break
        case 'ArrowLeft':
          handleLightboxPrev()
          break
        case 'ArrowRight':
          handleLightboxNext()
          break
        case '+':
          handleZoomIn()
          break
        case '-':
          handleZoomOut()
          break
        case '0':
          handleZoomReset()
          break
      }
    }

    const handleWheel = (e) => {
      e.preventDefault()
      if (e.deltaY < 0) handleZoomIn()
      else handleZoomOut()
    }

    document.addEventListener('keydown', handleKeyDown)
    if (currentLightboxItem.type === 'image') {
      lightboxImgRef.current?.addEventListener('wheel', handleWheel, { passive: false })
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      lightboxImgRef.current?.removeEventListener('wheel', handleWheel)
    }
  }, [lightboxOpen, lightboxIndex, zoomScale, currentLightboxItem.type])

  // Close lightbox on outside click
  useEffect(() => {
    if (!lightboxOpen) return
    const handleClickOutside = (e) => {
      if (e.target === e.currentTarget) closeLightbox()
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [lightboxOpen])

  return (
    <>
      {/* Gallery Main */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Thumbnails (desktop vertical, mobile horizontal) */}
        <div className="md:col-span-2 flex md:flex-col gap-3 overflow-x-auto md:overflow-y-auto md:max-h-[600px] pb-1 md:pb-0">
          {mediaItems.map((item, idx) => {
            const isVideo = item.type === 'video'
            const resolvedSrc = isVideo
              ? resolveVideoUrl(item.src)
              : resolveImageUrl(item.src)
            const thumbnailUrl = isVideo
              ? resolveVideoUrl(item.src)
              : resolveImageUrl(item.src)

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx)
                  setMainImgLoaded(false)
                }}
                className={`relative w-16 h-16 md:w-20 md:h-20 flex-shrink-0 rounded overflow-hidden border-2 transition-all ${
                  idx === currentIndex
                    ? 'border-primary shadow-md'
                    : 'border-outline-variant hover:border-primary/50'
                }}`}
                aria-label={`View image ${idx + 1}`}
              >
                {isVideo ? (
                  <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                    <span className="material-symbols-outlined text-[20px] text-deep-emerald">
                      play_circle
                    </span>
                  </div>
                ) : (
                  <img
                    src={thumbnailUrl}
                    alt={`${productName} thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = 'https://placehold.co/400x400?text=No+Image'
                    }}
                  />
                )}
                {idx === currentIndex && (
                  <span className="absolute inset-0 border-2 border-primary rounded pointer-events-none" />
                )}
              </button>
            )
          })}
        </div>

        {/* Main Display */}
        <div className="md:col-span-10">
          <div
            ref={mainImageRef}
            className="relative bg-surface-container-low rounded-xl overflow-hidden aspect-[4/5] cursor-zoom-in"
            onClick={currentItem.type === 'image' ? openLightbox : undefined}
          >
            {!mainImgLoaded && currentItem.type === 'image' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-deep-emerald/20 border-t-deep-emerald rounded-full animate-spin" />
              </div>
            )}

            {currentItem.type === 'video' ? (
              (() => {
                const ytId = getYouTubeId(currentItem.src)
                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?rel=0`}
                      title={productName}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                const videoSrc = resolveVideoUrl(currentItem.src)
                return (
                  <video
                    src={videoSrc}
                    controls
                    preload="none"
                    poster="https://placehold.co/400x400?text=Video+Thumbnail"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              })()
            ) : (
              <img
                src={resolveImageUrl(currentItem.src)}
                alt={currentItem.alt || productName}
                onLoad={() => setMainImgLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/600x800?text=No+Image'
                  setMainImgLoaded(true)
                }}
                className={`w-full h-full object-cover transition-transform duration-300 ${mainImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: zoomScale > 1 ? `scale(${zoomScale})` : 'none',
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                }}
                onMouseMove={currentItem.type === 'image' ? handleMouseMove : undefined}
                onMouseLeave={() => {
                  if (zoomScale > 1) {
                    setZoomScale(1)
                    setZoomPosition({ x: 0, y: 0 })
                  }
                }}
              />
            )}

            {/* Zoom controls for main image */}
            {currentItem.type === 'image' && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomIn()
                  }}
                  aria-label="Zoom in"
                  className="absolute right-2 top-2 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-[16px]">zoom_in</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleZoomReset()
                  }}
                  aria-label="Reset zoom"
                  className="absolute right-2 top-12 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded flex items-center justify-center text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald transition-colors z-10"
                >
                  <span className="material-symbols-outlined text-[16px]">refresh</span>
                </button>
              </>
            )}
          </div>

          {/* Prev/Next on main image */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-white/90 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald transition-colors z-10"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-surface-white/90 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald transition-colors z-10"
              >
                <span className="material-symbols-outlined text-[20px]">chevron_right</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            {/* Close */}
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Close viewer"
              className="absolute top-4 right-4 w-10 h-10 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors z-20"
            >
              <span className="material-symbols-outlined text-[24px]">close</span>
            </button>

            {/* Navigation */}
            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={handleLightboxPrev}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors z-20"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_left</span>
                </button>
                <button
                  type="button"
                  onClick={handleLightboxNext}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors z-20"
                >
                  <span className="material-symbols-outlined text-[24px]">chevron_right</span>
                </button>
              </>
            )}

            {/* Zoom Controls */}
            {currentLightboxItem.type === 'image' && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                <button
                  type="button"
                  onClick={handleZoomOut}
                  aria-label="Zoom out"
                  className="w-10 h-10 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_out</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomReset}
                  aria-label="Reset zoom"
                  className="w-10 h-10 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">refresh</span>
                </button>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  aria-label="Zoom in"
                  className="w-10 h-10 bg-surface-white/10 border border-outline-variant/30 rounded-full flex items-center justify-center text-surface-white hover:bg-surface-white/20 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">zoom_in</span>
                </button>
              </div>
            )}

            {/* Media */}
            {!lightboxImgLoaded && currentLightboxItem.type === 'image' && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-surface-white/30 border-t-surface-white rounded-full animate-spin" />
              </div>
            )}

            {currentLightboxItem.type === 'video' ? (
              (() => {
                const ytId = getYouTubeId(currentLightboxItem.src)
                if (ytId) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}?autoplay=0`}
                      title={productName}
                      className="w-full h-full max-h-[80vh]"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  )
                }
                const videoSrc = resolveVideoUrl(currentLightboxItem.src)
                return (
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    className="w-full h-full max-h-[80vh] object-contain"
                    onError={(e) => {
                      e.target.style.display = 'none'
                    }}
                  >
                    Your browser does not support the video tag.
                  </video>
                )
              })()
            ) : (
              <img
                ref={lightboxImgRef}
                src={resolveImageUrl(currentLightboxItem.src)}
                alt={currentLightboxItem.alt || productName}
                onLoad={() => setLightboxImgLoaded(true)}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/800x800?text=No+Image'
                  setLightboxImgLoaded(true)
                }}
                className={`max-w-full max-h-[80vh] object-contain transition-opacity duration-300 ${lightboxImgLoaded ? 'opacity-100' : 'opacity-0'}`}
                style={{
                  transform: `scale(${zoomScale})`,
                  transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  cursor: zoomScale > 1 ? 'grab' : 'zoom-in',
                }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => {
                  if (zoomScale > 1) {
                    setZoomScale(1)
                    setZoomPosition({ x: 0, y: 0 })
                  }
                }}
              />
            )}

            {/* Thumbnail strip at bottom of lightbox */}
            {hasMultiple && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 overflow-x-auto pb-2">
                {mediaItems.map((item, idx) => {
                  const isVideo = item.type === 'video'
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        setLightboxIndex(idx)
                        setZoomScale(1)
                        setLightboxImgLoaded(false)
                      }}
                      className={`w-12 h-12 flex-shrink-0 rounded border-2 overflow-hidden ${
                        idx === lightboxIndex
                          ? 'border-primary'
                          : 'border-outline-variant/30 opacity-60 hover:opacity-100'
                      }`}
                    >
                      {isVideo ? (
                        <div className="w-full h-full bg-surface-container-low flex items-center justify-center">
                          <span className="material-symbols-outlined text-[14px] text-surface-white">
                            play_circle
                          </span>
                        </div>
                      ) : (
                        <img
                          src={resolveImageUrl(item.src)}
                          alt={`Thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/400x400?text=No+Image'
                          }}
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
