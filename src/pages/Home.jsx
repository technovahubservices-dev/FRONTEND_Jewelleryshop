import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import FeaturedProducts from '../components/sections/FeaturedProducts'
import { contentAPI, productAPI } from '../services/api'
import { resolveImageUrl, resolveVideoUrl } from '../utils/apiUrl'
import TestimonialSection from '../components/sections/TestimonialSection'

/* =========================================================
   YOUTUBE HELPERS
   ========================================================= */

const getYouTubeVideoId = (url) => {
  if (!url || typeof url !== 'string') return ''

  const patterns = [
    /youtube\.com\/shorts\/([^/?&]+)/,
    /youtube\.com\/watch\?v=([^/?&]+)/,
    /youtu\.be\/([^/?&]+)/,
    /youtube\.com\/embed\/([^/?&]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)

    if (match?.[1]) {
      return match[1]
    }
  }

  return ''
}

const getYouTubeEmbedUrl = (url) => {
  const videoId = getYouTubeVideoId(url)

  if (!videoId) return ''

  return `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}`
}

const getVideoSourceType = (url) => {
  if (!url || typeof url !== 'string') {
    return 'video'
  }

  const lowerUrl = url.toLowerCase()

  if (
    lowerUrl.includes('youtube.com') ||
    lowerUrl.includes('youtu.be')
  ) {
    return 'youtube'
  }

  if (
    lowerUrl.includes('pin.it') ||
    lowerUrl.includes('pinterest.com')
  ) {
    return 'pinterest'
  }

  if (/\.(mp4|webm|ogg|mov|avi|mpeg)(\?.*)?$/i.test(lowerUrl)) {
    return 'video'
  }

  return 'video'
}

/* =========================================================
   COMPONENT
   ========================================================= */

