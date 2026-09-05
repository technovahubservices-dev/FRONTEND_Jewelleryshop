import { useState, useEffect, useCallback } from 'react';
import { contentAPI } from '../../services/api';
import { resolveImageUrl } from '../../utils/apiUrl';

export default function TestimonialSection({ title, testimonials: propTestimonials }) {
  const [testimonials, setTestimonials] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [itemsPerSlide, setItemsPerSlide] = useState(3)

  useEffect(() => {
    if (propTestimonials && propTestimonials.length > 0) {
      setTestimonials(propTestimonials.filter((t) => t.isActive !== false))
      setLoading(false)
      return
    }
    const fetchTestimonials = async () => {
      try {
        const response = await contentAPI.getActive('testimonials')
        if (response.data.success && response.data.data.length > 0) {
          setTestimonials(response.data.data.slice(0, 9))
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchTestimonials()
  }, [propTestimonials])

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

  if (testimonials.length === 0) {
    return null
  }

  const totalSlides = Math.max(1, Math.ceil(testimonials.length / itemsPerSlide))

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
                    {testimonials.slice(slideIndex * itemsPerSlide, slideIndex * itemsPerSlide + itemsPerSlide).map((testimonial) => (
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
                            <p className="text-xs text-on-surface-variant">{testimonial.title || testimonial.location}</p>
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
