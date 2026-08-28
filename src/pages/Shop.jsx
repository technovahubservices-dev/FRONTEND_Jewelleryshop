import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useWishlist } from '../context/WishlistContext'
import { productAPI } from '../services/api'

export default function Shop() {
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll();
        if (response.data.success) {
          const transformed = response.data.data.map(productAPI.transform);
          setProducts(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const [filters, setFilters] = useState({
    metal: [],
    purity: [],
    priceRange: [0, 10000],
    category: [],
  })

  const availableMetals = [...new Set(products.map(p => (p.metal || '').split(',')[0].trim()).filter(Boolean))]
  const availablePurities = [...new Set(products.map(p => p.purity).filter(Boolean))]
  const availableCategories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`)
  }

  const handleAddToCart = (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product, 1)
  }

  const handleWishlist = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist(product.id)
    }
  }

  const toggleFilter = (type, value) => {
    setFilters(prev => ({
      ...prev,
      [type]: prev[type].includes(value)
        ? prev[type].filter(v => v !== value)
        : [...prev[type], value]
    }))
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const metalMatch = filters.metal.length === 0 || filters.metal.some(m => product.metal.includes(m))
      const purityMatch = filters.purity.length === 0 || filters.purity.includes(product.purity)
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const categoryMatch = filters.category.length === 0 || filters.category.includes(product.category)
      return metalMatch && purityMatch && priceMatch && categoryMatch
    })
  }, [filters])

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products

  const totalPages = Math.max(1, Math.ceil(displayProducts.length / productsPerPage))
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = displayProducts.slice(startIndex, startIndex + productsPerPage)

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-[120px]">
      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">inventory_2</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading products...</p>
        </div>
      ) : (
      <>
        {/* Breadcrumbs & Header */}
       <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">Jewellery</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald">Fine Jewellery Collection</h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">Discover our exquisite range of handcrafted pieces, designed to celebrate every moment with timeless elegance.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-on-surface-variant">Showing 1-{displayProducts.length} of {products.length} Items</span>
            <div className="relative">
              <select className="appearance-none bg-transparent border border-outline-variant rounded-none py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald cursor-pointer">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>New Arrivals</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>
      </div>

          <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8">
          {/* Filter Section: Metal */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Metal <span className="material-symbols-outlined text-[18px]">remove</span>
            </h3>
            <div className="space-y-3">
              {availableMetals.map((metal) => (
                <label key={metal} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    checked={filters.metal.includes(metal)}
                    onChange={() => toggleFilter('metal', metal)}
                    className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                    type="checkbox"
                  />
                  <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{metal}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Section: Purity */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Purity <span className="material-symbols-outlined text-[18px]">remove</span>
            </h3>
            <div className="space-y-3">
              {availablePurities.map((purity) => (
                <label key={purity} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    checked={filters.purity.includes(purity)}
                    onChange={() => toggleFilter('purity', purity)}
                    className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                    type="checkbox"
                  />
                  <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{purity}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Filter Section: Price */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Price <span className="material-symbols-outlined text-[18px]">add</span>
            </h3>
            <div className="px-2">
              <input
                type="range"
                min="0"
                max="10000"
                value={filters.priceRange[1]}
                onChange={(e) => setFilters(prev => ({ ...prev, priceRange: [0, parseInt(e.target.value)] }))}
                className="w-full h-2 bg-outline-variant rounded-full accent-deep-emerald cursor-pointer"
              />
               <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                  <span>₹0</span>
                 <span>₹{filters.priceRange[1]}</span>
               </div>
            </div>
          </div>

          {/* Filter Section: Category */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Category <span className="material-symbols-outlined text-[18px]">add</span>
            </h3>
            <div className="space-y-3">
              {availableCategories.map((category) => (
                <label key={category} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    checked={filters.category.includes(category)}
                    onChange={() => toggleFilter('category', category)}
                    className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                    type="checkbox"
                  />
                  <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{category}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            onClick={() => setFilters({ metal: [], purity: [], priceRange: [0, 10000], category: [] })}
            className="w-full py-3 bg-surface border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors mt-8"
          >
            CLEAR ALL FILTERS
          </button>
        </aside>

        {/* Product Grid - 4 columns, 3 rows */} 
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"> 

             {paginatedProducts.map((product) => (
              <Link key={product.id} to={`/product/${product.id}`} className="group block">
                <div className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                  {/* Product Image */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
                    <img
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                      alt={product.description}
                      src={product.image}
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/400x400?text=No+Image';
                      }}
                    />
                      {/* Wishlist */}
                      <button
                        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-white/80 backdrop-blur flex items-center justify-center shadow-sm transition-colors ${isInWishlist(product.id) ? 'text-error' : 'text-on-surface-variant hover:text-error'}`}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleWishlist(product, e); }}
                        title={isInWishlist(product.id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                      >
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: isInWishlist(product.id) ? "'FILL' 1" : "'FILL' 0" }}>favorite</span>
                      </button>
                  </div>

                  {/* Brand */}
                  <div className="text-center px-4 py-2">
                    <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant/70 uppercase tracking-wider">
                      JKR
                    </span>
                  </div>

                  {/* Product Info */}
                  <div className="px-4 pb-4 flex flex-col text-center">
                    <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                      {product.name}
                    </h3>

                     {/* Pricing */}
                     <div className="mb-4">
                       <span className="font-headline-md text-lg text-deep-emerald">
                         ₹ {product.price.toLocaleString('en-IN')}
                       </span>
                       {product.originalPrice && (
                         <span className="ml-2 text-xs text-on-surface-variant line-through">
                           ₹ {product.originalPrice.toLocaleString('en-IN')}
                         </span>
                       )}
                     </div>

                    {/* Buttons */}
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickView(product); }}
                        className="flex-1 border border-deep-emerald text-deep-emerald bg-transparent px-4 py-2.5 text-xs font-label-caps text-label-caps uppercase tracking-wider hover:bg-deep-emerald hover:text-surface-white transition-colors duration-200 rounded"
                      >
                        Quick View
                      </button>
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAddToCart(product, e); }}
                        className=" flex-1 bg-deep-emerald text-surface-white px-4 py-2.5 text-xs font-label-caps text-label-caps uppercase tracking-wider hover:bg-regal-gold transition-colors duration-200 rounded"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center space-x-2">
            <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            {[1, 2, 3].map((page) => (
              <button key={page} onClick={() => goToPage(page)} className={`w-10 h-10 border flex items-center justify-center text-sm transition-colors ${currentPage === page ? 'border-deep-emerald bg-deep-emerald text-surface-white' : 'border-outline-variant text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald'}`}>
                {page}
              </button>
            ))}
            <span className="px-2 text-on-surface-variant">...</span>
            <button onClick={() => goToPage(totalPages)} className={`w-10 h-10 border flex items-center justify-center text-sm transition-colors ${currentPage === totalPages ? 'border-deep-emerald bg-deep-emerald text-surface-white' : 'border-outline-variant text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald'}`}>
              {totalPages}
            </button>
            <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
          </div>
        </div>
        </div>
        </>
      )}
    </main>
  );
}
