import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'
import { useNavigate } from 'react-router-dom'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, updateQuantity, removeFromCart, totalItems, subtotal, validateCart, removeInvalidItems, validationErrors, validating } = useCart()
  const [couponCode, setCouponCode] = useState('')
  const [couponMessage, setCouponMessage] = useState('')
  const [validationMessage, setValidationMessage] = useState('')

  useEffect(() => {
    const runValidation = async () => {
      if (cartItems.length === 0) return
      const result = await validateCart()
      if (!result.valid) {
        const invalidCount = result.errors.length
        setValidationMessage(`${invalidCount} item${invalidCount > 1 ? 's' : ''} in your cart ${result.errors[0].reason.toLowerCase()}. Please update or remove them.`)
      } else {
        setValidationMessage('')
      }
    }
    runValidation()
  }, [cartItems.length, validateCart])

  const handleRemoveInvalid = () => {
    removeInvalidItems()
    setValidationMessage('')
  }

  const handleCheckout = () => {
    if (validationErrors.length > 0) {
      setValidationMessage('Please remove or update invalid items before checkout.')
      return
    }
    navigate('/checkout')
  }

  const handleApplyCoupon = (e) => {
    e.preventDefault()
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code')
      return
    }
    setCouponMessage(`Coupon code "${couponCode}" applied successfully`)
  }

  const getItemValidation = (itemId) => {
    return validationErrors.find((e) => e.id === itemId)
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
      <div className="mb-12">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-4">Your Shopping Bag</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">{totalItems} {totalItems === 1 ? 'Item' : 'Items'}</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-8">
          {cartItems.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4">shopping_bag</span>
              <p className="font-body-md text-body-md text-on-surface-variant">Your cart is empty</p>
            </div>
          ) : (
            cartItems.map((item) => {
              const validation = getItemValidation(item.id)
              return (
              <div key={item.id} className={`bg-surface-white border ${validation ? 'border-error' : 'border-outline-variant'} p-6 flex flex-col sm:flex-row gap-6 relative shadow-sm hover:shadow-md transition-shadow`}>
                <div className="w-full sm:w-48 h-48 bg-soft-cream flex-shrink-0">
                  <img className="w-full h-full object-cover" alt={item.description} src={item.image} />
                </div>
                <div className="flex-col flex-grow flex justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-headline-md text-headline-md text-deep-emerald">{item.name}</h3>
                      <p className="font-headline-md text-headline-md text-deep-emerald">₹ {(item.price * item.quantity).toLocaleString('en-IN')}</p>
                    </div>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-1">SKU: {item.SKU}</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mb-4">{item.metal}</p>
                    {validation && (
                      <div className="mb-4 p-3 bg-error-container/10 border border-error/20 rounded-lg">
                        <p className="text-sm text-error flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">error</span>
                          {validation.reason}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-4 gap-4">
                    <div className="flex items-center border border-outline-variant px-3 py-1">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="text-on-surface hover:text-deep-emerald p-1">
                        <span className="material-symbols-outlined text-sm">remove</span>
                      </button>
                      <span className="mx-4 font-body-md text-body-md">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="text-on-surface hover:text-deep-emerald p-1">
                        <span className="material-symbols-outlined text-sm">add</span>
                      </button>
                    </div>
                    <div className="flex space-x-4">
                      <button onClick={() => navigate('/account')} className="font-label-caps text-label-caps text-on-surface-variant hover:text-regal-gold transition-colors flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">favorite</span> Move to Wishlist
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="font-label-caps text-label-caps text-on-surface-variant hover:text-error transition-colors flex items-center">
                        <span className="material-symbols-outlined text-sm mr-1">delete</span> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              )
            })
          )}
        </div>
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-surface-white border border-outline-variant p-8 shadow-sm sticky top-32">
            <h2 className="font-headline-md text-headline-md text-deep-emerald border-b border-outline-variant pb-4 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 font-body-md text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal ({totalItems} {totalItems === 1 ? 'Item' : 'Items'})</span>
                 <span className="text-on-surface">₹ {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Making Charges</span>
                 <span className="text-on-surface">₹ 150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tax</span>
                 <span className="text-on-surface">₹ 120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivery</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
            </div>
            {/* Coupon Input */}
            <div className="mb-6 border-t border-b border-outline-variant py-6">
              <form onSubmit={handleApplyCoupon} className="flex">
                <input
                  className="w-full bg-soft-cream border-t border-l border-b border-outline-variant px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-deep-emerald focus:ring-0"
                  placeholder="Enter Coupon Code"
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button type="submit" className="bg-surface-white border border-outline-variant px-6 font-label-caps text-label-caps text-deep-emerald hover:bg-surface-container-low transition-colors">APPLY</button>
              </form>
              {couponMessage && (
                <p className="text-sm mt-2 text-deep-emerald">{couponMessage}</p>
              )}
            </div>

            {validationMessage && (
              <div className="mb-6 p-4 bg-error-container/10 border border-error/20 text-error rounded-lg text-sm flex items-start gap-2">
                <span className="material-symbols-outlined text-[18px] mt-0.5">error</span>
                <div className="flex-1">
                  <p>{validationMessage}</p>
                  {validationErrors.length > 0 && (
                    <button
                      onClick={handleRemoveInvalid}
                      className="mt-2 text-xs font-semibold underline hover:no-underline"
                    >
                      Remove invalid items
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mb-8">
              <span className="font-headline-md text-headline-md text-deep-emerald">Total</span>
              <span className="font-headline-md text-headline-md text-deep-emerald">₹ {(subtotal + 270).toLocaleString('en-IN')}</span>
            </div>
             <button onClick={handleCheckout} className="w-full bg-deep-emerald text-white font-label-caps text-label-caps py-4 tracking-widest hover:bg-opacity-90 transition-opacity">
               PROCEED TO CHECKOUT
             </button>
            <div className="mt-6 flex items-center justify-center space-x-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
