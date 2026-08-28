import { createContext, useState, useEffect, useContext } from 'react'
import { orderAPI, productAPI } from '../services/api'

const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false
  return /^[0-9a-f]{24}$/i.test(id)
}

const CartContext = createContext()

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    const stored = localStorage.getItem('cart')
    if (!stored) return []
    try {
      const parsed = JSON.parse(stored)
      if (!Array.isArray(parsed)) return []
      return parsed.filter((item) => isValidObjectId(item.id))
    } catch {
      return []
    }
  })

  const [validationErrors, setValidationErrors] = useState([])
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems))
  }, [cartItems])

  const validateCart = async () => {
    if (cartItems.length === 0) {
      setValidationErrors([])
      return { valid: true, errors: [] }
    }

    setValidating(true)
    setValidationErrors([])

    try {
      const results = await Promise.all(
        cartItems.map(async (item) => {
          try {
            const response = await productAPI.getById(item.id)
            if (!response.data.success) {
              return {
                id: item.id,
                valid: false,
                reason: 'Product not found',
                code: 'not_found',
              }
            }

            const product = response.data.data
            const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price
            const currentStock = product.stock ?? 0

            if (currentStock < item.quantity) {
              return {
                id: item.id,
                valid: false,
                reason: `Only ${currentStock} items left in stock`,
                code: 'out_of_stock',
                availableStock: currentStock,
                currentPrice,
              }
            }

            if (currentPrice !== item.price) {
              return {
                id: item.id,
                valid: false,
                reason: `Price changed from ₹${item.price} to ₹${currentPrice}`,
                code: 'price_changed',
                currentPrice,
              }
            }

            return {
              id: item.id,
              valid: true,
              currentPrice,
              currentStock,
            }
          } catch (err) {
            return {
              id: item.id,
              valid: false,
              reason: 'Unable to verify product',
              code: 'error',
            }
          }
        })
      )

      const errors = results.filter((r) => !r.valid)
      setValidationErrors(errors)
      return { valid: errors.length === 0, errors, results }
    } finally {
      setValidating(false)
    }
  }

  const removeInvalidItems = () => {
    const invalidIds = new Set(validationErrors.map((e) => e.id))
    if (invalidIds.size === 0) return
    setCartItems((prev) => prev.filter((item) => !invalidIds.has(item.id)))
    setValidationErrors([])
  }

  const syncCartWithBackend = () => {
    setCartItems((prev) =>
      prev.map((item) => {
        const validation = validationErrors.find((e) => e.id === item.id)
        if (!validation || !validation.currentPrice) return item
        return { ...item, price: validation.currentPrice }
      })
    )
    setValidationErrors([])
  }

  const addToCart = (product, quantity = 1) => {
    const productId = String(product.id || '').trim()
    if (!isValidObjectId(productId)) return
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === productId)
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { ...product, quantity }]
    })
  }

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    )
  }

  const clearCart = () => {
    setCartItems([])
    setValidationErrors([])
  }

  const placeOrder = async (orderData, idempotencyKey) => {
    try {
      const response = await orderAPI.create({ ...orderData, idempotencyKey })
      if (response.data.success) {
        if (orderData.paymentMethod === 'cod') {
          clearCart()
        }
        return response.data.data
      }
      throw new Error(response.data.message || 'Failed to place order')
    } catch (error) {
      throw error.response?.data?.message || error.message || 'Failed to place order'
    }
  }

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const value = {
    cartItems,
    validationErrors,
    validating,
    validateCart,
    removeInvalidItems,
    syncCartWithBackend,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    placeOrder,
    totalItems,
    subtotal,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
