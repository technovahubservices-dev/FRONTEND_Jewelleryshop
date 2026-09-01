import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { productAPI } from '../services/api'

export default function Search() {
  const navigate = useNavigate()
  const location = useLocation()

  const query = new URLSearchParams(location.search).get('q') || ''
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState(query)

  useEffect(() => {
    const fetchProducts = async () => {
      const params = {}
      if (searchTerm.trim()) {
        params.search = searchTerm.trim()
      }
      try {
        const response = await productAPI.getAll(params);
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
  }, [searchTerm]);

  const handleSearch = (e) => {
    e.preventDefault()
    const term = e.target.elements.search.value
    setSearchTerm(term)
    setProducts([])
    setLoading(true)
    const params = new URLSearchParams()
    if (term.trim()) params.set('q', term.trim())
    navigate(`/search?${params.toString()}`)
  }

  const handleQuickView = (product) => {
    navigate(`/product/${product.id}`)
  }

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">search</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Searching products...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      <div className="mb-8">
        <form onSubmit={handleSearch} className="relative max-w-2xl">
          <span className="material-symbols-outlined absolute left-4 top-1/2 transform -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            name="search"
            type="search"
            defaultValue={searchTerm}
            className="w-full pl-12 pr-14 py-3 border border-outline-variant rounded-lg focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Search by product name, SKU, or description..."
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant hover:text-deep-emerald transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">search</span>
          </button>
        </form>
      </div>

      <div className="mb-6">
        <h1 className="font-headline-lg text-headline-lg text-deep-emerald mb-2">Search Results</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {searchTerm
            ? `Showing ${products.length} result${products.length !== 1 ? 's' : ''} for "${searchTerm}"`
            : 'Showing all products'}
        </p>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">
            search_off
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            No products found. Try adjusting your search terms.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/product/${product.id}`} className="group block">
              <div className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-surface-container-low">
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
                  <span className="font-label-caps text-label-caps text-[10px] text-on-surface-variant/70 uppercase tracking-wider">
                    JKR
                  </span>
                </div>
                <div className="px-4 pb-4 flex flex-col text-center">
                  <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                    {product.name}
                  </h3>
                  <div className="mb-4">
                    <span className="font-headline-md text-lg text-deep-emerald">
                      ₹ {product.price}
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
    </main>
  )
}
