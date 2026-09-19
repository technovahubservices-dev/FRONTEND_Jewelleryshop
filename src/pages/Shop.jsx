import { useState, useMemo, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { productAPI, categoryAPI, contentAPI } from '../services/api'
import { resolveImageUrl } from '../utils/apiUrl'
import ProductCard from '../components/products/ProductCard'

const COLLECTION_ORDER = [
  'Heritage', 'Eternal', 'Blossom', 'Celeste', 'Aura',
  'New Arrival', 'Best Seller', 'Bridal', 'Wedding', 'Occasion',
]

const METAL_OPTIONS = ['Gold', 'Silver', 'Platinum', 'Rose Gold', 'White Gold']

export default function Shop() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [collectionsLoading, setCollectionsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const productsPerPage = 12
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const [sortBy, setSortBy] = useState('recommended')
  const [totalPages, setTotalPages] = useState(1)
  const [totalProducts, setTotalProducts] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const params = {
          sort: sortBy,
          page: currentPage,
          limit: productsPerPage,
        }
        searchParams.forEach((value, key) => {
          if (key === 'category' || key === 'subcategory' || key === 'collection' || key === 'metal') {
            params[key] = value
          } else if (key === 'bridal' || key === 'wedding' || key === 'sale') {
            params[key] = value === 'true'
          }
        })
        const response = await productAPI.getAll(params)
        if (response.data.success) {
          const transformed = response.data.data.map(productAPI.transform)
          setProducts(transformed)
          if (response.data.pagination) {
            setTotalPages(response.data.pagination.totalPages || 1)
            setTotalProducts(response.data.pagination.total || transformed.length)
          } else {
            setTotalPages(Math.max(1, Math.ceil(transformed.length / productsPerPage)))
            setTotalProducts(transformed.length)
          }
        }
      } catch (err) {
        console.error('Failed to fetch products:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getAll()
        if (response.data?.success) {
          setCategories(response.data.data.filter(c => c.isActive) || [])
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err)
      }
    }

    const fetchCollections = async () => {
      setCollectionsLoading(true)
      try {
        const response = await contentAPI.getActive('collections')
        if (response.data?.success && Array.isArray(response.data.data)) {
          setCollections(response.data.data.filter(c => c.isActive !== false))
        }
      } catch (err) {
        console.error('Failed to fetch collections:', err)
      } finally {
        setCollectionsLoading(false)
      }
    }

    fetchProducts()
    fetchCategories()
    fetchCollections()
  }, [searchParams, sortBy, currentPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchParams])

  useEffect(() => {
    setCurrentPage(1)
  }, [sortBy])

  const filters = useMemo(() => {
    return {
      category: searchParams.getAll('category'),
      collection: searchParams.getAll('collection'),
            metal: searchParams.getAll('metal'),
      bridal: searchParams.get('bridal') === 'true',
      wedding: searchParams.get('wedding') === 'true',
      sale: searchParams.get('sale') === 'true',
      priceRange: [
        Number(searchParams.get('minPrice') || 0),
        Number(searchParams.get('maxPrice') || 10000),
      ],
    }
  }, [searchParams])

  const availableMetals = useMemo(() => {
    const metals = products
      .map(p => (p.metal || '').split(',')[0].trim())
      .filter(Boolean)
    return [...new Set(metals)]
  }, [products])

  const availableCollections = useMemo(() => {
    const colls = products.map(p => p.collection).filter(Boolean)
    const seen = new Set([...colls])
    return COLLECTION_ORDER.filter(c => seen.has(c))
  }, [products])

  const toggleCheckboxFilter = (type, value) => {
    const current = filters[type] || []
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value]

    const params = new URLSearchParams()

    if (type === 'category' || type === 'collection' || type === 'metal') {
      updated.forEach(v => params.append(type, v))
    }

    const otherTypes = {
      category: ['collection', 'metal'],
      collection: ['category', 'metal'],
            metal: ['category', 'collection'],
    }[type] || ['category', 'collection', 'metal']

    otherTypes.forEach(t => {
      const vals = Array.isArray(filters[t]) ? filters[t] : []
      vals.forEach(v => params.append(t, v))
    })

    if (filters.bridal) params.set('bridal', 'true')
    if (filters.wedding) params.set('wedding', 'true')
    if (filters.sale) params.set('sale', 'true')
    if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]))
    if (filters.priceRange[1] < 10000) params.set('maxPrice', String(filters.priceRange[1]))

    setSearchParams(params)
  }

  const toggleBooleanFilter = (key) => {
    const params = new URLSearchParams()

    ;['category', 'collection', 'metal'].forEach(t => {
      const vals = Array.isArray(filters[t]) ? filters[t] : []
      vals.forEach(v => params.append(t, v))
    })

    if (key === 'bridal') params.set('bridal', !filters.bridal)
    if (key === 'wedding') params.set('wedding', !filters.wedding)
    if (key === 'sale') params.set('sale', !filters.sale)
    if (filters.bridal && key !== 'bridal') params.set('bridal', 'true')
    if (filters.wedding && key !== 'wedding') params.set('wedding', 'true')
    if (filters.sale && key !== 'sale') params.set('sale', 'true')
    if (filters.priceRange[0] > 0) params.set('minPrice', String(filters.priceRange[0]))
    if (filters.priceRange[1] < 10000) params.set('maxPrice', String(filters.priceRange[1]))

    setSearchParams(params)
  }

  const setPriceRange = (min, max) => {
    const params = new URLSearchParams()

    ;['category', 'collection', 'metal'].forEach(t => {
      const vals = Array.isArray(filters[t]) ? filters[t] : []
      vals.forEach(v => params.append(t, v))
    })

    if (filters.bridal) params.set('bridal', 'true')
    if (filters.wedding) params.set('wedding', 'true')
    if (filters.sale) params.set('sale', 'true')
    if (min > 0) params.set('minPrice', String(min))
    if (max < 10000) params.set('maxPrice', String(max))

    setSearchParams(params)
  }

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams())
  }

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredProducts = products

  const activeFilterCount =
    filters.category.length + filters.collection.length +
    filters.metal.length +
    (filters.priceRange[0] > 0 ? 1 : 0) + (filters.priceRange[1] < 10000 ? 1 : 0)

  const handleCollectionClick = (collectionName) => {
    if (collectionName === 'New Arrival') {
      setSearchParams(new URLSearchParams({ collection: 'New Arrival' }))
    } else if (collectionName === 'Best Seller') {
      setSearchParams(new URLSearchParams({ collection: 'Best Seller' }))
    } else {
      setSearchParams(new URLSearchParams({ collection: collectionName }))
    }
  }

  return (
    <main className="flex-grow w-full px-2 md:px-4 py-3 md:py-5">
      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">inventory_2</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading products...</p>
        </div>
      ) : (
        <>
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
                <span className="text-on-surface-variant">Showing {Math.min(filteredProducts.length, (currentPage - 1) * productsPerPage + 1)}-{Math.min(currentPage * productsPerPage, totalProducts)} of {totalProducts} Items</span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent border border-outline-variant rounded-none py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald cursor-pointer"
                  >
                    <option value="recommended">Sort by: Recommended</option>
                    <option value="price">Price: Low to High</option>
                    <option value="-price">Price: High to Low</option>
                    <option value="-createdAt">New Arrivals</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
                </div>
              </div>
            </div>
          </div>

          {/* Collection Navigation */}
          <div className="mb-8 overflow-x-auto">
            <div className="flex gap-3 pb-2 min-w-max">
              <button
                onClick={() => setSearchParams(new URLSearchParams())}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-label-caps text-label-caps transition-all whitespace-nowrap ${
                  activeFilterCount === 0 && !searchParams.toString()
                    ? 'bg-deep-emerald text-surface-white'
                    : 'bg-surface-container-low text-charcoal-text hover:bg-surface-container hover:text-deep-emerald border border-outline-variant'
                }`}
              >
                All Jewellery
              </button>
              {collections.slice(0, 8).map((collection) => (
                <button
                  key={collection._id || collection.id}
                  onClick={() => handleCollectionClick(collection.name || collection.title)}
                  className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-label-caps text-label-caps transition-all whitespace-nowrap border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:text-deep-emerald`}
                >
                  {collection.name || collection.title}
                </button>
              ))}
              {!collectionsLoading && collections.length === 0 && (
                <>
                  {COLLECTION_ORDER.map((coll) => (
                    <button
                      key={coll}
                      onClick={() => handleCollectionClick(coll)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-label-caps text-label-caps transition-all whitespace-nowrap border border-outline-variant bg-surface-container-low hover:bg-surface-container hover:text-deep-emerald`}
                    >
                      {coll}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Filter Toggle (Mobile) */}
            <div className="md:hidden mb-4">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-surface-container-low border border-outline-variant text-charcoal-text font-label-caps text-label-caps rounded hover:bg-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px]">filter_list</span>
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
            </div>

            {/* Left Sidebar Filters */}
            <aside className={`w-full md:w-64 flex-shrink-0 space-y-8 ${
              mobileFiltersOpen ? 'block' : 'hidden'
            } md:block`}>
              <div className="space-y-6">
                {/* Category Filter */}
                <div>
                  <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
                    Category <span className="material-symbols-outlined text-[18px]">remove</span>
                  </h3>
                  <div className="space-y-3">
                    {categories.map((category) => (
                      <label key={category._id || category.id} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          checked={filters.category.includes(category.name)}
                          onChange={() => toggleCheckboxFilter('category', category.name)}
                          className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                          type="checkbox"
                        />
                        <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{category.name}</span>
                      </label>
                    ))}
                    {categories.length === 0 && (
                      <p className="text-xs text-on-surface-variant">No categories available</p>
                    )}
                  </div>
                </div>

                {/* Collection Filter */}
                <div>
                  <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
                    Collection <span className="material-symbols-outlined text-[18px]">remove</span>
                  </h3>
                  <div className="space-y-3">
                    {availableCollections.length > 0 ? (
                      availableCollections.map((collection) => (
                        <label key={collection} className="flex items-center space-x-3 cursor-pointer group">
                          <input
                            checked={filters.collection.includes(collection)}
                            onChange={() => toggleCheckboxFilter('collection', collection)}
                            className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                            type="checkbox"
                          />
                          <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{collection}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-xs text-on-surface-variant">No collections available</p>
                    )}
                  </div>
                </div>

                {/* Bridal & Wedding Filters */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      checked={filters.bridal}
                      onChange={() => toggleBooleanFilter('bridal')}
                      className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                      type="checkbox"
                    />
                    <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">Bridal</span>
                  </label>
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      checked={filters.wedding}
                      onChange={() => toggleBooleanFilter('wedding')}
                      className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                      type="checkbox"
                    />
                    <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">Wedding</span>
                  </label>
                </div>

                {/* On Sale Filter */}
                <div className="space-y-3">
                  <label className="flex items-center space-x-3 cursor-pointer group">
                    <input
                      checked={filters.sale}
                      onChange={() => toggleBooleanFilter('sale')}
                      className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                      type="checkbox"
                    />
                    <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">On Sale</span>
                  </label>
                </div>

                {/* Metal Filter */}
                <div>
                  <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
                    Metal <span className="material-symbols-outlined text-[18px]">remove</span>
                  </h3>
                  <div className="space-y-3">
                    {availableMetals.map((metal) => (
                      <label key={metal} className="flex items-center space-x-3 cursor-pointer group">
                        <input
                          checked={filters.metal.includes(metal)}
                          onChange={() => toggleCheckboxFilter('metal', metal)}
                          className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald"
                          type="checkbox"
                        />
                        <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">{metal}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
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
                      onChange={(e) => setPriceRange(filters.priceRange[0], parseInt(e.target.value))}
                      className="w-full h-2 bg-outline-variant rounded-full accent-deep-emerald cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                      <span>₹{filters.priceRange[0]}</span>
                      <span>₹{filters.priceRange[1]}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={clearAllFilters}
                  className="w-full py-3 bg-surface border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="flex-1">
              {filteredProducts.length === 0 ? (
                <div className="text-center py-20">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">search_off</span>
                  <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">No Jewellery Found</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
                    We couldn't find any products matching your current filters. Try adjusting your search or clearing filters.
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">clear</span>
                    Clear All Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  <div className="mt-20 flex justify-center items-center space-x-2">
                    <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      if (totalPages <= 5) return i + 1
                      const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4))
                      return start + i
                    }).map((page) => (
                      <button key={page} onClick={() => goToPage(page)} className={`w-10 h-10 border flex items-center justify-center text-sm transition-colors ${currentPage === page ? 'border-deep-emerald bg-deep-emerald text-surface-white' : 'border-outline-variant text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald'}`}>
                        {page}
                      </button>
                    ))}
                    {totalPages > 6 && (
                      <>
                        <span className="px-2 text-on-surface-variant">...</span>
                        <button onClick={() => goToPage(totalPages)} className={`w-10 h-10 border flex items-center justify-center text-sm transition-colors ${currentPage === totalPages ? 'border-deep-emerald bg-deep-emerald text-surface-white' : 'border-outline-variant text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald'}`}>
                          {totalPages}
                        </button>
                      </>
                    )}
                    <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </main>
  )
}






















