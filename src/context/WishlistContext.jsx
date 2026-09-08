import { createContext, useState, useEffect, useContext, useCallback } from 'react'

const WishlistContext = createContext()

const STORAGE_KEY = 'jkr_wishlist'

const loadWishlist = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return Array.isArray(parsed) ? parsed : []
    }
  } catch {
    // ignore
  }
  return []
}

const saveWishlist = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

export const WishlistProvider = ({ children }) => {
  const [ids, setIds] = useState(loadWishlist)

  useEffect(() => {
    saveWishlist(ids)
  }, [ids])

  const add = useCallback((productId) => {
    setIds((prev) => (prev.includes(productId) ? prev : [...prev, productId]))
  }, [])

  const remove = useCallback((productId) => {
    setIds((prev) => prev.filter((id) => id !== productId))
  }, [])

  const toggle = useCallback((productId) => {
    setIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    )
  }, [])

  const isInWishlist = useCallback((productId) => ids.includes(productId), [ids])

  const clear = useCallback(() => setIds([]), [])

  const value = {
    ids,
    count: ids.length,
    add,
    remove,
    toggle,
    isInWishlist,
    clear,
  }

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) throw new Error('useWishlist must be used within WishlistProvider')
  return context
}
