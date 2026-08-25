import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../pages/AnnouncementBar';
import FeaturedProducts from '../components/sections/FeaturedProducts';
export default function Home() {
  const heroImages = [
    'https://images.alphacoders.com/112/1122217.jpg',
    'https://mir-s3-cdn-cf.behance.net/project_modules/fs/42e693127435607.6141dbb950c20.jpg',
    'https://images.unsplash.com/photo-1611652022419-a9419f74343d',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
  ];

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [heroImages.length]);
  return (
    <main className="w-full">
      <AnnouncementBar />
      
      {/* Hero Campaign Banner */}
      <section className="relative w-full h-[716px] md:h-[870px] bg-surface-white flex items-center justify-center overflow-hidden">
        <div
  className="absolute inset-0 bg-cover bg-center opacity-90 w-full h-full transition-all duration-1000"
  data-alt="hero image"
  style={{
    backgroundImage: `url('${heroImages[currentImage]}')`,
  }}
></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mt-20">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-surface-white mb-4 drop-shadow-md">The New Standard of Elegance</p>
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-surface-white leading-tight mb-8 drop-shadow-lg">A Symphony in Diamond &amp; Gold</h1>
           <div className="flex justify-center space-x-4">
             <Link to="/shop" className="bg-surface-white text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-container-low hover:shadow-lg border border-transparent">
               Explore Collection
             </Link>
             <Link to="/shop" className="bg-transparent border border-surface-white text-surface-white font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-white hover:text-deep-emerald">
               Discover the Craft
             </Link>
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
              style={{ backgroundImage: "url('https://media.istockphoto.com/id/1179439658/photo/alluring-woman-dressed-in-a-posh-jewelry-set-of-necklace-ring-and-earrings-elegant-evening.jpg?s=612x612&w=0&k=20&c=cNLMjfky_LeAJF3FI5msHXr5Ds-ce06uuyeRx0_VkU4=" }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 text-surface-white">
              <h3 className="font-headline-md text-headline-md mb-2">Diamond Jewellery</h3>
              <Link to="/shop" className="font-label-caps text-label-caps uppercase tracking-widest flex items-center">Shop Now <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span></Link>
            </div>
          </div>
          <div className="md:col-span-4 flex flex-col gap-gutter h-[400px] md:h-[500px]">
            {/* Top Small Feature */}
            <div className="flex-1 group cursor-pointer relative overflow-hidden bg-surface-white border border-surface-container-highest">
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105" 
                data-alt="A delicate, modern gold chain necklace beautifully draped against an off-white, textured linen backdrop. Soft, natural light casts gentle shadows, creating a tactile and intimate feel. The color palette consists of warm gold tones contrasting with the cool, neutral linen."
                style={{ backgroundImage: "url('https://t4.ftcdn.net/jpg/08/12/74/47/360_F_812744712_T9piHX3ORWcdNqLZkdd2rWo8YcWdFN7v.jpg')" }}
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
                style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMP6nK0cIUNcQonw4-ixRfzINSLjJyRzCT4eM9lfApCplAfwSG9fiKFkpf&s=10 ')" }}
              ></div>
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute bottom-6 left-6 text-surface-white">
                <h3 className="font-headline-md text-headline-md mb-1 bg-deep-emerald/80 backdrop-blur-sm px-2 py-1 inline-block text-surface-white">Platinum Selection</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Promotional Banner Split */}
      <section className="w-full bg-surface-white py-12">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
          <div className="grid grid-cols-1 md:grid-cols-2 bg-soft-cream border border-outline-variant/30 overflow-hidden">
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
    
    {/* First set */}
    <div className="heritage-image">
      <img
        src="https://www.manyavar.com/dw/image/v2/BJZV_PRD/on/demandware.static/-/Library-Sites-ManyavarSharedLibrary/default/dw3253c2aa/Trending%20Designs%20in%20Gold%20for%20Your%20Wedding%20Jewellery%20Ranging%20from%20Mangtika%20to%20Payal_Blog%201.jpg"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSutUpjNGc45KN29WX8AP9CgEHDWRlmU6dJBX3XgnxJk-zJspTtSLZ5S0&s=10.jpg"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://www.abhushanjewellers.com/wp-content/uploads/2025/09/Gold-jewellery-1200x1200_123-copy_123-copy-3.jpg"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://www.totaramsons.com/assets/images/goldcat.jpg"
        alt="Heritage Jewellery"
      />
    </div>

    {/* Duplicate set for seamless loop */}
    <div className="heritage-image">
      <img
        src="https://parekhjewellersltd.com/wp-content/uploads/2024/03/about-us-banner1-1.jpg"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFN44FhP4AgZNtBjGes_xTPhOGO6SKaj_Lf4ARRp4wuKFCEK3f6T3LA6I&s=10"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80"
        alt="Heritage Jewellery"
      />
    </div>

    <div className="heritage-image">
      <img
        src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80"
        alt="Heritage Jewellery"
      />
    </div>

  </div>
</div>
            
          </div>
        </div>
      </section>
    </main>
  );
}
