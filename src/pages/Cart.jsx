import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { resolveImageUrl } from '../utils/apiUrl'

export default function Cart() {
  const { items, itemCount, subtotal, updateQuantity, removeItem, clearCart } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const TAX_RATE = 0.05
  const SHIPPING_FEE = 0
  const taxAmount = subtotal * TAX_RATE
  const grandTotal = subtotal + taxAmount + SHIPPING_FEE

  if (itemCount === 0) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-6 block">
            shopping_cart
          </span>
          <h2 className="font-display-lg text-display-lg text-deep-emerald mb-4">Your Cart is Empty</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 max-w-md mx-auto">
            Looks like you haven't added any jewellery to your cart yet. Browse our collection and find something special.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">shop</span>
            Continue Shopping
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      <h1 className="font-display-lg text-display-lg text-deep-emerald mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-surface-white border border-outline-variant rounded-lg p-4 flex gap-4 items-center">
              <div className="w-20 h-20 flex-shrink-0 bg-surface-container-low rounded overflow-hidden">
                <img
                  src={resolveImageUrl(item.image)}
                  alt={item.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-body-md text-body-md text-primary font-medium truncate">{item.name}</h3>
                {item.SKU && (
                  <p className="text-xs text-on-surface-variant mt-1">SKU: {item.SKU}</p>
                )}
                <div className="flex items-center gap-4 mt-2">
                  <span className="font-body-md text-body-md text-primary font-semibold">
                    ₹ {item.price.toLocaleString('en-IN')}
                  </span>
                  {item.originalPrice && (
                    <span className="text-sm text-on-surface-variant line-through">
                      ₹ {item.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-shrink-0 flex items-center gap-2">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald transition-colors disabled:opacity-40"
                >
                  <span className="material-symbols-outlined text-[14px]">remove</span>
                </button>
                <span className="w-8 text-center font-body-md text-body-md text-primary">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="w-8 h-8 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">add</span>
                </button>
              </div>

              <button
                onClick={() => removeItem(item.id)}
                className="flex-shrink-0 w-10 h-10 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error transition-colors"
                title="Remove item"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>
          ))}

          <div className="flex justify-between pt-4">
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm text-on-surface-variant hover:text-error border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
              Clear Cart
            </button>
          </div>
        </div>

        {/* Cart Summary */}
        <div className="lg:col-span-1">
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 sticky top-8">
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-4 border-b border-outline-variant">
              Order Summary
            </h3>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between font-body-md text-body-md">
                <span className="text-on-surface-variant">Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'})</span>
                <span className="text-primary">₹ {subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md">
                <span className="text-on-surface-variant">GST (5%)</span>
                <span className="text-primary">₹ {taxAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between font-body-md text-body-md">
                <span className="text-on-surface-variant">Shipping</span>
                <span className="text-primary">
                  {SHIPPING_FEE === 0 ? 'FREE' : `₹ ${SHIPPING_FEE.toLocaleString('en-IN')}`}
                </span>
              </div>
              <div className="border-t border-outline-variant pt-4 mt-4">
                <div className="flex justify-between font-headline-md text-headline-md">
                  <span className="text-deep-emerald">Grand Total</span>
                  <span className="text-primary">₹ {grandTotal.toLocaleString('en-IN')}</span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1">
                  (Final amount will be confirmed at checkout)
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                if (!isAuthenticated) {
                  navigate('/login', { state: { from: '/cart' } })
                  return
                }
                navigate('/checkout')
              }}
              className="w-full bg-regal-gold text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-regal-gold/90 transition-colors shadow-sm flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
