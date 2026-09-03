import { useState, useEffect, useCallback } from 'react';
import { contentAPI } from '../../services/api';
import { resolveImageUrl } from '../../utils/apiUrl';

const FALLBACK_TESTIMONIALS = [
  {
    id: 1,
    name: 'Priya',
    title: 'chennai, India',
    content: 'Absolutely stunning craftsmanship! The gold pendant I purchased exceeded all my expectations. The attention to detail is remarkable.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1599058915056-ac68a6e4f86a?w=150&h=150&fit=crop',
  },
  {
    id: 2,
    name: 'Rahul',
    title: 'Vilupuram, India',
    content: 'Best online jewellery shopping experience! The diamond studs are absolutely breathtaking. Will definitely shop again.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1535713874-361094455634?w=150&h=150&fit=crop',
  },
  {
    id: 3,
    name: 'Ananya',
    title: 'Bangalore, India',
    content: 'Exceptional quality and beautiful packaging. The heritage collection bangles are simply gorgeous. Highly recommend!',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1494790115237-4c3e1f6b4d3a?w=150&h=150&fit=crop',
  },
  {
    id: 4,
    name: 'Sneha',
    title: 'Kadalur, India',
    content: 'The Kundan necklace set I ordered was exactly as shown on the website. Fast delivery and excellent packaging.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=150&h=150&fit=crop',
  },
  {
    id: 5,
    name: 'Vikram',
    title: 'selam, India',
    content: 'I bought a pair of jhumkas and they are even more beautiful in person. Great quality and reasonable prices.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop',
  },
  {
    id: 6,
    name: 'Meera',
    title: 'Pondicherry, India',
    content: 'Amazing collection of temple jewellery. The finish is exquisite and the designs are truly unique.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop',
  },
  {
    id: 7,
    name: 'Arjun ',
    title: 'Kovai, India',
    content: 'Purchased a gold chain for my wife. She loved it! The customer service was very helpful.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop',
  },
  {
    id: 8,
    name: 'Kavya ',
    title: 'Chennai, India',
    content: 'The pearl earrings are so elegant. Perfect for daily wear and special occasions alike.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop',
  },
  {
    id: 9,
    name: 'Rohan',
    title: 'Puducherry, India',
    content: 'Beautiful meenakari bangles. The colors are vibrant and the craftsmanship is top-notch.',
    rating: 5,
    image: 'https://images.unsplash.com/photo-1464863976061-4f687ae9a9c5?w=150&h=150&fit=crop',
  },
]

export default function TestimonialSection({ title }) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(3)

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await contentAPI.getActive('testimonials')
        if (response.data.success && response.data.data.length > 0) {
          setTestimonials(response.data.data.slice(0, 9))
        } else {
          setTestimonials(FALLBACK_TESTIMONIALS)
        }
      } catch (err) {
        setTestimonials(FALLBACK_TESTIMONIALS)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setItemsPerSlide(1)
      } else if (window.innerWidth < 1024) {
        setItemsPerSlide(2)
      } else {
        setItemsPerSlide(3)
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const totalSlides = Math.max(1, Math.ceil(testimonials.length / itemsPerSlide))
    setCurrentSlide((prev) => Math.min(prev, totalSlides - 1))
  }, [testimonials.length, itemsPerSlide])

  useEffect(() => {
    if (testimonials.length <= itemsPerSlide) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const totalSlides = Math.ceil(testimonials.length / itemsPerSlide)
        return (prev + 1) % totalSlides
      })
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length, itemsPerSlide])

  const goToSlide = useCallback((index) => {
    const totalSlides = Math.max(1, Math.ceil(testimonials.length / itemsPerSlide))
    if (totalSlides <= 1) return
    setCurrentSlide(((index % totalSlides) + totalSlides) % totalSlides)
  }, [testimonials.length, itemsPerSlide])

  const goNext = useCallback(() => {
    goToSlide(currentSlide + 1)
  }, [currentSlide, goToSlide])

  const goPrev = useCallback(() => {
    goToSlide(currentSlide - 1)
  }, [currentSlide, goToSlide])

  if (loading) {
    return null
  }

  const testimonialsToShow = testimonials.length > 0 ? testimonials : FALLBACK_TESTIMONIALS
  const totalSlides = Math.max(1, Math.ceil(testimonialsToShow.length / itemsPerSlide))

  return (
    <section className="w-full bg-[#173B2D] py-8 md:py-6">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#FDFBF7] mb-4">
            {title || 'What Our Customers Say'}
          </h2>
          <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
        </div>

        <div className="relative">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {Array.from({ length: totalSlides }).map((_, slideIndex) => (
                <div
                  key={slideIndex}
                  className="w-full flex-shrink-0"
                >
                  <div
                    className="grid gap-6 px-1"
                    style={{ gridTemplateColumns: `repeat(${itemsPerSlide}, minmax(0, 1fr))` }}
                  >
                    {testimonialsToShow.slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide).map((testimonial) => (
                      <div
                        key={testimonial._id || testimonial.id}
                        className="bg-[#faf9f6] p-6 rounded-xl border border-outline-variant/20 shadow-sm flex flex-col h-full"
                      >
                        <div className="flex text-regal-gold mb-4" style={{ fontSize: '18px' }}>
                          {'★'.repeat(testimonial.rating || 5)}{'☆'.repeat(5 - (testimonial.rating || 5))}
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant italic flex-1 mb-4">
                          &quot;{testimonial.content}&quot;
                        </p>
                        <div className="flex items-center gap-3 mt-auto">
                          {testimonial.image ? (
                            <img
                              src={resolveImageUrl(testimonial.image)}
                              alt={testimonial.name}
                              className="w-12 h-12 rounded-full object-cover border border-outline-variant/30"
                              onError={(e) => {
                                e.target.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-deep-emerald flex items-center justify-center text-surface-white font-bold">
                              {testimonial.name?.charAt(0) || '?'}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-deep-emerald">{testimonial.name}</p>
                            <p className="text-xs text-on-surface-variant">{testimonial.title}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {totalSlides > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 bg-[#173B2D] text-[#FDFBF7] hover:text-regal-gold w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Previous testimonials"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                onClick={goNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 bg-[#173B2D] text-[#FDFBF7] hover:text-regal-gold w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-colors"
                aria-label="Next testimonials"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}

          {totalSlides > 1 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: totalSlides }).map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => goToSlide(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === idx ? 'w-6 bg-regal-gold' : 'w-2 bg-[#FDFBF7]/30 hover:bg-[#FDFBF7]/60'
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
