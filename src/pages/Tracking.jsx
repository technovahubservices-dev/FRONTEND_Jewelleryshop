import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'

export default function Tracking() {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/account/tracking' } })
    }
  }, [isAuthenticated, navigate])

  const handleTrack = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setOrder(null)

    try {
      const response = await orderAPI.getById(orderId.trim())
      if (response.data.success) {
        setOrder(response.data.data)
      } else {
        setError(response.data.message || 'Order not found')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to track order')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) return null

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'text-blue-600 bg-blue-50'
      case 'confirmed': return 'text-purple-600 bg-purple-50'
      case 'processing': return 'text-orange-600 bg-orange-50'
      case 'shipped': return 'text-indigo-600 bg-indigo-50'
      case 'delivered': return 'text-green-600 bg-green-50'
      case 'cancelled': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-8">Track Your Order</h1>

        <form onSubmit={handleTrack} className="mb-8">
          <div className="flex gap-4">
            <input
              type="text"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              placeholder="Enter Order ID"
              className="flex-1 bg-soft-cream border border-outline-variant px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-deep-emerald focus:ring-0"
              required
            />
            <button type="submit" className="bg-deep-emerald text-surface-white px-8 py-3 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors">
              Track
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 animate-spin">refresh</span>
          </div>
        )}

        {order && !loading && (
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-1">Order #{order._id}</h2>
                <p className="text-sm text-on-surface-variant">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between py-3 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Payment Status</span>
                <span className={`font-medium ${order.isPaid ? 'text-green-600' : 'text-orange-600'}`}>
                  {order.paymentStatus || 'pending'}
                </span>
              </div>
              <div className="flex justify-between py-3 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Shipping Status</span>
                <span className="font-medium text-deep-emerald">{order.shippingStatus || 'not_shipped'}</span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between py-3 border-b border-outline-variant/50">
                  <span className="text-on-surface-variant">Tracking Number</span>
                  <span className="font-medium text-deep-emerald">{order.trackingNumber}</span>
                </div>
              )}
              <div className="flex justify-between py-3 border-b border-outline-variant/50">
                <span className="text-on-surface-variant">Total Amount</span>
                <span className="font-medium text-deep-emerald">₹ {Number(order.totalPrice || 0).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div>
                <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Items</h3>
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-outline-variant/30 last:border-0">
                      <div>
                        <p className="font-body-md text-body-md text-on-surface">{item.name}</p>
                        <p className="text-sm text-on-surface-variant">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-medium text-deep-emerald">₹ {(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="mt-6">
                <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Tracking History</h3>
                <div className="space-y-3">
                  {order.statusHistory.map((history, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-deep-emerald mt-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-on-surface capitalize">{history.status.replace('_', ' ')}</p>
                        <p className="text-xs text-on-surface-variant">{new Date(history.timestamp).toLocaleString()}</p>
                        {history.note && <p className="text-xs text-on-surface-variant mt-1">{history.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
