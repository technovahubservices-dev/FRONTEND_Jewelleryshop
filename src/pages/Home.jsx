import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FeaturedProducts from '../components/sections/FeaturedProducts'
import { contentAPI, productAPI } from '../services/api'
import { getMediaUrl } from '../utils/apiUrl'
import TestimonialSection from '../components/sections/TestimonialSection'
import heroPageImage from '../assets/images/homepage.png'

const DEFAULT_CATEGORIES = [
  { id: 'rings', name: 'Rings', image: 'https://cdn.orra.co.in/media/catalog/product/cache/10238651d5f95594b9023f998383bb67/e/r/erg26k54_2_tbruvc5lylrqqokd.jpg', link: '/shop?category=rings' },
  { id: 'necklaces', name: 'Necklaces', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTRpWHGAj2EILbwTkdIELJpE0ZYR_ALWWvOBEql9MSYnGrDxsginLplxZuY&s=10', link: '/shop?category=necklaces' },
  { id: 'bangles', name: 'Bangles', image: 'https://www.tanishq.co.in/dw/image/v2/BKCK_PRD/on/demandware.static/-/Sites-Tanishq-product-catalog/default/dw6d8828ac/images/hi-res/51O5B1VOI2AP3_1.jpg?sw=640&sh=640', link: '/shop?category=bangles' },
  { id: 'chokers', name: 'Chokers', image: 'https://krishnajewellers.com/cdn/shop/files/diamondchokernecklace.jpg?v=1786531639&width=720', link: '/shop?category=chokers' },
  { id: 'hip-chains', name: 'Hip Chains', image: 'https://www.shaburis.com/cdn/shop/products/il_fullxfull.2812186100_6ip0.jpg?v=1662406419', link: '/shop?category=hip-chains' },
  { id: 'earrings', name: 'Earrings', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnK1c1YLdakh6k53-uzfFViGrbAl8-pzQmiV3928ewiRm1QomZEblO87GT&s=10', link: '/shop?category=earrings' }
];

const DEFAULT_REELS = [
  {
    id: 'reel-1',
    title: 'Elegant Earrings',
    sourceType: 'pinterest',
    videoUrl: 'https://pin.it/65A6lkLZ4',
    thumbnail: '',
    shopLink: '/shop?category=earrings'
  },
  {
    id: 'reel-2',
    title: 'Premium Necklace',
    sourceType: 'youtube',
    videoUrl: 'https://youtube.com/shorts/3vd0AHgf5OA?si=60TbbBVDtJ37FfVD',
    shopLink: '/shop?category=necklaces'
  },
  {
    id: 'reel-3',
    title: 'Diamond Earrings',
    sourceType: 'youtube',
    videoUrl: 'https://youtube.com/shorts/6M1DjLAY-1Q?si=oN89-aR1sKJeYlvI',
    shopLink: '/shop?category=earrings'
  },
  {
    id: 'reel-4',
    title: 'Traditional Hip Chain',
    sourceType: 'youtube',
    videoUrl: 'https://youtube.com/shorts/1NJXzHqYtP0?si=I_5hp2Pi5BZCTg5n',
    shopLink: '/shop?category=hip-chains'
  },
  {
    id: 'reel-5',
    title: 'Premium Gold Chain',
    sourceType: 'youtube',
    videoUrl: 'https://youtube.com/shorts/0w_ZOW19HJI?si=RBD0U0B4UVHKjYLC',
    shopLink: '/shop?category=chains'
  }
];

const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return ''
  const patterns = [
    /(?:youtube\.com\/shorts\/)([^\/\?\&]+)/,
    /(?:youtube\.com\/watch\?v=)([^\/\?\&]+)/,
    /(?:youtu\.be\/)([^\/\?\&]+)/,
    /(?:youtube\.com\/embed\/)([^\/\?\&]+)/
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) return match[1]
  }
  return ''
}

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url)
  if (!videoId) return ''
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`
}

const getVideoSourceType = (url) => {
  if (!url || typeof url !== 'string') return 'video'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('pin.it') || url.includes('pinterest.com')) return 'pinterest'
  if (/\.(mp4|webm|ogg)(\?.*)?$/i.test(url)) return 'video'
  return 'video'
}

const isGoogleDriveUrl = (url) => {
  if (!url || typeof url !== 'string') return false
  return /https?:\/\/(?:drive\.)?google\.com/i.test(url)
}

const getGoogleDriveImageUrl = (url) => {
  if (!isGoogleDriveUrl(url)) return url

  const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/[?&]id=([a-zA-Z0-9_-]+)/)
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`
  }

  return url
}