export default function Home() {
  const [heroBanners, setHeroBanners] = useState([])
  const [promoBanners, setPromoBanners] = useState([])
  const [collections, setCollections] = useState([])
  const [products, setProducts] = useState([])
  const [homepageSettings, setHomepageSettings] = useState(null)

  const [loading, setLoading] = useState(true)
  const [currentImage, setCurrentImage] = useState(0)

  const navigate = useNavigate()

  /* =======================================================
     FETCH HOMEPAGE CONTENT
     ======================================================= */

  useEffect(() => {
    let mounted = true

    const fetchContent = async () => {
      try {
        setLoading(true)

        const [
          heroRes,
          promoRes,
          collectionRes,
          settingsRes,
          productsRes,
        ] = await Promise.allSettled([
          contentAPI.getActive('heroBanners'),
          contentAPI.getActive('promoBanners'),
          contentAPI.getActive('collections'),
          contentAPI.getHomepageSettings(),
          productAPI.getAll(),
        ])

        if (!mounted) return

        /* ---------------- HERO BANNERS ---------------- */

        if (
          heroRes.status === 'fulfilled' &&
          heroRes.value?.data?.success
        ) {
          const data = heroRes.value.data.data

          setHeroBanners(Array.isArray(data) ? data : [])
        } else if (heroRes.status === 'rejected') {
          console.error(
            'Hero banners API failed:',
            heroRes.reason
          )
        }

        /* ---------------- PROMO BANNERS ---------------- */

        if (
          promoRes.status === 'fulfilled' &&
          promoRes.value?.data?.success
        ) {
          const data = promoRes.value.data.data

          setPromoBanners(Array.isArray(data) ? data : [])
        }

        /* ---------------- COLLECTIONS ---------------- */

        if (
          collectionRes.status === 'fulfilled' &&
          collectionRes.value?.data?.success
        ) {
          const data = collectionRes.value.data.data

          setCollections(Array.isArray(data) ? data : [])
        }

        /* ---------------- HOMEPAGE SETTINGS ---------------- */

        if (
          settingsRes.status === 'fulfilled' &&
          settingsRes.value?.data?.success
        ) {
          const settings = settingsRes.value.data.data || {}

          setHomepageSettings(settings)
        } else if (settingsRes.status === 'rejected') {
          console.error(
            '[HOME] Homepage settings API failed:',
            settingsRes.reason
          )
        }

        /* ---------------- PRODUCTS ---------------- */

        if (
          productsRes.status === 'fulfilled' &&
          productsRes.value?.data?.success
        ) {
          const rawProducts = Array.isArray(
            productsRes.value.data.data
          )
            ? productsRes.value.data.data
            : []

          const transformed = rawProducts.map(productAPI.transform)

          setProducts(transformed)
        }
      } catch (error) {
        console.error(
          '[HOME] Failed to fetch homepage content:',
          error
        )
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchContent()

    return () => {
      mounted = false
    }
  }, [])

  /* =======================================================
     HERO DATA
     ======================================================= */

  const cmsHeroSlidesData = useMemo(() => {
    const slides = Array.isArray(homepageSettings?.heroSlides)
      ? homepageSettings.heroSlides
      : []

    return slides.filter(
      (slide) =>
        slide &&
        slide.isActive !== false &&
        (slide.image || slide.url)
    )
  }, [homepageSettings])

  const cmsHeroImages = useMemo(() => {
    const images = []

    /* Main CMS hero image */

    if (homepageSettings?.heroSectionBgImage) {
      const imageUrl = resolveImageUrl(
        homepageSettings.heroSectionBgImage
      )

      if (imageUrl) {
        images.push(imageUrl)
      }
    }

    /* CMS hero slides */

    cmsHeroSlidesData.forEach((slide) => {
      const imageUrl = resolveImageUrl(
        slide.image || slide.url
      )

      if (imageUrl) {
        images.push(imageUrl)
      }
    })

    return [...new Set(images)]
  }, [
    homepageSettings,
    cmsHeroSlidesData,
  ])

  const apiHeroImages = useMemo(() => {
    if (!Array.isArray(heroBanners)) {
      return []
    }

    return heroBanners
      .map((banner) =>
        resolveImageUrl(
          banner?.image ||
          banner?.mobileImage ||
          banner?.url
        )
      )
      .filter(Boolean)
  }, [heroBanners])

  /**
   * Priority:
   *
   * 1. Homepage CMS settings
   * 2. Hero banner API
   * 3. Static fallback
   */
  const heroImages = useMemo(() => {
    if (cmsHeroImages.length > 0) {
      return cmsHeroImages
    }

    if (apiHeroImages.length > 0) {
      return apiHeroImages
    }

    return []
  }, [
    cmsHeroImages,
    apiHeroImages,
  ])

  const usingCmsHero = cmsHeroImages.length > 0

  /* =======================================================
     RESET SLIDER WHEN CONTENT CHANGES
     ======================================================= */

  useEffect(() => {
    setCurrentImage(0)
  }, [heroImages.length])

  /* =======================================================
     HERO AUTO SLIDER
     ======================================================= */

  useEffect(() => {
    if (heroImages.length <= 1) {
      return undefined
    }

    const interval = setInterval(() => {
      setCurrentImage((prev) => {
        return (prev + 1) % heroImages.length
      })
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [heroImages.length])

  /* =======================================================
     ACTIVE HERO
     ======================================================= */

  const activeHero = useMemo(() => {
    if (usingCmsHero) {
      if (
        currentImage === 0 &&
        homepageSettings?.heroSectionBgImage
      ) {
        return {
           title:
             homepageSettings?.heroSectionTitle || '',
        }
      }

      const slideIndex = currentImage - 1

      return cmsHeroSlidesData[slideIndex] || null
    }

    return heroBanners[currentImage] || null
  }, [
    usingCmsHero,
    currentImage,
    homepageSettings,
    cmsHeroSlidesData,
    heroBanners,
  ])

  /* =======================================================
     HERO TEXT
     ======================================================= */

  const heroTitle =
    homepageSettings?.heroSectionTitle || ''

  const heroSubtitle =
    homepageSettings?.heroSectionSubtitle || ''

  const heroDescription =
    homepageSettings?.heroSectionDescription || ''

  const heroCtaText =
    homepageSettings?.heroSectionCtaText ||
    'Explore Collection'

  const heroCtaLink =
    homepageSettings?.heroSectionCtaLink ||
    '/shop'

  /* =======================================================
     CATEGORY DATA
     ======================================================= */

  const categories =
    Array.isArray(homepageSettings?.categories) &&
    homepageSettings.categories.length > 0
      ? homepageSettings.categories
      : []

  /* =======================================================
     COLLECTION SETTINGS
     ======================================================= */

  const collectionSectionTitle =
    homepageSettings?.collectionSectionTitle ||
    'Our Collections'

  const featuredSectionTitle =
    homepageSettings?.featuredSectionTitle ||
    'Featured Products'

  const featuredSectionDescription =
    homepageSettings?.featuredSectionDescription || ''

  const testimonialSectionTitle =
    homepageSettings?.testimonialSectionTitle ||
    'What Our Patrons Say'

  /* =======================================================
     VIDEO REELS
     ======================================================= */

  const reels = useMemo(() => {
    if (
      Array.isArray(homepageSettings?.videoReels) &&
      homepageSettings.videoReels.length > 0
    ) {
      return homepageSettings.videoReels
        .filter(Boolean)
        .map((reel, index) => {
          const rawUrl =
            reel.videoUrl ||
            reel.url ||
            ''

          return {
            id:
              reel._id ||
              reel.id ||
              `cms-reel-${index}`,

            title:
              reel.title ||
              'Jewellery Showcase',

            price: reel.price
              ? `₹ ${Number(
                  reel.price
                ).toLocaleString('en-IN')}`
              : '',

            sourceType:
              reel.sourceType ||
              getVideoSourceType(rawUrl),

            videoUrl: rawUrl,

            thumbnail:
              reel.thumbnail ||
              reel.image ||
              '',

            shopLink:
              reel.shopLink ||
              reel.link ||
              '/shop',
          }
        })
    }

    return []
  }, [homepageSettings])

  /* =======================================================
      FESTIVE EXCLUSIVE
     ======================================================= */

  const activeFestiveImages = useMemo(() => {
    const cmsImages = Array.isArray(
      homepageSettings?.festiveExclusiveImages
    )
      ? homepageSettings.festiveExclusiveImages
      : []

    return cmsImages
      .filter(
        (item) =>
          item &&
          item.isActive !== false &&
          (item.image || item.url)
      )
      .map((item) => ({
        src: resolveImageUrl(
          item.image || item.url
        ),
        alt:
          item.title ||
          item.alt ||
          'Festive Exclusive',
        link:
          item.link ||
          '/shop',
      }))
      .filter((item) => item.src)
  }, [homepageSettings])

  /* =======================================================
     PRODUCT SECTIONS
     ======================================================= */

  const hipChainsTitle =
    homepageSettings?.hipChainsSectionTitle ||
    'The Hip Chain Collection'

  const hipChainsDescription =
    homepageSettings?.hipChainsSectionDescription ||
    ''

  const hipChainsFilter =
    (
      homepageSettings?.hipChainsCategoryFilter ||
      'Hip Chain'
    ).toLowerCase()

  const earringsTitle =
    homepageSettings?.earringsSectionTitle ||
    'Exquisite Earrings Selection'

  const earringsDescription =
    homepageSettings?.earringsSectionDescription ||
    ''

  const earringsFilter =
    (
      homepageSettings?.earringsCategoryFilter ||
      'Earrings'
    ).toLowerCase()

  const hipChainProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() ===
      hipChainsFilter
  )

  const earringsProducts = products.filter(
    (product) =>
      product.category?.toLowerCase() ===
      earringsFilter
  )

  const getProductDisplayPrice = (product) => {
    const price = product.price || 0

    return `₹ ${price.toLocaleString('en-IN')}`
  }

  /* =======================================================
     PRODUCT CARD GRID
     ======================================================= */

  const ProductCardGrid = ({
    products,
    emptyMessage,
  }) => {
    const handleViewProduct = (product) => {
      navigate(`/product/${product.id}`)
    }

    if (
      !products ||
      products.length === 0
    ) {
      return (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant/30 mb-3">
            inventory_2
          </span>

          <p className="font-body-md text-sm text-on-surface-variant">
            {emptyMessage}
          </p>
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
            <div
              className="relative aspect-square bg-surface-container-low flex items-center justify-center p-6 cursor-pointer"
              onClick={() =>
                handleViewProduct(product)
              }
            >
              <img
                className="w-full h-full object-contain"
                alt={product.name}
                src={resolveImageUrl(product.image)}
                onError={(event) => {
                  event.currentTarget.src =
                    'https://placehold.co/400x400?text=Product'
                }}
              />

              {product.discount && (
                <span className="absolute top-3 left-3 bg-deep-emerald text-surface-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {product.discount}
                </span>
              )}

              {product.isNew &&
                !product.discount && (
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
                    ₹{' '}
                    {product.originalPrice.toLocaleString(
                      'en-IN'
                    )}
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

  /* =======================================================
     HERO IMAGE ERROR HANDLER
     ======================================================= */

  const handleHeroImageError = (
    event,
    imageUrl
  ) => {
    console.error(
      '[HOME HERO] Image failed to load:',
      imageUrl
    )

    event.currentTarget.src =
      'https://placehold.co/1600x700?text=JKR+Jewellery'
  }

  /* =======================================================
     RENDER
     ======================================================= */

  return (
    <main className="w-full flex flex-col">
      {/* ===================================================
          HERO SECTION
      =================================================== */}

      {homepageSettings?.heroSectionEnabled !== false && (
      <section className="w-full relative overflow-hidden bg-[#f8f0df]">
        <div className="relative w-full min-h-[220px] md:min-h-[400px]">
          {heroImages.map(
            (image, index) => {
              const isActive =
                index === currentImage

              return (
                <div
                  key={`${image}-${index}`}
                  className={
                    isActive
                      ? 'relative opacity-100 transition-opacity duration-700'
                      : 'absolute inset-0 opacity-0 pointer-events-none transition-opacity duration-700'
                  }
                >
                  <img
                    src={image}
                    alt={
                      isActive
                        ? activeHero?.title ||
                          heroTitle ||
                          'JKR Jewellery Offers'
                        : ''
                    }
                    className="w-full h-auto min-h-[220px] md:min-h-[400px] block object-cover"
                    loading={
                      index === 0
                        ? 'eager'
                        : 'lazy'
                    }
                    decoding="async"
                    onError={(event) =>
                      handleHeroImageError(
                        event,
                        image
                      )
                    }
                  />

                  <div className="absolute inset-0 bg-black/5 pointer-events-none" />
                </div>
              )
            }
          )}
        </div>

        {/* Optional hero text overlay */}
        {(heroTitle ||
          heroSubtitle ||
          heroDescription) && (
          <div className="absolute inset-0 flex items-center pointer-events-none">
            <div className="max-w-7xl w-full mx-auto px-6 md:px-10">
              <div className="max-w-xl pointer-events-auto">
                {heroSubtitle && (
                  <p className="text-sm uppercase tracking-widest text-regal-gold mb-3">
                    {heroSubtitle}
                  </p>
                )}

                {heroTitle && (
                  <h1 className="font-playfair text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg mb-4">
                    {heroTitle}
                  </h1>
                )}

                {heroDescription && (
                  <p className="text-white text-sm md:text-base max-w-lg mb-6 drop-shadow">
                    {heroDescription}
                  </p>
                )}

                <Link
                  to={heroCtaLink}
                  className="inline-flex items-center bg-white text-deep-emerald px-6 py-3 rounded-md text-sm font-semibold hover:bg-regal-gold hover:text-white transition-colors"
                >
                  {heroCtaText}
                </Link>
              </div>
            </div>
          </div>
        )}

        {heroImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={() =>
                setCurrentImage(
                  (prev) =>
                    (prev -
                      1 +
                      heroImages.length) %
                    heroImages.length
                )
              }
              className="absolute left-0 top-0 h-full w-1/4 z-20 cursor-pointer bg-transparent"
              aria-label="Previous slide"
            />

            <button
              type="button"
              onClick={() =>
                setCurrentImage(
                  (prev) =>
                    (prev + 1) %
                    heroImages.length
                )
              }
              className="absolute right-0 top-0 h-full w-1/4 z-20 cursor-pointer bg-transparent"
              aria-label="Next slide"
            />

            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-2">
              {heroImages.map(
                (_, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() =>
                      setCurrentImage(
                        index
                      )
                    }
                    className={`w-2.5 h-2.5 rounded-full transition-all ${
                      index ===
                      currentImage
                        ? 'bg-white scale-125'
                        : 'bg-white/50'
                    }`}
                    aria-label={`Go to slide ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          </>
        )}
      </section>
      )}

      {/* ===================================================
          CATEGORIES
      =================================================== */}

      <section className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
            {homepageSettings?.categorySectionTitle || 'Shop by Category'}
          </h2>

          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            {homepageSettings?.categorySectionDescription || ''}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map(
            (category, index) => {
              const categoryImage =
                resolveImageUrl(
                  category?.image ||
                    category?.url
                )

              return (
                <Link
                  to={
                    category?.link ||
                    '/shop'
                  }
                  key={
                    category?._id ||
                    category?.id ||
                    index
                  }
                  className="group relative h-40 md:h-48 rounded-xl overflow-hidden block border border-outline-variant/10 shadow-sm bg-gray-50"
                >
                  <img
                    src={
                      categoryImage ||
                      'https://placehold.co/500x500?text=Category'
                    }
                    alt={
                      category?.name ||
                      'Category'
                    }
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.src =
                        'https://placehold.co/500x500?text=Category'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  <div className="absolute bottom-3 right-3 text-right flex flex-col items-end z-10">
                    <span className="font-playfair text-base md:text-lg font-bold text-white drop-shadow">
                      {category?.name ||
                        'Category'}
                    </span>

                    <span className="text-[9px] uppercase tracking-wider text-regal-gold font-medium mt-0.5 group-hover:translate-x-1 transition-transform duration-300">
                      Shop Now
                    </span>
                  </div>
                </Link>
              )
            }
          )}
        </div>
      </section>

      {/* ===================================================
          COLLECTIONS
      =================================================== */}

      {collections.length > 0 && (
        <section className="w-full bg-surface-container-low">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
            <div className="text-center mb-16">
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
                {collectionSectionTitle}
              </h2>

              <div className="h-[1px] w-12 bg-regal-gold mx-auto" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {collections
                .slice(0, 4)
                .map(
                  (
                    collection,
                    index
                  ) => {
                    const imageUrl =
                      resolveImageUrl(
                        collection?.image ||
                          collection?.url
                      )

                    return (
                      <div
                        key={
                          collection?._id ||
                          index
                        }
                        className={
                          index === 0
                            ? 'md:col-span-8'
                            : 'md:col-span-4'
                        }
                      >
                        <div className="group cursor-pointer relative overflow-hidden h-[400px] md:h-[500px] rounded-2xl shadow-lg">
                          <div
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                            style={{
                              backgroundImage: `url("${imageUrl}")`,
                            }}
                          />

                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-2xl" />

                          <div
                            className={`absolute bottom-8 ${
                              index === 0
                                ? 'left-8'
                                : 'left-6'
                            } text-surface-white`}
                          >
                            <h3 className="font-headline-md text-headline-md mb-2">
                              {
                                collection?.title
                              }
                            </h3>

                            <Link
                              to={
                                collection?.ctaLink ||
                                '/shop'
                              }
                              className="font-label-caps text-label-caps uppercase tracking-wider flex items-center text-regal-gold"
                            >
                              {collection?.ctaText ||
                                'Shop Now'}

                              <span className="material-symbols-outlined ml-2 text-sm">
                                arrow_forward
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  }
                )}
            </div>
          </div>
        </section>
      )}

      {/* ===================================================
          WHY TRUST US
      =================================================== */}

      <section className="w-full bg-surface-white py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-10">
            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-deep-emerald mb-4">
              Why Trust Us?
            </h2>

            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Your trust is our greatest asset.
              Here&apos;s why thousands of
              customers choose us.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6 md:gap-8">
            {[
              {
                icon: 'groups',
                label: '45,000+',
                sublabel:
                  'Happy Customers',
              },
              {
                icon: 'star',
                label: '4.8/5',
                sublabel:
                  'Customer Rating',
              },
              {
                icon: 'verified',
                label: 'Since 2017',
                sublabel:
                  'Trusted Legacy',
              },
              {
                icon: 'shield',
                label: '100% Secure',
                sublabel:
                  'Payments',
              },
              {
                icon: 'workspace_premium',
                label: 'Premium',
                sublabel:
                  'Collection',
              },
              {
                icon: 'check_circle',
                label: 'Certified',
                sublabel:
                  'Best Quality',
              },
              {
                icon: 'local_shipping',
                label: 'Global',
                sublabel:
                  'Worldwide Shipping',
              },
            ].map(
              (item, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center text-center"
                >
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
              )
            )}
          </div>
        </div>
      </section>

      {/* ===================================================
          FEATURED PRODUCTS
      =================================================== */}

      <section className="w-full bg-surface-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 md:py-24">
          <FeaturedProducts
            title={featuredSectionTitle}
            description={
              featuredSectionDescription
            }
          />
        </div>
      </section>

      {/* ===================================================
          WATCH & SHOP
      =================================================== */}

      <section className="w-full bg-white py-8 md:py-12 border-t border-gray-100">
        <div className="text-center mb-8">
          <h2 className="font-playfair text-3xl md:text-4xl text-[#2c2c2c] italic">
            Watch{' '}
            <span className="font-sans font-light">
              &
            </span>{' '}
            Shop
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-w-7xl mx-auto px-4 md:px-8">
          {reels.map(
            (reel) => {
              const isYouTube =
                reel.sourceType ===
                'youtube'

              const isPinterest =
                reel.sourceType ===
                'pinterest'

              const embedUrl =
                isYouTube
                  ? getYouTubeEmbedUrl(
                      reel.videoUrl
                    )
                  : ''

              const thumbSrc =
                resolveImageUrl(
                  reel.thumbnail
                )

              const videoSrc =
                resolveVideoUrl(
                  reel.videoUrl
                )

              const renderMedia = () => {
                /* ---------------- YOUTUBE ---------------- */

                if (isYouTube) {
                  if (!embedUrl) {
                    return (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <button
                          type="button"
                          onClick={(
                            event
                          ) => {
                            event.preventDefault()
                            event.stopPropagation()

                            if (
                              videoSrc
                            ) {
                              window.open(
                                videoSrc,
                                '_blank',
                                'noopener,noreferrer'
                              )
                            }
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
                      src={
                        embedUrl
                      }
                      title={`${reel.title} Jewellery Video`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  )
                }

                /* ---------------- PINTEREST ---------------- */

                if (isPinterest) {
                  return (
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 p-3">
                      {thumbSrc ? (
                        <img
                          src={
                            thumbSrc
                          }
                          alt={
                            reel.title
                          }
                          className="w-full h-full object-cover"
                          loading="lazy"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              'https://placehold.co/400x700?text=Video'
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="material-symbols-outlined text-4xl">
                            play_circle
                          </span>
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={(
                          event
                        ) => {
                          event.preventDefault()
                          event.stopPropagation()

                          if (
                            reel.videoUrl
                          ) {
                            window.open(
                              reel.videoUrl,
                              '_blank',
                              'noopener,noreferrer'
                            )
                          }
                        }}
                        className="mt-2 text-[10px] font-sans font-medium text-gray-700 hover:text-deep-emerald transition-colors"
                      >
                        View Pin
                      </button>
                    </div>
                  )
                }

                /* ---------------- GOOGLE DRIVE / DIRECT VIDEO ---------------- */

                return (
                  <video
                    src={videoSrc}
                    muted
                    loop
                    playsInline
                    autoPlay
                    preload="metadata"
                    poster={
                      thumbSrc ||
                      undefined
                    }
                    className="w-full h-full object-cover"
                    onError={(
                      event
                    ) => {
                      console.error(
                        '[HOME VIDEO] Failed:',
                        videoSrc
                      )

                      event.currentTarget.style.display =
                        'none'
                    }}
                  />
                )
              }

              return (
                <Link
                  to={
                    reel.shopLink ||
                    reel.link ||
                    '/shop'
                  }
                  key={reel.id}
                  className="flex flex-col aspect-[9/16] w-full rounded-2xl overflow-hidden relative group bg-black shadow-sm"
                >
                  <div className="w-full flex-1 relative overflow-hidden bg-black">
                    {renderMedia()}
                  </div>

                  <div className="bg-white p-3 flex flex-col">
                    <h3 className="line-clamp-2 min-h-[32px] text-xs text-gray-700 font-medium">
                      {reel.title}
                    </h3>

                    {reel.price && (
                      <p className="text-xs text-gray-900 font-semibold mt-1">
                        {reel.price}
                      </p>
                    )}

                    <span className="text-[10px] font-sans font-medium text-gray-500 mt-2 group-hover:text-gray-800 transition-colors">
                      Shop Now
                    </span>
                  </div>
                </Link>
              )
            }
          )}
        </div>
      </section>

      {/* ===================================================
          FESTIVE EXCLUSIVE
      =================================================== */}

      {activeFestiveImages.length > 0 ? (
        <section className="w-full bg-surface-white py-12">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 bg-soft-cream border border-outline-variant/30 overflow-hidden rounded-2xl">
              <div className="p-12 md:p-20 flex flex-col justify-center">
                <span className="font-label-caps text-label-caps uppercase tracking-widest text-regal-gold mb-4">
                  Festive Exclusive
                </span>

                <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-6">
                   {homepageSettings?.festiveExclusiveTitle || ''}
                </h2>

                <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
                   {homepageSettings?.festiveExclusiveDescription || ''}
                </p>

                <a
                  className="self-start border-b border-deep-emerald text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest pb-1 hover:text-regal-gold hover:border-regal-gold transition-colors"
                  href={
                    homepageSettings?.festiveExclusiveCtaLink ||
                    '/shop'
                  }
                >
                  {homepageSettings?.festiveExclusiveCtaText ||
                    'View Collection'}
                </a>
              </div>

                <div className="h-[400px] md:h-auto relative overflow-hidden">
                <div className="heritage-scroll-track">
                  {activeFestiveImages.map(
                    (image, index) => (
                      <div
                        key={index}
                        className="heritage-image"
                      >
                        <img
                          src={image.src}
                          alt={
                            image.alt ||
                            'Heritage Jewellery'
                          }
                          loading="lazy"
                          onError={(
                            event
                          ) => {
                            event.currentTarget.src =
                              'https://placehold.co/600x400?text=Heritage+Jewellery'
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* ===================================================
          TESTIMONIALS
      =================================================== */}

      <TestimonialSection
        title={
          testimonialSectionTitle
        }
        testimonials={
          homepageSettings?.homepageTestimonials
        }
      />
    </main>
  )
}