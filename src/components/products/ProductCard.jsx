import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useWishlist } from '../../context/WishlistContext'
import { resolveImageUrl } from '../../utils/apiUrl'

export default function ProductCard({ product }) {
  const { id, name, price, originalPrice, discount, image, images = [], collection, occasion, isOnSale } = product
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [imgLoaded, setImgLoaded] = useState(false)
  const { isInWishlist, toggle } = useWishlist()

  const isWishlisted = isInWishlist(id)

  const allImages = images.length > 0 ? images : [image]
  const hasMultiple = allImages.length > 1
  const showSaleBadge = isOnSale || (discount && originalPrice)

  const cardRef = useRef(null)

  const handlePrev = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
  }

  const handleNext = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
  }

  const handleImageClick = (e) => {
    if (hasMultiple) {
      e.preventDefault()
      e.stopPropagation()
      setCurrentImageIndex((prev) => (prev + 1) % allImages.length)
    }
  }

  const currentImageUrl = resolveImageUrl(allImages[currentImageIndex] || image || '')

  const handleWishlistToggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggle(id)
  }

  // Reset image index when product changes
  useEffect(() => {
    setCurrentImageIndex(0)
    setImgLoaded(false)
  }, [id])

  // Keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!cardRef.current || !cardRef.current.contains(document.activeElement)) return
      if (!hasMultiple) return

      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
      }
    }

    cardRef.current?.addEventListener('keydown', handleKeyDown)
    return () => cardRef.current?.removeEventListener('keydown', handleKeyDown)
  }, [hasMultiple, allImages.length])

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
          {!imgLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-deep-emerald/20 border-t-deep-emerald rounded-full animate-spin" />
            </div>
          )}
          <img
            className={`object-cover w-full h-full transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'} ${hasMultiple ? 'group-hover:scale-105' : ''}`}
            alt={name}
            src={currentImageUrl}
            onLoad={() => setImgLoaded(true)}
            onError={(e) => {
              e.target.src = 'https://placehold.co/400x600?text=No+Image'
              setImgLoaded(true)
            }}
            loading="lazy"
          />

          {/* Hover navigation arrows (desktop, 2+ images only) */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous product image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface-white hover:text-deep-emerald"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next product image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-surface-white/80 border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-surface-white hover:text-deep-emerald"
              >
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </>
          )}

          {/* Wishlist heart */}
          <button
            type="button"
            onClick={handleWishlistToggle}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
              isWishlisted
                ? 'bg-primary text-surface-white'
                : 'bg-surface-white/80 text-on-surface-variant hover:bg-surface-container-low hover:text-deep-emerald'
            }`}
          >
            <span className={`material-symbols-outlined text-[18px] ${isWishlisted ? 'filled' : ''}`}>
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

          {/* Badges */}
          {showSaleBadge && discount && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-error text-surface-white">
              {discount}
            </span>
          )}
          {product.isNew && !showSaleBadge && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-regal-gold text-surface-white">
              New
            </span>
          )}
          {product.isBestSeller && !showSaleBadge && (
            <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-primary text-surface-white">
              Best Seller
            </span>
          )}
          {product.isBestSeller && showSaleBadge && (
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
              ₹ {price.toLocaleString('en-IN')}
            </span>
            {originalPrice && (
              <span className="ml-2 text-xs text-on-surface-variant line-through">
                ₹ {originalPrice.toLocaleString('en-IN')}
              </span>
            )}
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/product/${id}`}
              className="flex-1 flex items-center justify-center gap-2 bg-transparent border-2 border-deep-emerald text-deep-emerald px-4 py-2 text-xs font-label-caps text-label-caps uppercase tracking-wider rounded-full hover:bg-deep-emerald hover:text-surface-white transition-all duration-200 shadow-sm"
              onClick={(e) => e.stopPropagation()}
            >
              View Product
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>
    </Link>
  )
}
