import AnnouncementBar from '../pages/AnnouncementBar';
export default function Home() {
  return (
    <main className="w-full">
      <AnnouncementBar />
      
      {/* Hero Campaign Banner */}
      <section className="relative w-full h-[716px] md:h-[870px] bg-surface-white flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-90 w-full h-full object-cover" 
          data-alt="A breathtaking, cinematic wide shot of a model wearing a luxurious diamond necklace and matching earrings. The setting is a minimalist, modern room with high-key lighting, casting soft, elegant shadows. The color palette is dominated by soft creams, whites, and touches of deep emerald to match the brand identity. The mood is sophisticated, exclusive, and serene."
          style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAK3z3Ice8mU3uCc7PCt4Vt34EXwHwkDxc2RG0jW--tIw50-91SNyl315NCGm4AHnWOLsaERoqCQZ9dsIt_myObKCcqaWBse_uw6wwIwKPp0KFmu2_0JiGBjmvCgbgZk0urKjNEU84nymSojXVDnAEFywnoyBRYeQnTHVvbvzS-rv_HoI209z0E-SsVDPd4ZpgOMje6DFrcOf_9vQZmGCnuKaqxa0J2c90ReOi8DzY3YcOCXqOEpLE')" }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mt-20">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-surface-white mb-4 drop-shadow-md">The New Standard of Elegance</p>
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-surface-white leading-tight mb-8 drop-shadow-lg">A Symphony in Diamond &amp; Gold</h1>
          <div className="flex justify-center space-x-4">
            <a className="bg-surface-white text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-container-lowest hover:shadow-lg border border-transparent" href="#">
              Explore Collection
            </a>
            <a className="bg-transparent border border-surface-white text-surface-white font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-white hover:text-deep-emerald" href="#">
              Discover the Craft
            </a>
          </div>
        </div>
      </section>

      {/* Shop By Category (Bento Style) */}
      <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24">
        <div className="text-center mb-16">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Curated Categories</h2>
          <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Large Feature */}
          <div className="md:col-span-8 group cursor-pointer relative overflow-hidden h-[400px] md:h-[500px]">
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
              data-alt="A macro, ultra-detailed photograph of a sparkling diamond engagement ring resting on a smooth, reflective white marble surface. The lighting is bright and focused, highlighting the precise cuts of the diamond. The background is a soft, out-of-focus cream color, emphasizing a minimalist luxury aesthetic."
              style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC31CFsJnUoqreeAQ3AxkPoERm_G2-1rjvf_TnGcndUXoPQMQ51DJgUHEyA3QnGLxEMjrK8fbNpMKcMsEsRPUvQKwvtZzmNNXWPkyTrYvT-BWtecNd9tIzZSIz0MK7RWDcZqwcrqy-WPtSQ6Fw0EiCWh-6RIkyBv0jHYGBU9X5PVpI8_KCcdyMhFFyWdsc0LoTCxk4tcBZ6jR7aQTHkA-HKVVr3HvI67ZZIZET5_Klfa0_26cig2tg')" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-surface-white">
              <h3 className="font-headline-md text-headline-md mb-2">Diamond Jewellery</h3>
              <p className="font-label-caps text-label-caps uppercase tracking-widest flex items-center">Shop Now <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span></p>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-gutter h-[400px] md:h-[500px]">
            {/* Top Small Feature */}
            <div className="flex-1 group cursor-pointer relative overflow-hidden bg-surface-white border border-surface-container-highest">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                data-alt="A delicate, modern gold chain necklace beautifully draped against an off-white, textured linen backdrop. Soft, natural light casts gentle shadows, creating a tactile and intimate feel. The color palette consists of warm gold tones contrasting with the cool, neutral linen."
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXkxJ2si-ZWgx3EVcrx2gd1jXTOilTiGj8yBtbksHKx6W6KT0VY5d-w6X8MfnBXw9JDxUgr-m2S9G71Ivaf5LnRoWRcUhqQMTuH1GTuSFn1LWL5YNmf_lvE4LHWvc8bi8_202zeoMRiP2Rscx3T0Leq8TJLKJF6y3ers-O6Vu25cZoId19mEpo85GXUUGJ4ccAjo5NbeqcmwLo9ncUdUthJ7QkLrqcyME_X2svzPi0x7uZLH4PsFw')" }}
              ></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-6 left-6 text-charcoal-text">
                <h3 className="font-headline-md text-headline-md mb-1 bg-surface-white/80 backdrop-blur-sm px-2 py-1 inline-block">Gold Essentials</h3>
              </div>
            </div>
            {/* Bottom Small Feature */}
            <div className="flex-1 group cursor-pointer relative overflow-hidden bg-surface-white border border-surface-container-highest">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                data-alt="A pair of elegant platinum and sapphire drop earrings lying on a piece of dark emerald green velvet. The contrast between the brilliant silver tones of the platinum, the deep blue of the sapphires, and the rich green background conveys ultimate exclusivity and heritage."
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBuyfFmDIy0kUjGDpNEcDGP-LiQdhliKfG51Mu04_3ZVQYvL7iWHqqfy0op-K-fBMteGMsdcX9z8oZPM1gXTHCajVabvWBW5WIlNrwQS-hfICzcD3fWAtwFvMQGaZS62V3JF2uNcy-20RU5c0rLcshfI1v9vJrh8vCNC7koIql_rqjku75HWWjikalEgvjhHBDqpwEnbmRPB4kREuOXEQvuPr4CXyTu0P_QdFA9EJlXyZW0fC_Z7ks')" }}
              ></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-6 left-6 text-surface-white">
                <h3 className="font-headline-md text-headline-md mb-1 bg-deep-emerald/80 backdrop-blur-sm px-2 py-1 inline-block text-surface-white">Platinum Selection</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Promotional Banner Split */}
      <section className="w-full bg-surface-white py-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-soft-cream border border-surface-container-highest overflow-hidden">
            <div className="p-12 md:p-20 flex flex-col justify-center">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-regal-gold mb-4">Festive Exclusive</span>
              <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-6">The Heritage Collection</h2>
              <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
                Embrace tradition with our intricately crafted pieces that blend timeless design with contemporary elegance. Perfect for the upcoming celebrations.
              </p>
              <a className="self-start border-b border-deep-emerald text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest pb-1 hover:text-regal-gold hover:border-regal-gold transition-colors" href="/shop">View Collection</a>
            </div>
            <div className="h-[400px] md:h-auto relative">
              <div 
                className="absolute inset-0 bg-cover bg-center" 
                data-alt="A beautifully styled composition featuring traditional Indian gold bangles and a statement necklace displayed on a highly polished wooden surface. Gentle, warm lighting accentuates the intricate filigree work of the jewelry. The background is softly blurred to maintain focus on the craftsmanship, fitting a luxury brand image."
                style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC9g5EpG33OOj47pafTKXS_iHtSgXfPaRKTbbLg3JFXVhpC3Culdru1LvaoC45D2yIugDCOCNmJ4VDihSshE3kbhzIVE7ZzsuvfUf6OOReiGl7246-Pz2vrv_gyqylzydenkSTRwxIcbhMwqPrx2WclAt3nqmapJp51fwjPP4oibL_PJku6zFqoei5qKLGzOq2SNikGonCb3UmB4BXAmaTxGCQ6F7JNP2MpndIQ2C0eTqrtAY6blZQ')" }}
              ></div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
