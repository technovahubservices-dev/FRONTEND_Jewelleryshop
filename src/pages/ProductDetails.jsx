import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { useState, useEffect } from 'react'
import { resolveImageUrl } from '../utils/apiUrl'
import ProductGallery from '../components/products/ProductGallery'
import ProductCard from '../components/products/ProductCard'
import RecentlyViewed, { trackProductView } from '../components/products/RecentlyViewed'
import JewelleryPolicy from '../components/sections/JewelleryPolicy'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedSize, setSelectedSize] = useState(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const { addItem } = useCart()
  const { isInWishlist, toggle } = useWishlist()
  const isWishlisted = product ? isInWishlist(product.id) : false

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        if (response.data.success) {
          const transformed = productAPI.transform(response.data.data);
          setProduct(transformed);
          trackProductView(transformed.id);
        }
      } catch (err) {
        console.error('Failed to fetch product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (product) {
      const fetchRelated = async () => {
        try {
          const response = await productAPI.getAll({ category: product.category });
          if (response.data.success) {
            const transformed = response.data.data
              .map(productAPI.transform)
              .filter(p => p.id !== id)
              .slice(0, 4);
            setRelatedProducts(transformed);
          }
        } catch (err) {
          console.error('Failed to fetch related products:', err);
        }
      };
      fetchRelated();
    }
  }, [product, id]);

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">inventory_2</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading product...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">Product Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">We couldn't find the product you're looking for.</p>
          <button onClick={() => navigate(-1)} className="bg-deep-emerald text-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-primary transition-colors">
            Go Back
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-sm text-on-surface-variant mb-8 font-body-md">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          </li>
          <li className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <Link className="hover:text-primary transition-colors" to="/shop">Jewellery</Link>
            </div>
          </li>
          <li className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <Link className="hover:text-primary transition-colors" to="/shop">{product.category}</Link>
            </div>
          </li>
          <li aria-current="page" className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <span className="text-primary font-medium">{product.name}</span>
            </div>
          </li>
        </ol>
      </nav>
      {successMessage && (
        <div className="mb-6 p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}
      {/* Product Hero Section (Bento/Asymmetric Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-24">
        {/* Image Gallery (Left - 7 cols) */}
        <div className="md:col-span-7">
          <ProductGallery
            images={product.images}
            video={product.video}
            productName={product.name}
          />
        </div>
        {/* Product Info (Right - 5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-center px-2 md:px-6 py-4 md:py-0">
          <div className="mb-2">
            <span className="text-xs font-label-caps tracking-widest text-on-surface-variant uppercase">{product.category}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">{product.name}</h1>
          {/* Ratings & SKU */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-outline-variant/30">
            <div className="flex items-center gap-1 text-regal-gold">
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined text-lg">star_half</span>
              <span className="text-sm font-body-md text-on-surface-variant ml-2">({product.reviews} Reviews)</span>
            </div>
            <span className="text-sm font-body-md text-on-surface-variant">SKU: {product.SKU}</span>
          </div>
           {/* Price */}
           <div className="mb-8">
             <div className="flex items-baseline gap-4">
               {product.originalPrice ? (
                 <>
                   <span className="text-3xl font-headline-md text-primary">₹ {product.price.toLocaleString('en-IN')}</span>
                   <span className="text-lg text-on-surface-variant line-through">₹ {product.originalPrice.toLocaleString('en-IN')}</span>
                   {product.discount && (
                     <span className="text-sm font-bold text-surface-tint bg-error-container/20 text-error px-3 py-1 rounded-full">
                       {product.discount}
                     </span>
                   )}
                   {product.discountAmount > 0 && (
                     <span className="text-xs text-on-surface-variant">
                       Save ₹ {product.discountAmount.toLocaleString('en-IN')}
                     </span>
                   )}
                 </>
               ) : (
                 <span className="text-3xl font-headline-md text-primary">₹ {product.price.toLocaleString('en-IN')}</span>
               )}
             </div>
             <p className="text-xs text-on-surface-variant mt-1">Inclusive of all taxes</p>
           </div>
          {/* Size Selector */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="font-body-md font-semibold text-primary">Select Size</label>
               <button onClick={() => setShowSizeGuide(!showSizeGuide)} className="text-sm text-surface-tint underline underline-offset-2 hover:text-primary transition-colors">Size Guide</button>
            </div>
             <div className="flex flex-wrap gap-3">
               <button onClick={() => setSelectedSize(10)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-body-md transition-colors ${selectedSize === 10 ? 'border-2 border-primary text-primary font-semibold bg-surface-container-lowest shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-regal-gold'}`}>10</button>
               <button onClick={() => setSelectedSize(11)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-body-md transition-colors ${selectedSize === 11 ? 'border-2 border-primary text-primary font-semibold bg-surface-container-lowest shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-regal-gold'}`}>11</button>
               <button onClick={() => setSelectedSize(12)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-body-md transition-colors ${selectedSize === 12 ? 'border-2 border-primary text-primary font-semibold bg-surface-container-lowest shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-regal-gold'}`}>12</button>
               <button onClick={() => setSelectedSize(13)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-body-md transition-colors ${selectedSize === 13 ? 'border-2 border-primary text-primary font-semibold bg-surface-container-lowest shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-regal-gold'}`}>13</button>
               <button onClick={() => setSelectedSize(14)} className={`w-12 h-12 rounded-full border flex items-center justify-center font-body-md transition-colors ${selectedSize === 14 ? 'border-2 border-primary text-primary font-semibold bg-surface-container-lowest shadow-sm' : 'border-outline-variant text-on-surface-variant hover:border-regal-gold'}`}>14</button>
             </div>
             {showSizeGuide && (
               <div className="mt-4 p-4 bg-surface-container-lowest border border-outline-variant rounded-lg">
                 <p className="text-sm font-body-md text-charcoal-text mb-2">Ring Size Guide (India)</p>
                 <div className="grid grid-cols-2 gap-2 text-xs font-body-md text-on-surface-variant">
                   <div><span className="font-semibold text-charcoal-text">Size 10:</span> Circumference ~49 mm</div>
                   <div><span className="font-semibold text-charcoal-text">Size 11:</span> Circumference ~51 mm</div>
                   <div><span className="font-semibold text-charcoal-text">Size 12:</span> Circumference ~53 mm</div>
                   <div><span className="font-semibold text-charcoal-text">Size 13:</span> Circumference ~55 mm</div>
                   <div><span className="font-semibold text-charcoal-text">Size 14:</span> Circumference ~57 mm</div>
                 </div>
               </div>
             )}
          </div>
            {/* Actions */}
            <div className="flex flex-col gap-4 mb-8">
              {/* Wishlist Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    toggle(product.id)
                  }}
                  aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`flex items-center justify-center gap-2 px-4 py-2.5 border rounded-lg font-body-md text-body-md transition-all ${
                    isWishlisted
                      ? 'bg-primary/10 border-primary text-primary'
                      : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-deep-emerald'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {isWishlisted ? 'favorite' : 'favorite_border'}
                  </span>
                  {isWishlisted ? 'In Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center gap-3">
               <label className="font-body-md font-semibold text-primary">Quantity</label>
               <div className="flex items-center gap-2">
                 <button
                   type="button"
                   onClick={() => setQuantity(Math.max(1, quantity - 1))}
                   className="w-9 h-9 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald transition-colors"
                 >
                   <span className="material-symbols-outlined text-[16px]">remove</span>
                 </button>
                 <span className="w-12 text-center font-body-md text-body-md text-primary">{quantity}</span>
                 <button
                   type="button"
                   onClick={() => setQuantity(quantity + 1)}
                   className="w-9 h-9 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald transition-colors"
                 >
                   <span className="material-symbols-outlined text-[16px]">add</span>
                 </button>
               </div>
             </div>

             {/* Add to Cart */}
             <button
               onClick={() => {
                 addItem(product, quantity)
                 setSuccessMessage(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`)
                 setTimeout(() => setSuccessMessage(''), 3000)
               }}
               className="w-full bg-regal-gold text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-regal-gold/90 transition-colors shadow-sm flex items-center justify-center gap-2"
             >
               <span className="material-symbols-outlined text-lg">shopping_cart</span>
               Add to Cart
             </button>

             {/* Buy Now */}
             <button
               onClick={() => {
                 addItem(product, quantity)
                 navigate('/checkout')
               }}
               className="w-full bg-deep-emerald text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-deep-emerald/90 transition-colors shadow-sm flex items-center justify-center gap-2"
             >
               <span className="material-symbols-outlined text-lg">flash_on</span>
               Buy Now
             </button>

             <button
               onClick={() => navigate('/account')}
               className="w-full bg-surface-container-low border border-outline-variant text-deep-emerald py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-surface-container-low/80 transition-colors flex items-center justify-center gap-2"
             >
               <span className="material-symbols-outlined text-lg">person</span>
               My Account
             </button>
           </div>
          {/* Trust Signals */}
          <div className="flex justify-between items-center py-4 border-t border-outline-variant/30">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">verified</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">Certified<br />Jewellery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">assignment_return</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">15 Day<br />Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">autorenew</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">Lifetime<br />Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">security</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">1 Yr<br />Warranty</span>
            </div>
          </div>
        </div>
      </div>
      {/* Product Specifications (Glassmorphism / Tabbed feel) */}
      <div className="mb-24">
        <h2 className="font-headline-md text-headline-md text-primary text-center mb-12">Product Details</h2>
        <div className="bg-surface-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-6 md:p-12 shadow-sm max-w-4xl mx-auto">
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 text-center leading-relaxed">
            {product.fullDescription}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Metal Details */}
            <div>
              <h3 className="font-headline-md text-lg text-primary border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-regal-gold text-xl">diamond</span>
                Metal Details
              </h3>
              <ul className="space-y-3 font-body-md text-sm text-on-surface-variant">
                <li className="flex justify-between"><span className="">Gold Purity</span><span className="font-medium text-primary">{product.purity}</span></li>
                <li className="flex justify-between"><span className="">Metal Color</span><span className="font-medium text-primary">{product.metalColor}</span></li>
                <li className="flex justify-between"><span className="">Gross Weight</span><span className="font-medium text-primary">{product.weight}</span></li>
              </ul>
            </div>
            {/* Diamond Details */}
            <div>
              <h3 className="font-headline-md text-lg text-primary border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-regal-gold text-xl">auto_awesome</span>
                Diamond Details
              </h3>
              <ul className="space-y-3 font-body-md text-sm text-on-surface-variant">
                <li className="flex justify-between"><span className="">Total Weight</span><span className="font-medium text-primary">{product.diamondWeight}</span></li>
                <li className="flex justify-between"><span className="">Total No. of Diamonds</span><span className="font-medium text-primary">1</span></li>
                <li className="flex justify-between"><span className="">Clarity</span><span className="font-medium text-primary">{product.diamondClarity}</span></li>
                <li className="flex justify-between"><span className="">Color</span><span className="font-medium text-primary">{product.diamondColor}</span></li>
                <li className="flex justify-between"><span className="">Shape</span><span className="font-medium text-primary">{product.diamondShape}</span></li>
              </ul>
            </div>
          </div>
        </div>
         </div>

         {/* Jewellery Policy Section */}
         <JewelleryPolicy />

         {/* Recently Viewed */}
         <RecentlyViewed currentProductId={product.id} />

      {/* Similar Products (Horizontal Scroll / Grid) */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline-md text-headline-md text-primary">You May Also Like</h2>
        <Link to="/shop" className="text-sm font-label-caps uppercase text-surface-tint hover:text-primary transition-colors flex items-center gap-1 border-b border-transparent hover:border-primary">
              View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </Link>
         </div>
         <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
           {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct.id} product={relatedProduct} />
          ))}
        </div>
      </div>
    </main>
  );
}
