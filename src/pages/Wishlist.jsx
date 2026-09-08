import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../services/api'
import { useWishlist } from '../context/WishlistContext'
import ProductCard from '../components/products/ProductCard'
import { resolveImageUrl } from '../utils/apiUrl'

export default function Wishlist() {
  const { ids, remove, clear, count } = useWishlist()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (ids.length === 0) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      setError('')
      try {
        const results = await Promise.allSettled(
          ids.map((id) => productAPI.getById(id))
        )
        const transformed = results
          .filter((r) => r.status === 'fulfilled' && r.value?.data?.success)
          .map((r) => productAPI.transform(r.value.data.data))
          .filter(Boolean)
        setProducts(transformed)
      } catch (err) {
        setError(err.message || 'Failed to load wishlist items')
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [ids])

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-[120px]">
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">Wishlist</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-headline-md text-headline-md text-deep-emerald">
              My Wishlist ({count})
            </h1>
          </div>
          {count > 0 && (
            <button
              onClick={clear}
              className="text-sm text-deep-emerald hover:text-regal-gold transition-colors font-medium underline"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">favorite</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading your wishlist...</p>
        </div>
      ) : error ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-error mb-4">error</span>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/20 mb-4">
            favorite
          </span>
          <h2 className="font-headline-md text-headline-md text-charcoal-text mb-3">
            Your Wishlist is Empty
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
            Items you add to your wishlist will appear here. Save your favorites to easily find them later.
          </p>
          <Link
            to="/shop"
            className="inline-block px-8 py-4 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative group">
              <ProductCard product={product} />
              <button
                onClick={() => remove(product.id)}
                aria-label="Remove from wishlist"
                className="absolute top-4 right-4 w-7 h-7 bg-surface border border-outline-variant rounded-full flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-all opacity-0 group-hover:opacity-100 z-10"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
