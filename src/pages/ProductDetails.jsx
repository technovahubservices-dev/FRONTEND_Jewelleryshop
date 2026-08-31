import { useParams, useNavigate, Link } from 'react-router-dom'
import { productAPI, userAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const [product, setProduct] = useState(null)
  const [relatedProducts, setRelatedProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [successMessage, setSuccessMessage] = useState('')
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState(null)
  const [showSizeGuide, setShowSizeGuide] = useState(false)

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productAPI.getById(id);
        if (response.data.success) {
          const transformed = productAPI.transform(response.data.data);
          setProduct(transformed);
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

  const handleQuickViewRelated = (relatedProduct) => {
    navigate(`/product/${relatedProduct.id}`)
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
        <div className="md:col-span-7 flex flex-col md:flex-row gap-4 h-full">
          {/* Thumbnails (Vertical on desktop) */}
          <div className="hidden md:flex flex-col gap-4 w-24 flex-shrink-0">
            {product.images.map((img, index) => (
              <button key={index} onClick={() => setSelectedImage(index)} className={`w-full aspect-square bg-surface-white rounded-lg overflow-hidden p-1 ${selectedImage === index ? 'border-2 border-regal-gold' : 'border border-outline-variant'}`}>
                <img className="w-full h-full object-cover rounded" alt={`${product.name} view ${index + 1}`} src={img} onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }} />
              </button>
            ))}
            <button className="w-full aspect-square bg-surface-white/80 backdrop-blur-sm border border-outline-variant rounded-lg overflow-hidden p-1 flex items-center justify-center text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">play_circle</span>
            </button>
          </div>
          {/* Main Image */}
          <div className="flex-grow bg-surface-white rounded-xl overflow-hidden shadow-sm relative group aspect-square md:aspect-[4/5]">
            {product.isBestSeller && (
              <div className="absolute top-4 left-4 z-10 bg-surface-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-label-caps text-primary border border-outline-variant">
                Best Seller
              </div>
            )}
             {product.isNew && (
               <div className="absolute top-4 left-4 z-10 bg-surface-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-label-caps text-regal-gold border border-outline-variant">
                 New
               </div>
             )}
             <img className="w-full h-full object-cover img-hover-zoom" alt={product.description} src={product.images[selectedImage]} onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image'; }} />
            {/* Mobile Thumbnails (Horizontal) */}
            <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
              {product.images.map((_, index) => (
                <div key={index} className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-regal-gold' : 'bg-outline-variant'}`}></div>
              ))}
            </div>
          </div>
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
              <span className="text-3xl font-headline-md text-primary">₹ {product.price.toLocaleString('en-IN')}</span>
              {product.originalPrice && (
                <span className="text-lg text-on-surface-variant line-through">₹ {product.originalPrice.toLocaleString('en-IN')}</span>
              )}
              {product.discount && (
                <span className="text-sm font-bold text-surface-tint bg-primary-fixed/30 px-2 py-1 rounded">{product.discount} OFF</span>
              )}
              {!product.originalPrice && (
                <span className="text-sm font-bold text-surface-tint bg-primary-fixed/30 px-2 py-1 rounded">No Discount</span>
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
             <button onClick={() => navigate('/account')} className="w-full bg-deep-emerald text-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-surface-tint transition-colors shadow-sm flex items-center justify-center gap-2">
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
            <div key={relatedProduct.id} className="group cursor-pointer">
               <div className="bg-surface-white rounded-lg overflow-hidden aspect-square mb-4 relative flex items-center justify-center p-4 border border-transparent hover:border-outline-variant/30 transition-all shadow-sm group-hover:shadow-md">
                 {relatedProduct.isNew && (
                   <div className="absolute top-3 left-3 z-10 bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label-caps text-on-surface-variant">New</div>
                 )}
                 <img className="w-full h-full object-contain img-hover-zoom" alt={relatedProduct.name} src={relatedProduct.image} onClick={() => handleQuickViewRelated(relatedProduct)} />
               </div>
              <div className="text-center px-2">
                <h3 className="font-body-md text-sm text-on-surface-variant truncate mb-1">{relatedProduct.name}</h3>
                <p className="font-headline-md text-base text-primary">₹ {relatedProduct.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
