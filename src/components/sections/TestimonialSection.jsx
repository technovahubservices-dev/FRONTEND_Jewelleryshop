import { useState, useEffect } from 'react';
import { contentAPI } from '../../services/api';

export default function TestimonialSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await contentAPI.getActive('testimonials');
        if (response.data.success) {
          setTestimonials(response.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch testimonials:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  if (loading || testimonials.length === 0) {
    return null;
  }

  const displayTestimonials = testimonials.slice(0, 4);

  return (
    <section className="w-full bg-surface-white py-16 md:py-24">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">
            What Our Customers Say
          </h2>
          <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-gutter">
          {displayTestimonials.map((testimonial) => (
            <div
              key={testimonial._id}
              className="bg-surface-container-low rounded-lg p-6 border border-outline-variant/30 flex flex-col h-full"
            >
              <div className="flex text-regal-gold mb-4" style={{ fontSize: '18px' }}>
                {'★'.repeat(testimonial.rating || 5)}{'☆'.repeat(5 - (testimonial.rating || 5))}
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-4 flex-1 italic">
                "{testimonial.content}"
              </p>
              <div className="flex items-center gap-3 mt-4">
                {testimonial.image ? (
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover border border-outline-variant/30"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-deep-emerald font-bold">
                    {testimonial.name?.charAt(0) || '?'}
                  </div>
                )}
                <div>
                  <p className="font-medium text-deep-emerald">{testimonial.name}</p>
                  {testimonial.title && (
                    <p className="text-xs text-on-surface-variant">{testimonial.title}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
