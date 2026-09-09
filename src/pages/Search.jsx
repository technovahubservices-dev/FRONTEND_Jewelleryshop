import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { productAPI } from '../services/api'
import ProductCard from '../components/products/ProductCard'

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
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  )
}
