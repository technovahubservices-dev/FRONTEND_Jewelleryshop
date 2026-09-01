import { useState, useMemo, useEffect, useCallback } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { productAPI } from '../services/api'

export default function Shop() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // Active category comes from the URL so it stays in sync with Navbar clicks.
  const selectedCategory = (searchParams.get('category') || '').trim()

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12

  // Re-fetch every time the selected category changes.
  useEffect(() => {
    let cancelled = false
    setCurrentPage(1)

    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const params = selectedCategory ? { category: selectedCategory, limit: 200 } : { limit: 200 }
        const response = await productAPI.getAll(params)
        if (cancelled) return
        if (response.data.success) {
          const transformed = response.data.data.map(productAPI.transform)
          setProducts(transformed)
        } else {
          setProducts([])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch products:', err)
          setError('Failed to load products. Please try again.')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()

    return () => { cancelled = true }
  }, [selectedCategory])

  const [filters, setFilters] = useState({
    metal: [],
    purity: [],
    priceRange: [0, 10000],
    category: [],
  })

  // Sync selectedCategory from URL into filters.category so the sidebar checkbox reflects the active navigation link.
  useEffect(() => {
    if (selectedCategory) {
      setFilters(prev => ({
        ...prev,
        category: prev.category.includes(selectedCategory)
          ? prev.category
          : [selectedCategory],
      }))
    }
    // We intentionally only run this when the URL category changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory])

  const availableMetals = [...new Set(products.map(p => (p.metal || '').split(',')[0].trim()).filter(Boolean))]
  const availablePurities = [...new Set(products.map(p => p.purity).filter(Boolean))]
  const availableCategories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`)
  }

  const toggleFilter = (type, value) => {
    setFilters(prev => {
      const updated = {
        ...prev,
        [type]: prev[type].includes(value)
          ? prev[type].filter(v => v !== value)
          : [...prev[type], value]
      }
      // When category changes via sidebar, update URL query param to keep it in sync with navigation
      if (type === 'category') {
        const newCategory = updated.category.length === 1 ? updated.category[0] : ''
        const next = new URLSearchParams(searchParams)
        if (newCategory) {
          next.set('category', newCategory)
        } else {
          next.delete('category')
        }
        setSearchParams(next, { replace: true })
      }
      return updated
    })
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const metalMatch = filters.metal.length === 0 || filters.metal.some(m => product.metal.includes(m))
      const purityMatch = filters.purity.length === 0 || filters.purity.includes(product.purity)
      const priceMatch = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
      const categoryMatch = filters.category.length === 0 || filters.category.includes(product.category)
      return metalMatch && purityMatch && priceMatch && categoryMatch
    })
  }, [filters, products])

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products

  const totalPages = Math.max(1, Math.ceil(displayProducts.length / productsPerPage))
  const startIndex = (currentPage - 1) * productsPerPage
  const paginatedProducts = displayProducts.slice(startIndex, startIndex + productsPerPage)

  // Clear Filter: strip the ?category= query param and reset local sidebar filters.
  const handleClearFilter = useCallback(() => {
    const next = new URLSearchParams(searchParams)
    next.delete('category')
    setSearchParams(next, { replace: true })
    setFilters({ metal: [], purity: [], priceRange: [0, 10000], category: [] })
  }, [searchParams, setSearchParams])

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
            <span className="text-charcoal-text font-semibold">
              {selectedCategory ? selectedCategory : 'Jewellery'}
            </span>
          </nav>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
            <div>
              <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald">
                {selectedCategory ? `${selectedCategory} Collection` : 'Fine Jewellery Collection'}
              </h1>
              <p className="text-on-surface-variant mt-2 max-w-2xl">
                {selectedCategory
                  ? `Browse our handpicked ${selectedCategory.toLowerCase()} pieces, crafted with timeless elegance.`
                  : 'Discover our exquisite range of handcrafted pieces, designed to celebrate every moment with timeless elegance.'}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-on-surface-variant">
                Showing 1–{displayProducts.length} of {products.length} {selectedCategory ? `${selectedCategory} ` : ''}Items
              </span>
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

          {/* Standalone filter banner removed - filters now sync via sidebar checkboxes only */}
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
            onClick={handleClearFilter}
            className="w-full py-3 bg-surface border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors mt-8"
          >
            CLEAR ALL FILTERS
          </button>
        </aside>

        {/* Product Grid - 4 columns, 3 rows */}
        <div className="flex-1">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
              {error}
            </div>
          )}

          {displayProducts.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-outline-variant rounded-lg">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-4 block">search_off</span>
              <h3 className="font-headline-md text-headline-md text-charcoal-text mb-2">
                No products found {selectedCategory ? `in ${selectedCategory}` : ''}
              </h3>
              <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                We could not find any products matching this filter. Try a different category or clear the filter to see all products.
              </p>
              {selectedCategory && (
                <button
                  onClick={handleClearFilter}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps uppercase tracking-wider rounded hover:bg-primary-container active:scale-95 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                  Clear Filter
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {paginatedProducts.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block">
                  <div className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
                      <img
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                        alt={product.description}
                        src={product.image}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400?text=No+Image';
                        }}
                      />
                    </div>
                    <div className="text-center px-4 py-2">
                      <span className="font-label-caps text-label-caps text-xs text-on-surface-variant/70 uppercase tracking-wider">
                        JKR
                      </span>
                    </div>
                    <div className="px-4 pb-4 flex flex-col text-center">
                      <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                        {product.name}
                      </h3>
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
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleQuickView(product); }}
                          className="flex-1 border border-deep-emerald text-deep-emerald bg-transparent px-4 py-2.5 text-xs font-label-caps text-label-caps uppercase tracking-wider hover:bg-deep-emerald hover:text-surface-white transition-colors duration-200 rounded"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* Pagination */}
          {displayProducts.length > 0 && (
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
          )}
        </div>
        </div>
        </>
      )}
    </main>
  );
}
