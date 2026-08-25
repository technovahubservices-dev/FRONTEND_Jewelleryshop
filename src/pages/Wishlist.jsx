import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userAPI, productAPI } from '../services/api'

export default function Wishlist() {
  const { isAuthenticated } = useAuth()
  const [wishlist, setWishlist] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    fetchWishlist()
  }, [isAuthenticated])

  const fetchWishlist = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await userAPI.getWishlist()
      if (response.data.success) {
        setWishlist(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch wishlist')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch wishlist')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (productId) => {
    setError('')
    setSuccessMessage('')
    try {
      const response = await userAPI.removeFromWishlist(productId)
      if (response.data.success) {
        setWishlist(response.data.data || [])
        setSuccessMessage('Removed from wishlist')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove from wishlist')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Please login to view your wishlist</p>
          <Link to="/login" className="inline-block px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-2 border-b border-outline-variant">My Account</h2>
          <nav className="flex flex-col gap-2 font-body-md text-body-md">
            <Link to="/account" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">person</span>
              Profile Overview
            </Link>
            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">shopping_basket</span>
              My Orders
            </Link>
            <Link to="/account/wishlist" className="flex items-center gap-3 px-4 py-3 bg-surface-white text-deep-emerald font-bold rounded border border-outline-variant shadow-sm transition-all">
              <span className="material-symbols-outlined text-regal-gold">favorite</span>
              Wishlist
            </Link>
            <Link to="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">location_on</span>
              Addresses
            </Link>
            <Link to="/account/settings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        <header className="mb-8">
          <h1 className="font-display-lg text-display-lg text-deep-emerald">My Wishlist</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Items you have saved for later.</p>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-4 block">hourglass_empty</span>
            <p className="font-body-md text-body-md text-on-surface-variant">Loading wishlist...</p>
          </div>
        ) : wishlist.length === 0 ? (
          <div className="text-center py-12 bg-surface-white border border-outline-variant rounded">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">favorite</span>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">Your wishlist is empty</p>
            <Link to="/shop" className="inline-block px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map((product) => (
              <div key={product._id} className="bg-surface-white border border-outline-variant rounded shadow-sm overflow-hidden group">
                <div className="w-full h-64 bg-surface-container-low overflow-hidden">
                  <img
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    alt={product.name}
                    src={product.primaryImage || product.images?.[0] || 'https://placehold.co/400x400'}
                    onError={(e) => { e.target.src = 'https://placehold.co/400x400' }}
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-body-md text-sm font-medium text-deep-emerald mb-1 truncate">{product.name}</h3>
                  <p className="font-body-md text-sm text-on-surface-variant mb-3">{product.category}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-headline-md text-headline-md text-deep-emerald">
                      ₹{product.discountPrice && product.discountPrice > 0 ? Number(product.discountPrice).toLocaleString('en-IN') : Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <button
                      onClick={() => handleRemove(product._id)}
                      className="p-2 text-error hover:bg-error/10 rounded transition-colors"
                      title="Remove from wishlist"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                  <Link
                    to={`/product/${product._id}`}
                    className="mt-3 block w-full py-2 border border-outline-variant text-center text-deep-emerald font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors text-xs"
                  >
                    View Product
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