const fallbackHeroImages = [heroPageImage]

export default function Home() {
  const [heroBanners, setHeroBanners] = useState([])
  const [promoBanners, setPromoBanners] = useState([])
  const [collections, setCollections] = useState([])
  const [products, setProducts] = useState([])
  const [homepageSettings, setHomepageSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [heroRes, promoRes, collectionRes, settingsRes, productsRes] = await Promise.allSettled([
          contentAPI.getActive('heroBanners'),
          contentAPI.getActive('promoBanners'),
          contentAPI.getActive('collections'),
          contentAPI.getHomepageSettings(),
          productAPI.getAll(),
        ])

        if (heroRes.status === 'fulfilled' && heroRes.value.data.success) {
          setHeroBanners(heroRes.value.data.data || [])
        }
        if (promoRes.status === 'fulfilled' && promoRes.value.data.success) {
          setPromoBanners(promoRes.value.data.data || [])
        }
        if (collectionRes.status === 'fulfilled' && collectionRes.value.data.success) {
          setCollections(collectionRes.value.data.data || [])
        }
        if (settingsRes.status === 'fulfilled' && settingsRes.value.data.success) {
          setHomepageSettings(settingsRes.value.data.data)
        }
        if (productsRes.status === 'fulfilled' && productsRes.value.data.success) {
          const transformed = productsRes.value.data.data.map(productAPI.transform)
          setProducts(transformed)
        }
      } catch (err) {
        console.error('Failed to fetch content:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchContent()
  }, [])

  const heroImages = homepageSettings?.heroSectionBgImage
    ? [getMediaUrl(homepageSettings.heroSectionBgImage)]
    : heroBanners.length > 0
      ? heroBanners.map((b) => getMediaUrl(b.image || b.mobileImage)).filter(Boolean)
      : fallbackHeroImages

  const [currentImage, setCurrentImage] = useState(0)

  useEffect(() => {
    setCurrentImage(0)
    if (heroImages.length <= 1) return
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroImages.length])

  const categories = homepageSettings?.categories && homepageSettings.categories.length > 0
    ? homepageSettings.categories
    : DEFAULT_CATEGORIES

  const displayCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES

  const reels = homepageSettings?.videoReels && homepageSettings.videoReels.length > 0
    ? homepageSettings.videoReels.map((reel, idx) => {
        const rawUrl = reel.videoUrl || reel.url || ''
        return {
          id: reel._id || idx,
          title: reel.title || 'Jewellery Showcase',
          price: reel.price ? `₹ ${Number(reel.price).toLocaleString('en-IN')}` : '',
          sourceType: reel.sourceType || getVideoSourceType(rawUrl),
          videoUrl: rawUrl,
          thumbnail: reel.thumbnail || '',
          shopLink: reel.shopLink || reel.link || '/shop',
        }
      })
    : DEFAULT_REELS

  const displayReels = reels && reels.length > 0 ? reels : DEFAULT_REELS

  const activeHero = heroBanners[currentImage]

  const heroTitle = homepageSettings?.heroSectionTitle || ''
  const heroSubtitle = homepageSettings?.heroSectionSubtitle || ''
  const heroDescription = homepageSettings?.heroSectionDescription || ''
  const heroCtaText = homepageSettings?.heroSectionCtaText || 'Explore Collection'
  const heroCtaLink = homepageSettings?.heroSectionCtaLink || '/shop'

  const collectionSectionTitle = homepageSettings?.collectionSectionTitle || 'Our Collections'
  const featuredSectionTitle = homepageSettings?.featuredSectionTitle || 'Featured Products'
  const featuredSectionDescription = homepageSettings?.featuredSectionDescription || 'Handpicked selections of our most cherished pieces, crafted with exceptional care and timeless elegance.'
  const testimonialSectionTitle = homepageSettings?.testimonialSectionTitle || 'What Our Patrons Say'

  const hipChainsTitle = homepageSettings?.hipChainsSectionTitle || 'The Hip Chain Collection'
  const hipChainsDescription = homepageSettings?.hipChainsSectionDescription || ''
  const hipChainsFilter = (homepageSettings?.hipChainsCategoryFilter || 'Hip Chain').toLowerCase()
  const earringsTitle = homepageSettings?.earringsSectionTitle || 'Exquisite Earrings Selection'
  const earringsDescription = homepageSettings?.earringsSectionDescription || ''
  const earringsFilter = (homepageSettings?.earringsCategoryFilter || 'Earrings').toLowerCase()

  const hipChainProducts = products.filter(
    (p) => p.category?.toLowerCase() === hipChainsFilter
  )

  const earringsProducts = products.filter(
    (p) => p.category?.toLowerCase() === earringsFilter
  )

  const getProductDisplayPrice = (product) => {
    const price = product.price || 0
    return `₹ ${price.toLocaleString('en-IN')}`
  }

  const ProductCardGrid = ({ products, emptyMessage }) => {
    const handleViewProduct = (product) => {
      navigate(`/product/${product.id}`)
    }

    if (!products || products.length === 0) {
      return (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">
            inventory_2
          </span>
          <p className="font-body-md text-sm text-on-surface-variant">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group"
          >
            <div className="relative aspect-square bg-surface-container-low flex items-center justify-center p-6 cursor-pointer" onClick={() => handleViewProduct(product)}>
              <img
                className="w-full"
                alt={product.name}
                src={product.image}
                onError={(e) => {
                  e.target.src = 'https://placehold.co/400x400'
                }}
              />
              {product.discount && (
                <span className="absolute top-3 left-3 bg-deep-emerald text-surface-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {product.discount}
                </span>
              )}
              {product.isNew && !product.discount && (
                <span className="absolute top-3 left-3 bg-charcoal-text text-surface-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  NEW
                </span>
              )}
            </div>

            <div className="text-center px-4 py-2">
              <span className="font-label-caps text-label-caps text-xs text-on-surface-variant/70 uppercase tracking-wider">
                JKR
              </span>
            </div>

            <div className="px-4 pb-4 flex flex-col text-center">
              <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                {product.name}
              </h3>

              <div className="mb-4">
                <span className="font-headline-md text-lg text-deep-emerald">
                  {getProductDisplayPrice(product)}
                </span>
                {product.originalPrice && (
                  <span className="ml-2 text-xs text-on-surface-variant line-through">
                    ₹ {product.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <Link
                to={`/product/${product.id}`}
                className="text-xs font-label-caps text-label-caps text-deep-emerald hover:text-regal-gold text-center"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <main className="w-full flex flex-col">
      {/* Hero Section */}
      <section className="w-full relative overflow-hidden bg-[#f8f0df]">
  <div className="relative w-full">
    {heroImages.map((image, index) => {
      const isActive = index === currentImage

      return (
        <div
          key={index}
          className={`${
            isActive
              ? "relative opacity-100"
              : "absolute inset-0 opacity-0 pointer-events-none"
          } transition-opacity duration-700`}
        >
           <img
                 src={getGoogleDriveImageUrl(image)}
             alt={isActive ? (activeHero?.title || "JKR Jewellery Offers") : ""}
            className="w-full h-auto block object-contain"
          />

          <div className="absolute inset-0 bg-black/5"></div>
        </div>
      )
    })}
  </div>

  {heroImages.length > 1 && (
    <>
      <button
        onClick={() =>
          setCurrentImage(
            (prev) => (prev - 1 + heroImages.length) % heroImages.length
          )
        }
        className="absolute left-0 top-0 h-full w-1/3 z-20 cursor-pointer bg-transparent"
        aria-label="Previous slide"
      />

      <button
        onClick={() =>
          setCurrentImage((prev) => (prev + 1) % heroImages.length)
        }
        className="absolute right-0 top-0 h-full w-1/3 z-20 cursor-pointer bg-transparent"
        aria-label="Next slide"
      />
    </>
  )}
</section>
      {/* Explore Our Categories Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
            Explore Our Categories
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Handcrafted collections curated for every style and occasion.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {displayCategories.map((category) => (
            <Link
              to={category.link || '/shop'}
              key={category._id || category.id}
              className="group relative h-40 md:h-48 rounded-xl overflow-hidden block border border-outline-variant/10 shadow-sm bg-gray-50"
            >
               <img
                 src={getMediaUrl(category.image)}
                 alt={category.name}
                 className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                 onError={(e) => {
                   e.target.src = 'https://placehold.co/500x500'
                 }}
               />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"></div>
              <div className="absolute bottom-3 right-3 text-right flex flex-col items-end z-10">
                <span className="font-playfair text-base md:text-lg font-bold text-white drop-shadow">
                  {category.name || 'Category'}
                </span>
                <span className="text-[9px] uppercase tracking-wider text-regal-gold font-medium mt-0.5 group-hover:translate-x-1 transition-transform duration-300">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Dynamic Collections */}
      {collections.length > 0 && (
        <section className="w-full bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
                {collectionSectionTitle}
              </h2>
              <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {collections.slice(0, 4).map((collection, idx) => (
                <div
                  key={collection._id || idx}
                  className={idx === 0 ? "md:col-span-8" : "md:col-span-4"}
                >
                  <div className="group cursor-pointer relative overflow-hidden h-[400px] md:h-[500px] rounded-2xl shadow-lg">
                   <div
                       className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                       style={{ backgroundImage: `url('${getMediaUrl(collection.image)}')` }}
                   ></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl"></div>
                    <div className={`absolute bottom-8 ${idx === 0 ? 'left-8' : 'left-6'} text-surface-white`}>
                      <h3 className="font-headline-md text-headline-md mb-2">{collection.title}</h3>
                      <Link
                        to={collection.ctaLink || '/shop'}
                        className="font-label-caps text-label-caps uppercase tracking-wider flex items-center text-regal-gold"
                      >
                        {collection.ctaText || 'Shop Now'}
                        <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Why Trust Us */}
      <section className="w-full bg-surface-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
              Why Trust Us?
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Your trust is our greatest asset. Here&apos;s why thousands of customers choose us.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8">
            {[
              { icon: 'groups', label: '45,000+', sublabel: 'Happy Customers' },
              { icon: 'star', label: '4.8/5', sublabel: 'Customer Rating' },
              { icon: 'verified', label: 'Since 2017', sublabel: 'Trusted Legacy' },
              { icon: 'shield', label: '100% Secure', sublabel: 'Payments' },
              { icon: 'workspace_premium', label: 'Premium', sublabel: 'Collection' },
              { icon: 'check_circle', label: 'Certified', sublabel: 'Best Quality' },
              { icon: 'local_shipping', label: 'Global', sublabel: 'Worldwide Shipping' },
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col items-center text-center">
                <span className="material-symbols-outlined text-regal-gold text-3xl md:text-4xl mb-2">
                  {item.icon}
                </span>
                <p className="font-headline-md text-headline-md text-deep-emerald font-semibold text-sm md:text-base">
                  {item.label}
                </p>
                <p className="text-[10px] md:text-xs text-on-surface-variant mt-1">
                  {item.sublabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="w-full bg-surface-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <FeaturedProducts title={featuredSectionTitle} description={featuredSectionDescription} />
        </div>
      </section>

      {/* Watch & Shop Video Reel Grid */}
      <section className="w-full bg-white py-8 md:py-12 border-t border-gray-100">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-3xl md:text-4xl text-[#2c2c2c] italic">
            Watch <span className="font-sans font-light">&</span> Shop
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-7xl mx-auto px-4 md:px-8">
          {displayReels.map((reel) => {
             const isYouTube = reel.sourceType === 'youtube'
             const isPinterest = reel.sourceType === 'pinterest'
             const embedUrl = isYouTube ? getYouTubeEmbedUrl(reel.videoUrl) : ''
             const thumbSrc = getMediaUrl(reel.thumbnail) || ''
             const videoSrc = getMediaUrl(reel.videoUrl)

            const renderMedia = () => {
              if (isYouTube) {
                if (!embedUrl) {
                  return (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100">
                       <button
                         type="button"
                         onClick={(e) => {
                           e.preventDefault()
                           e.stopPropagation()
                           window.open(videoSrc, '_blank', 'noopener,noreferrer')
                         }}
                         className="text-xs text-deep-emerald underline text-center px-2"
                       >
                         Watch Video
                       </button>
                    </div>
                  )
                }
                return (
                  <iframe
                    src={embedUrl}
                    title={`${reel.title} Jewellery Video`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              }

              if (isPinterest) {
                return (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-3">
                    {thumbSrc ? (
                      <img
                        src={thumbSrc}
                        alt={reel.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <span className="material-symbols-outlined text-4xl">play_circle</span>
                      </div>
                    )}
                     <button
                       type="button"
                       onClick={(e) => {
                         e.preventDefault()
                         e.stopPropagation()
                         window.open(videoSrc, '_blank', 'noopener,noreferrer')
                       }}
                       className="mt-2 text-[10px] font-sans font-medium text-gray-700 hover:text-deep-emerald transition-colors"
                     >
                       View Pin
                     </button>
                  </div>
                )
              }

              return (
                 <video
                   src={videoSrc}
                   muted
                   loop
                   playsInline
                   autoPlay
                   preload="metadata"
                   poster={thumbSrc}
                   className="w-full h-full object-cover flex-1"
                   onError={(e) => {
                     if (thumbSrc) {
                       e.target.style.display = 'none'
                     }
                   }}
                 />
              )
            }

            return (
              <Link
                to={reel.shopLink || reel.link || '/shop'}
                key={reel.id}
                className="flex flex-col aspect-[9/16] w-full rounded-2xl overflow-hidden relative group bg-black shadow-sm block"
              >
                <div className="w-full flex-1 relative overflow-hidden bg-black">
                  {renderMedia()}
                </div>
                <div className="bg-white p-3 flex flex-col">
                  <h3 className="line-clamp-2 min-h-[32px] text-xs text-gray-700 font-medium">{reel.title}</h3>
                  <p className="text-xs text-gray-900 font-semibold mt-1">{reel.price}</p>
                  <span className="text-[10px] font-sans font-medium text-gray-500 mt-2 group-hover:text-gray-800 transition-colors">
                    Shop Now
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      

      {/* Fallback Promotional Banner */}
      {promoBanners.length === 0 && (
        <section className="w-full bg-surface-white py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 bg-soft-cream border border-outline-variant/30 overflow-hidden rounded-2xl">
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-regal-gold mb-4">Festive Exclusive</span>
                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-6">The Heritage Collection</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
                  Embrace tradition with our intricately crafted pieces that blend timeless design with contemporary elegance. Perfect for the upcoming celebrations.
                </p>
                <a className="self-start border-b border-deep-emerald text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest pb-1 hover:text-regal-gold hover:border-regal-gold transition-colors" href="/shop">View Collection</a>
              </div>
              <div className="h-[400px] md:h-auto relative overflow-hidden">
                <div className="heritage-scroll-track">
                  <div className="heritage-image"><img src="https://www.manyavar.com/dw/image/v2/BJZV_PRD/on/demandware.static/-/Library-Sites-ManyavarSharedLibrary/default/dw3253c2aa/Trending%20Designs%20in%20Gold%20for%20Your%20Wedding%20Jewellery%20Ranging%20from%20Mangtika%20to%20Payal_Blog%201.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSutUpjNGc45KN29WX8AP9CgEHDWRlmU6dJBX3XgnxJk-zJspTtSLZ5S0&s=10.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://www.abhushanjewellers.com/wp-content/uploads/2025/09/Gold-jewellery-1200x1200_123-copy_123-copy-3.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://www.totaramsons.com/assets/images/goldcat.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://parekhjewellersltd.com/wp-content/uploads/2024/03/about-us-banner1-1.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://placehold.co/600x400?text=Heritage+Jewellery" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80" alt="Heritage Jewellery" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Customer Testimonials */}
      <TestimonialSection title={testimonialSectionTitle} />
    </main>
  )
}
