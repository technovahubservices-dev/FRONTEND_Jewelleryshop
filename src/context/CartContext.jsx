import { createContext, useState, useEffect, useContext } from 'react'

const CartContext = createContext()

const CART_STORAGE_KEY = 'jkr_cart'

const loadCartFromStorage = () => {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed?.items)) {
        return parsed.items
      }
    }
  } catch {
    // ignore parse errors
  }
  return []
}

const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ items }))
  } catch {
    // ignore write errors
  }
}

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(loadCartFromStorage)

  useEffect(() => {
    saveCartToStorage(items)
  }, [items])

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === product.id)
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        }
        return updated
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id)
      return
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getItemCount = () =>
    items.reduce((sum, item) => sum + item.quantity, 0)

  const getSubtotal = () =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const getItemById = (id) =>
    items.find((item) => item.id === id)

  const value = {
    items,
    itemCount: getItemCount(),
    subtotal: getSubtotal(),
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemById,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
