import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import { resolveImageUrl } from '../../utils/apiUrl'

const FALLBACK_IMAGE = 'https://placehold.co/400x600?text=No+Image'

export default function ProductCard({ product, imagePriority = false }) {
  const {
    id,
    name,
    price,
    originalPrice,
    discount,
    image,
    images = [],
    isOnSale,
    stock,
  } = product

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [imgFailed, setImgFailed] = useState(false)

  const { isInWishlist, toggle } = useWishlist()
  const isWishlisted = isInWishlist(id)

  const allImages = (images.length > 0 ? images : [image]).filter(Boolean)
  const hasMultiple = allImages.length > 1
  const showSaleBadge = isOnSale || Boolean(discount && originalPrice)
  const stockKnown = Number.isFinite(stock)

  const cardRef = useRef(null)

  const currentImageUrl = resolveImageUrl(
    allImages[currentImageIndex] || image || ''
  )

  // Reset image state when the selected image changes.
  useEffect(() => {
    setImgLoaded(false)
    setImgFailed(!currentImageUrl)
  }, [currentImageUrl])

  // Reset carousel when the product changes.
  useEffect(() => {
    setCurrentImageIndex(0)
  }, [id])

  const handlePrev = (e) => {
    e.preventDefault()
    e.stopPropagation()

    setCurrentImageIndex((prev) =>
      prev === 0 ? allImages.length - 1 : prev - 1
    )
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()

    setCurrentImageIndex((prev) =>
      prev === allImages.length - 1 ? 0 : prev + 1
    )
  }

  const handleImageClick = (e) => {
    if (!hasMultiple) return

    e.preventDefault()
    e.stopPropagation()

    setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
  }

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(id)
  }

  // Keyboard navigation for the product image carousel.
  useEffect(() => {
    const card = cardRef.current
    if (!card) return

    const handleKeyDown = (e) => {
      if (!hasMultiple) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentImageIndex((prev) =>
          prev === 0 ? allImages.length - 1 : prev - 1
        )
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentImageIndex((prev) =>
          prev === allImages.length - 1 ? 0 : prev + 1
        )
      }
    }

    card.addEventListener('keydown', handleKeyDown)

    return () => {
      card.removeEventListener('keydown', handleKeyDown)
    }
  }, [hasMultiple, allImages.length])

  const displayedImageUrl = imgFailed
    ? FALLBACK_IMAGE
    : currentImageUrl

  return (
    <Link to={`/product/${id}`} className="group block w-full">
      <div
        ref={cardRef}
        className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
        tabIndex={hasMultiple ? 0 : undefined}
      >
        {/* Product Image with Carousel */}
        <div
          className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low cursor-zoom-in"
          onClick={handleImageClick}
        >
          {/* Loading spinner */}
          {!imgLoaded && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-deep-emerald/20 border-t-deep-emerald rounded-full animate-spin" />
            </div>
          )}

          {/* Product image or fallback */}
          <img
            key={displayedImageUrl}
            className={`object-cover w-full h-full transition-transform duration-700 ease-out ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            } ${hasMultiple ? 'group-hover:scale-105' : ''}`}
            alt={name || 'Jewellery product'}
            src={displayedImageUrl}
            loading={imagePriority ? "eager" : "lazy"}
fetchPriority={imagePriority ? "high" : "auto"}
decoding="async"
            onLoad={() => {
              setImgLoaded(true)
            }}
            onError={(e) => {
              if (!imgFailed) {
                // Switch to the fallback only once.
                setImgFailed(true)
                setImgLoaded(false)
              } else {
                // Do not retry a failed fallback indefinitely.
                setImgLoaded(true)
                e.currentTarget.onerror = null
              }
            }}
          />

          {/* Hover navigation arrows */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface-white hover:text-deep-emerald"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_left
                </span>
              </button>

              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface-white hover:text-deep-emerald"
              >
                <span className="material-symbols-outlined text-[16px]">
                  chevron_right
                </span>
              </button>
            </>
          )}

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={
              isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'
            }
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? 'bg-primary text-surface-white'
                : 'bg-surface-white/80 text-on-surface-variant hover:bg-surface-container-low hover:text-deep-emerald'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[18px] ${
                isWishlisted ? 'filled' : ''
              }`}
            >
              {isWishlisted ? 'favorite' : 'favorite_border'}
            </span>
          </button>

          {/* Image indicator dots */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, idx) => (
                <span
                  key={idx}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    idx === currentImageIndex
                      ? 'bg-primary'
                      : 'bg-outline-variant/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Sale badge */}
          {showSaleBadge && discount && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-error text-surface-white">
              {discount}
            </span>
          )}

          {!stockKnown ? (
            <span className="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded bg-charcoal-text/80 text-surface-white text-[10px] font-label-caps tracking-wide">
              AVAILABILITY UNKNOWN
            </span>
          ) : stock <= 0 ? (
            <span className="absolute top-3 right-3 inline-flex items-center px-2 py-1 rounded bg-error text-surface-white text-[10px] font-label-caps tracking-wide">
              OUT OF STOCK
            </span>
          ) : null}

          {/* New badge */}
          {product.isNew && !showSaleBadge && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-regal-gold text-surface-white">
              New
            </span>
          )}

          {/* Best Seller badge */}
          {product.isBestSeller && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-primary text-surface-white">
              Best Seller
            </span>
          )}
        </div>

        {/* Brand */}
        <div className="text-center px-4 py-2">
          <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant/70 uppercase tracking-wider">
            JKR
          </span>
        </div>

        {/* Product Info */}
        <div className="px-4 pb-4 flex flex-col text-center">
          <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
            {name}
          </h3>

          {/* Pricing */}
          <div className="mb-4">
            <span className="font-headline-md text-lg text-deep-emerald">
              {'\u20b9'} {Number(price || 0).toLocaleString('en-IN')}
            </span>

            {originalPrice != null && originalPrice !== '' && (
              <span className="ml-2 text-xs text-on-surface-variant line-through">
                {'\u20b9'} {Number(originalPrice).toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <span className="flex-1 flex items-center justify-center gap-2 bg-transparent border-2 border-deep-emerald text-deep-emerald px-4 py-2 text-xs font-label-caps text-label-caps uppercase tracking-wider rounded-full hover:bg-deep-emerald hover:text-surface-white transition-all duration-200 shadow-sm">
              View Product
              <span className="material-symbols-outlined text-sm">
                arrow_forward
              </span>
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
