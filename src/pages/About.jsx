import { useEffect, useState } from 'react'

const highlights = [
  {
    icon: 'diamond',
    title: 'Timeless Design',
    text: 'Our jewellery is designed with an elegant balance of classic beauty and contemporary style.',
  },
  {
    icon: 'auto_awesome',
    title: 'Fine Craftsmanship',
    text: 'Every piece reflects careful attention to detail, refined finishing, and a passion for beautiful craftsmanship.',
  },
  {
    icon: 'favorite',
    title: 'Made With Care',
    text: 'From choosing each design to the final finish, we focus on creating jewellery you can treasure for years.',
  },
]

export default function About() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="min-h-screen bg-soft-cream px-margin-desktop py-16">
      <div className="max-w-container-max mx-auto">

        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-regal-gold mb-4">
            About JKR Jewellery
          </p>

          <h1 className="font-headline-lg text-headline-lg text-deep-emerald mb-6">
            Timeless Elegance, Crafted With Purpose
          </h1>

          <p className="text-on-surface-variant leading-8 mb-6">
            JKR Jewellery brings together timeless elegance, thoughtful design,
            and beautiful craftsmanship to create jewellery for life's most
            meaningful moments.
          </p>

          <p className="text-on-surface-variant leading-8">
            We believe jewellery is more than an accessory. It is a reflection
            of personality, memories, celebrations, and the moments that stay
            with us. Every JKR piece is created with a focus on refined beauty,
            quality, and lasting appeal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          {highlights.map((item, index) => (
            <div
              key={item.title}
              className={`text-center p-8 border border-regal-gold/30 bg-white/40 transition-all duration-700 ${
                visible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${index * 180}ms` }}
            >
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full border border-regal-gold flex items-center justify-center animate-pulse">
                  <span className="material-symbols-outlined text-regal-gold text-3xl">
                    {item.icon}
                  </span>
                </div>
              </div>

              <h2 className="font-playfair text-xl text-deep-emerald mb-3">
                {item.title}
              </h2>

              <p className="text-on-surface-variant leading-7 text-sm">
                {item.text}
              </p>
            </div>
          ))}
        </div>

        <div
          className={`max-w-4xl mx-auto text-center mt-16 transition-all duration-1000 delay-500 ${
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
        >
          <p className="text-on-surface-variant leading-8">
            Whether it is a wedding, celebration, special gift, or simply a
            moment to treat yourself, JKR Jewellery is here to add a touch of
            elegance to every occasion. Our goal is to make every jewellery
            experience memorable through thoughtful designs and enduring style.
          </p>
        </div>

      </div>
    </main>
  )
}
