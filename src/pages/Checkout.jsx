import { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const isValidObjectId = (id) => {
  if (!id || typeof id !== 'string') return false
  return /^[0-9a-f]{24}$/i.test(id)
}

export default function Checkout() {
  const navigate = useNavigate()
  const { cartItems, subtotal, placeOrder, clearCart, validateCart, validationErrors } = useCart()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    pincode: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [idempotencyKey, setIdempotencyKey] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cod')

  const generateIdempotencyKey = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID()
    }
    return `idemp_${Date.now()}_${Math.random().toString(36).slice(2, 15)}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIdempotencyKey(generateIdempotencyKey())

    if (!formData.fullName.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim()) {
      setError('Please fill in all required fields')
      return
    }

    if (cartItems.length === 0) {
      setError('Your cart is empty')
      return
    }

    const validation = await validateCart()
    if (!validation.valid) {
      const firstError = validation.errors[0]
      setError(`Cart validation failed: ${firstError.reason}. Please update your cart before checkout.`)
      return
    }

    setLoading(true)
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product: item.id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
        })),
        shippingAddress: {
          fullName: formData.fullName,
          pincode: formData.pincode,
          address: formData.address,
          landmark: formData.landmark,
          city: formData.city,
          state: formData.state,
        },
        paymentMethod: paymentMethod || 'cod',
        itemsPrice: subtotal,
        taxPrice: Math.round(subtotal * 0.03),
        shippingPrice: subtotal >= 5000 ? 0 : 150,
        totalPrice: subtotal + Math.round(subtotal * 0.03) + (subtotal >= 5000 ? 0 : 150),
      }

      const order = await placeOrder(orderData, idempotencyKey)

      if (paymentMethod === 'cod') {
        navigate('/order-confirmation')
      } else {
        navigate(`/payment?orderId=${order._id || order.id}&method=${paymentMethod}`)
      }
    } catch (err) {
      setError(err || 'Failed to place order. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const shippingCost = subtotal >= 5000 ? 0 : 150
  const tax = Math.round(subtotal * 0.03)
  const total = subtotal + tax + shippingCost

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Main Checkout Content (Left Side) */}
      <div className="lg:col-span-8 flex flex-col gap-10">
        {/* Progress Indicator */}
        <nav aria-label="Progress" className="mb-6">
          <ol className="flex items-center" role="list">
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-deep-emerald"></div>
              </div>
              <button type="button" onClick={() => navigate('/login')} className="relative flex h-8 w-8 items-center justify-center rounded-full bg-deep-emerald hover:bg-surface-tint">
                <span className="material-symbols-outlined text-white text-sm" data-icon="check" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-deep-emerald whitespace-nowrap">LOGIN</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-deep-emerald"></div>
              </div>
              <button aria-current="step" type="button" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-deep-emerald bg-surface-white">
                <span className="font-label-caps text-label-caps text-deep-emerald">2</span>
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-deep-emerald whitespace-nowrap font-bold">ADDRESS</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-outline-variant"></div>
              </div>
              <button type="button" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">3</span>
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">SHIPPING</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-outline-variant"></div>
              </div>
              <button type="button" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">4</span>
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">PAYMENT</span>
            </li>
            <li className="relative">
              <button type="button" className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">5</span>
              </button>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">DONE</span>
            </li>
          </ol>
        </nav>
        {/* Address Form Container */}
        <section className="bg-surface-white rounded-lg p-6 md:p-10 border border-outline-variant shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
            Shipping Address
          </h2>
          {error && (
            <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="fullName">Full Name</label>
              <input autoComplete="name" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="fullName" name="fullName" placeholder="Enter your full name" type="text" value={formData.fullName} onChange={handleChange} required />
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="pincode">Pincode</label>
              <input autoComplete="postal-code" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="pincode" name="pincode" placeholder="e.g. 400001" type="text" value={formData.pincode} onChange={handleChange} />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="address">Address (House No, Building, Street, Area)</label>
              <input autoComplete="street-address" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="address" name="address" type="text" value={formData.address} onChange={handleChange} required />
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="landmark">Landmark (Optional)</label>
              <input className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="landmark" name="landmark" type="text" value={formData.landmark} onChange={handleChange} />
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="city">City</label>
              <input autoComplete="address-level2" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="city" name="city" placeholder="e.g. Mumbai" type="text" value={formData.city} onChange={handleChange} required />
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="state">State</label>
              <select autoComplete="address-level1" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="state" name="state" value={formData.state} onChange={handleChange} required>
                <option value="">Select State</option>
                <option value="MH">Maharashtra</option>
                <option value="DL">Delhi</option>
                <option value="KA">Karnataka</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 mt-6">
              <button
                className="w-full md:w-auto bg-deep-emerald text-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Placing Order...
                  </>
                ) : (
                  <>
                    PLACE ORDER
                    <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </section>
        {/* Payment Options */}
        <section className="bg-surface-white rounded-lg p-6 md:p-10 border border-outline-variant shadow-sm flex flex-col gap-6">
          <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-3">
            <span className="material-symbols-outlined" data-icon="payments">payments</span>
            Payment Method
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-deep-emerald bg-deep-emerald/5' : 'border-outline-variant hover:border-outline'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-deep-emerald focus:ring-deep-emerald"
              />
              <div>
                <p className="font-body-md font-semibold text-deep-emerald">Cash on Delivery</p>
                <p className="text-xs text-on-surface-variant">Pay when you receive</p>
              </div>
            </label>
            <label className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${paymentMethod === 'card' ? 'border-deep-emerald bg-deep-emerald/5' : 'border-outline-variant hover:border-outline'}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="card"
                checked={paymentMethod === 'card'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-4 h-4 text-deep-emerald focus:ring-deep-emerald"
              />
              <div>
                <p className="font-body-md font-semibold text-deep-emerald">Card / UPI / Net Banking</p>
                <p className="text-xs text-on-surface-variant">Pay online securely</p>
              </div>
            </label>
          </div>
        </section>
      </div>
      {/* Order Summary Sidebar (Right Side) */}
      <div className="lg:col-span-4 mt-10 lg:mt-0">
        <div className="sticky top-28 bg-surface-white rounded-lg p-6 border border-outline-variant shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-deep-emerald border-b border-outline-variant pb-4">Order Summary</h3>
          {/* Product Items */}
          {cartItems.map((item) => (
            <div key={item.id} className="flex gap-4 items-center">
              <div className="w-20 h-20 bg-surface-container-low rounded shrink-0 overflow-hidden relative">
                <img className="object-cover w-full h-full" alt={item.name} src={item.image} />
              </div>
              <div className="flex-grow">
                <p className="font-body-md font-semibold text-deep-emerald line-clamp-1">{item.name}</p>
                <p className="text-sm text-on-surface-variant">Qty: {item.quantity}</p>
                <p className="font-body-md text-on-background mt-1">₹ {item.price.toLocaleString('en-IN')}</p>
              </div>
            </div>
          ))}
          <hr className="border-outline-variant"/>
          {/* Cost Breakdown */}
          <div className="flex flex-col gap-3 font-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
              <span>₹ {subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className={shippingCost === 0 ? "text-deep-emerald font-semibold" : ""}>
                {shippingCost === 0 ? "Free" : `₹ ${shippingCost}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included)</span>
              <span>₹ {tax.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <hr className="border-outline-variant"/>
          <div className="flex justify-between font-headline-md text-headline-md text-deep-emerald">
            <span>Total</span>
            <span>₹ {total.toLocaleString('en-IN')}</span>
          </div>
          {/* Trust Badges */}
          <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="verified_user">verified_user</span>
              <span>100% Secure Payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="workspace_premium">workspace_premium</span>
              <span>BIS Hallmarked Jewellery</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="local_shipping">local_shipping</span>
              <span>Insured Free Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
