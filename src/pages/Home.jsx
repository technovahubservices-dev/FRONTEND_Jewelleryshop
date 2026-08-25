import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AnnouncementBar from '../pages/AnnouncementBar';
import FeaturedProducts from '../components/sections/FeaturedProducts';
import { contentAPI } from '../services/api';
import TestimonialSection from '../components/sections/TestimonialSection';

const fallbackHeroImages = [
  'https://images.alphacoders.com/112/1122217.jpg',
  'https://mir-s3-cdn-cf.behance.net/project_modules/fs/42e693127435607.6141dbb950c20.jpg',
  'https://images.unsplash.com/photo-1611652022419-a9419f74343d',
  'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f',
];

export default function Home() {
  const [heroBanners, setHeroBanners] = useState([]);
  const [promoBanners, setPromoBanners] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const [heroRes, promoRes, collectionRes] = await Promise.allSettled([
          contentAPI.getActive('heroBanners'),
          contentAPI.getActive('promoBanners'),
          contentAPI.getActive('collections'),
        ]);

        if (heroRes.status === 'fulfilled' && heroRes.value.data.success) {
          setHeroBanners(heroRes.value.data.data || []);
        }
        if (promoRes.status === 'fulfilled' && promoRes.value.data.success) {
          setPromoBanners(promoRes.value.data.data || []);
        }
        if (collectionRes.status === 'fulfilled' && collectionRes.value.data.success) {
          setCollections(collectionRes.value.data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch content:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, []);

  const heroImages = heroBanners.length > 0
    ? heroBanners.map((b) => b.image || b.mobileImage).filter(Boolean)
    : fallbackHeroImages;

  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [heroImages.length]);

  const activePromo = promoBanners[0];
  const activeHero = heroBanners[currentImage];

  return (
    <main className="w-full">
      <AnnouncementBar />

      {/* Hero Section */}
      <section className="relative w-full h-[716px] md:h-[870px] bg-surface-white flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 w-full h-full transition-all duration-1000"
          data-alt="hero image"
          style={{
            backgroundImage: `url('${heroImages[currentImage]}')`,
          }}
        ></div>
        <div className="relative z-10 text-center px-4 max-w-3xl mt-20">
          <p className="font-label-caps text-label-caps uppercase tracking-widest text-surface-white mb-4 drop-shadow-md">
            {activeHero?.subtitle || 'The New Standard of Elegance'}
          </p>
          <h1 className="font-display-lg text-display-lg md:text-[64px] text-surface-white leading-tight mb-8 drop-shadow-lg">
            {activeHero?.title || 'A Symphony in Diamond & Gold'}
          </h1>
          <div className="flex justify-center space-x-4">
            <Link
              to={activeHero?.ctaLink || '/shop'}
              className="bg-surface-white text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-container-low hover:shadow-lg border border-transparent"
            >
              {activeHero?.ctaText || 'Explore Collection'}
            </Link>
            <Link
              to="/shop"
              className="bg-transparent border border-surface-white text-surface-white font-label-caps text-label-caps uppercase tracking-widest py-4 px-10 rounded transition-all hover:bg-surface-white hover:text-deep-emerald"
            >
              Discover the Craft
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Collections */}
      {collections.length > 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Our Collections</h2>
            <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {collections.slice(0, 4).map((collection, idx) => (
              <div
                key={collection._id || idx}
                className={idx === 0 ? "md:col-span-8" : "md:col-span-4"}
              >
                <div className="group cursor-pointer relative overflow-hidden h-[400px] md:h-[500px]">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url('${collection.image}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className={`absolute bottom-8 ${idx === 0 ? 'left-8' : 'left-6'} text-surface-white`}>
                    <h3 className="font-headline-md text-headline-md mb-2">{collection.title}</h3>
                    <Link
                      to={collection.ctaLink || '/shop'}
                      className="font-label-caps text-label-caps uppercase tracking-wider flex items-center"
                    >
                      {collection.ctaText || 'Shop Now'}
                      <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fallback Shop By Category (shown if no collections) */}
      {collections.length === 0 && (
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24">
          <div className="text-center mb-16">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Curated Categories</h2>
            <div className="h-[1px] w-12 bg-regal-gold mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            <div className="md:col-span-8 group cursor-pointer relative overflow-hidden h-[400px] md:h-[500px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: "url('https://media.istockphoto.com/id/1179439658/photo/alluring-woman-dressed-in-a-posh-jewelry-set-of-necklace-ring-and-earrings-elegant-evening.jpg?s=612x612&w=0&k=20&c=cNLMjfky_LeAJF3FI5msHXr5Ds-ce06uuyeRx0_VkU4=')" }}
              ></div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-surface-white">
                <h3 className="font-headline-md text-headline-md mb-2">Diamond Jewellery</h3>
                <Link to="/shop" className="font-label-caps text-label-caps uppercase tracking-wider flex items-center">Shop Now <span className="material-symbols-outlined ml-2 text-sm">arrow_forward</span></Link>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-gutter h-[400px] md:h-[500px]">
              <div className="flex-1 group cursor-pointer relative overflow-hidden bg-surface-white border border-surface-container-highest">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('https://t4.ftcdn.net/jpg/08/12/74/47/360_F_812744712_T9piHX3ORWcdNqLZkdd2rWo8YcWdFN7v.jpg')" }}
                ></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-6 left-6 text-charcoal-text">
                  <h3 className="font-headline-md text-headline-md mb-1 bg-surface-white/80 backdrop-blur-sm px-2 py-1 inline-block">Gold Essentials</h3>
                </div>
              </div>
              <div className="flex-1 group cursor-pointer relative overflow-hidden bg-surface-white border border-surface-container-highest">
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                  style={{ backgroundImage: "url('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRMP6nK0cIUNcQonw4-ixRfzINSLjJyRzCT4eM9lfApCplAfwSG9fiKFkpf&s=10')" }}
                ></div>
                <div className="absolute inset-0 bg-black/10"></div>
                <div className="absolute bottom-6 left-6 text-surface-white">
                  <h3 className="font-headline-md text-headline-md mb-1 bg-deep-emerald/80 backdrop-blur-sm px-2 py-1 inline-block text-surface-white">Platinum Selection</h3>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      <FeaturedProducts />

      {/* Dynamic Promo Banners */}
      {promoBanners.length > 0 && (
        <section className="w-full bg-surface-white py-12">
          <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
            {promoBanners.filter((p) => p.position === 'top' || p.position === 'featured' || !p.position).slice(0, 2).map((banner, idx) => (
              <div
                key={banner._id || idx}
                className="grid grid-cols-1 md:grid-cols-2 items-center gap-gutter bg-soft-cream border border-outline-variant/30 overflow-hidden rounded-lg"
                style={{ backgroundColor: banner.bgColor || '#F9F8F6' }}
              >
                <div className="p-12 md:p-20 flex flex-col justify-center">
                  <span className="font-label-caps text-label-caps uppercase tracking-widest text-regal-gold mb-4">
                    {banner.title}
                  </span>
                  <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-6">
                    {banner.description || banner.title}
                  </h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md">
                    {banner.description || 'Embrace tradition with our intricately crafted pieces.'}
                  </p>
                  <Link
                    to={banner.ctaLink || '/shop'}
                    className="self-start border-b border-deep-emerald text-deep-emerald font-label-caps text-label-caps uppercase tracking-widest pb-1 hover:text-regal-gold hover:border-regal-gold transition-colors"
                  >
                    {banner.ctaText || 'View Collection'}
                  </Link>
                </div>
                {banner.image && (
                  <div className="h-[400px] md:h-auto relative overflow-hidden">
                    <img
                      src={banner.image}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Fallback Promotional Banner (shown if no dynamic promo banners) */}
      {promoBanners.length === 0 && (
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
                  <div className="heritage-image"><img src="https://www.manyavar.com/dw/image/v2/BJZV_PRD/on/demandware.static/-/Library-Sites-ManyavarSharedLibrary/default/dw3253c2aa/Trending%20Designs%20in%20Gold%20for%20Your%20Wedding%20Jewellery%20Ranging%20from%20Mangtika%20to%20Payal_Blog%201.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSutUpjNGc45KN29WX8AP9CgEHDWRlmU6dJBX3XgnxJk-zJspTtSLZ5S0&s=10.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://www.abhushanjewellers.com/wp-content/uploads/2025/09/Gold-jewellery-1200x1200_123-copy_123-copy-3.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://www.totaramsons.com/assets/images/goldcat.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://parekhjewellersltd.com/wp-content/uploads/2024/03/about-us-banner1-1.jpg" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFN44FhP4AgZNtBjGes_xTPhOGO6SKaj_Lf4ARRp4wuKFCEK3f6T3LA6I&s=10" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://images.unsplash.com/photo-1617038220319-276d3cfab638?w=800&q=80" alt="Heritage Jewellery" /></div>
                  <div className="heritage-image"><img src="https://images.unsplash.com/photo-1602173574767-37ac01994b2a?w=800&q=80" alt="Heritage Jewellery" /></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials Section */}
      <TestimonialSection />
    </main>
  );
}
