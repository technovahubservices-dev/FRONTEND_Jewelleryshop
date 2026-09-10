import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { userAPI, orderAPI } from '../services/api'
import { resolveImageUrl } from '../utils/apiUrl'

const initialAddressForm = {
  fullName: '',
  phone: '',
  address: '',
  landmark: '',
  city: '',
  state: '',
  pincode: '',
  isDefault: false,
}

export default function Checkout() {
  const { items, subtotal, clearCart, itemCount } = useCart()
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()

  const [addresses, setAddresses] = useState([])
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [addressesLoading, setAddressesLoading] = useState(true)
  const [addressError, setAddressError] = useState('')

  const [showAddressModal, setShowAddressModal] = useState(false)
  const [addressForm, setAddressForm] = useState(initialAddressForm)
  const [addressFormError, setAddressFormError] = useState('')
  const [addressFormSaving, setAddressFormSaving] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState('cod')
  const [error, setError] = useState('')
  const [orderSubmissionSuccess, setOrderSubmissionSuccess] = useState(false)

  const TAX_RATE = 0.05
  const SHIPPING_FEE = 0
  const taxAmount = subtotal * TAX_RATE
  const grandTotal = subtotal + taxAmount + SHIPPING_FEE

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
      return
    }

    if (itemCount === 0 && !orderSubmissionSuccess) {
      navigate('/cart')
      return
    }

    fetchAddresses()
  }, [isAuthenticated, itemCount, navigate, orderSubmissionSuccess])

  const fetchAddresses = async () => {
    setAddressesLoading(true)
    setAddressError('')
    try {
      const response = await userAPI.getAddresses()
      if (response.data.success) {
        const addrList = response.data.data || []
        setAddresses(addrList)
        const defaultAddr = addrList.find((a) => a.isDefault) || addrList[0]
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id)
        }
      } else {
        setAddressError(response.data.message || 'Failed to fetch addresses')
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || 'Failed to fetch addresses')
    } finally {
      setAddressesLoading(false)
    }
  }

  const handleAddressInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setAddressForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSaveAddress = async (e) => {
    e.preventDefault()
    setAddressFormError('')

    if (!addressForm.fullName.trim() || !addressForm.address.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
      setAddressFormError('Please fill all required fields')
      return
    }

    setAddressFormSaving(true)
    try {
      await userAPI.addAddress(addressForm)
      setShowAddressModal(false)
      setAddressForm(initialAddressForm)
      fetchAddresses()
    } catch (err) {
      setAddressFormError(err.response?.data?.message || 'Failed to save address')
    } finally {
      setAddressFormSaving(false)
    }
  }

  const handlePlaceOrder = async () => {
    setError('')

    if (!selectedAddressId) {
      setError('Please select a shipping address')
      return
    }

    const selectedAddress = addresses.find((a) => a._id === selectedAddressId)
    if (!selectedAddress) {
      setError('Selected address not found')
      return
    }

    const shippingAddress = {
      fullName: selectedAddress.fullName || '',
      phone: selectedAddress.phone || '',
      address: selectedAddress.address || '',
      landmark: selectedAddress.landmark || '',
      city: selectedAddress.city || '',
      state: selectedAddress.state || '',
      pincode: selectedAddress.pincode || '',
    }

    const orderItems = items.map((item) => ({
      product: item.id,
      name: item.name,
      image: item.image,
      price: item.price,
      quantity: item.quantity,
    }))

    try {
      const response = await orderAPI.create({
        items: orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: subtotal,
        taxPrice: taxAmount,
        shippingPrice: SHIPPING_FEE,
        totalPrice: grandTotal,
        idempotencyKey: `cart_${Date.now()}`,
      })

      if (response.data.success) {
        const order = response.data.data

        if (paymentMethod === 'cod') {
           clearCart()
          setOrderSubmissionSuccess(true)
          navigate('/order-confirmation', {
            state: {
              orderId: order._id,
              paymentStatus: 'pending',
            },
          })
        } else {
          clearCart()
          setOrderSubmissionSuccess(true)
          navigate(`/payment?orderId=${order._id}&method=${paymentMethod}`)
        }
      } else {
        setError(response.data.message || 'Failed to create order')
      }
    } catch (err) {
      const errMsg = err.response?.status === 401
        ? 'Your session has expired. Please log in again.'
        : err.response?.data?.message || 'Failed to create order'
      setError(errMsg)
    }
  }

  if (addressesLoading) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading checkout...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      <h1 className="font-display-lg text-display-lg text-deep-emerald mb-8">Checkout</h1>

      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-gutter">
        {/* Left: Shipping & Payment */}
        <div className="space-y-6">
          {/* Address Selection */}
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">Shipping Address</h3>
              <button
                onClick={() => setShowAddressModal(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-deep-emerald text-surface-white text-sm font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                Add Address
              </button>
            </div>

            {addressError && (
              <p className="text-sm text-error mb-2">{addressError}</p>
            )}

            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-2 block">
                  location_on
                </span>
                <p className="font-body-md text-body-md text-on-surface-variant">
                  No saved addresses
                </p>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="mt-3 text-deep-emerald font-medium hover:text-regal-gold transition-colors"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map((address) => (
                  <label
                    key={address._id}
                    className="flex items-start gap-3 p-3 border rounded cursor-pointer hover:bg-surface-container-low transition-colors"
                  >
                    <input
                      type="radio"
                      name="selectedAddress"
                      checked={selectedAddressId === address._id}
                      onChange={() => setSelectedAddressId(address._id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-body-md text-body-md text-primary font-semibold">
                          {address.fullName}
                        </span>
                        {address.isDefault && (
                          <span className="text-xs bg-primary-fixed/20 text-on-primary px-2 py-0.5 rounded">
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-on-surface-variant mt-1">
                        {address.address}
                        {address.landmark && `, ${address.landmark}`}
                        <br />
                        {address.city}, {address.state} - {address.pincode}
                        {address.phone && (
                          <>
                            <br />
                            Phone: {address.phone}
                          </>
                        )}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6">
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl text-deep-emerald">
                    payments
                  </span>
                  <span className="font-body-md text-body-md text-primary">
                    Cash on Delivery
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 border rounded cursor-pointer hover:bg-surface-container-low transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  checked={paymentMethod === 'upi'}
                  onChange={() => setPaymentMethod('upi')}
                />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl" style={{ color: '#34A853' }}>
                    account_balance_wallet
                  </span>
                  <span className="font-body-md text-body-md text-primary">
                    Online Payment (Razorpay)
                  </span>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Right: Order Summary */}
        <div>
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 sticky top-8">
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-4 border-b border-outline-variant">
              Order Summary
            </h3>

            <div className="space-y-4 mb-6 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 items-center">
                  <div className="w-12 h-12 flex-shrink-0 bg-surface-container-low rounded overflow-hidden">
                    <img
                      src={resolveImageUrl(item.image)}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = 'https://placehold.co/400x400?text=No+Image' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-body-md text-primary truncate">{item.name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {item.quantity} × ₹ {item.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              ))}
            </div>

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
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={addresses.length === 0 || !selectedAddressId}
              className="w-full bg-regal-gold text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-regal-gold/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-sm">lock</span>
              Place Order
            </button>
          </div>
        </div>
      </div>

      {/* Address Modal */}
      {showAddressModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowAddressModal(false)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                Add New Address
              </h2>
              <button
                onClick={() => setShowAddressModal(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              {addressFormError && (
                <div className="p-3 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                  {addressFormError}
                </div>
              )}

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={addressForm.fullName}
                  onChange={handleAddressInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Full Name"
                  required
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={addressForm.phone}
                  onChange={handleAddressInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Phone Number"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Address *
                </label>
                <textarea
                  name="address"
                  value={addressForm.address}
                  onChange={handleAddressInputChange}
                  rows="2"
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                  placeholder="Street address"
                  required
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Landmark
                </label>
                <input
                  type="text"
                  name="landmark"
                  value={addressForm.landmark}
                  onChange={handleAddressInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Landmark (optional)"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={addressForm.city}
                    onChange={handleAddressInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={addressForm.state}
                    onChange={handleAddressInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={addressForm.pincode}
                    onChange={handleAddressInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Pincode"
                    required
                  />
                </div>

                <div className="flex items-end">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isDefault"
                      checked={addressForm.isDefault}
                      onChange={handleAddressInputChange}
                      className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
                    />
                    <label className="font-body-md text-on-surface">
                      Set as default
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addressFormSaving}
                  className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50"
                >
                  {addressFormSaving ? 'Saving...' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  )
}
