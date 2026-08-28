import { createContext, useState, useContext, useEffect } from 'react'
import { useAuth } from './AuthContext'
import { userAPI } from '../services/api'

const WishlistContext = createContext()

export const WishlistProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setWishlistItems([])
      return
    }
    setLoading(true)
    try {
      const response = await userAPI.getWishlist()
      if (response.data.success) {
        setWishlistItems(response.data.data || [])
      }
    } catch (err) {
      console.error('Failed to fetch wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshWishlist()
  }, [isAuthenticated])

  const addToWishlist = async (productId) => {
    if (!isAuthenticated) return false
    try {
      const response = await userAPI.addToWishlist(productId)
      if (response.data.success) {
        setWishlistItems(response.data.data || [])
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to add to wishlist:', err)
      return false
    }
  }

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated) return false
    try {
      const response = await userAPI.removeFromWishlist(productId)
      if (response.data.success) {
        setWishlistItems(response.data.data || [])
        return true
      }
      return false
    } catch (err) {
      console.error('Failed to remove from wishlist:', err)
      return false
    }
  }

  const isInWishlist = (productId) => {
    return wishlistItems.some((item) => item._id === productId || item.id === productId)
  }

  const value = {
    wishlistItems,
    loading,
    refreshWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
