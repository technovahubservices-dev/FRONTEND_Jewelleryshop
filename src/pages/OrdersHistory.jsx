import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { resolveImageUrl } from '../utils/apiUrl'

export default function OrdersHistory() {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/account/orders' } })
      return
    }

    const fetchOrders = async () => {
      try {
        const response = await orderAPI.getAll()
        if (response.data.success) {
          setOrders(response.data.data || [])
        } else {
          setError(response.data.message || 'Failed to fetch orders')
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [isAuthenticated, navigate])

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-primary-fixed/20 text-on-primary-fixed-variant border-primary-fixed'
      case 'shipped':
      case 'packed':
        return 'bg-secondary-container/30 text-on-secondary-fixed-variant border-secondary-fixed'
      case 'processing':
      case 'manufacturing':
      case 'quality_check':
        return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
      case 'cancelled':
        return 'bg-error-container/20 text-error border-error-container/30'
      default:
        return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
    }
  }

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'bg-primary-fixed/20 text-on-primary-fixed-variant border-primary-fixed'
      case 'failed':
        return 'bg-error-container/20 text-error border-error-container/30'
      case 'pending':
        return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
      default:
        return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
    }
  }

  const getPaymentStatusLabel = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return 'Paid'
      case 'failed': return 'Failed'
      case 'pending': return 'Pending'
      default: return paymentStatus || 'Pending'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered': return 'Delivered'
      case 'shipped': return 'Shipped'
      case 'packed': return 'Packed'
      case 'quality_check': return 'Quality Check'
      case 'manufacturing': return 'Manufacturing'
      case 'processing': return 'Processing'
      case 'payment_received': return 'Payment Received'
      case 'confirmed': return 'Confirmed'
      case 'new': return 'Order Placed'
      case 'cancelled': return 'Cancelled'
      default: return 'Pending'
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">My Orders</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-deep-emerald mb-2">My Orders</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {user?.name ? `${user.name}'s orders` : 'Track and manage your orders.'}
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">hourglass_empty</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">shopping_bag</span>
          <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">No Orders Yet</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">You haven't placed any orders yet.</p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
          >
            Start Shopping
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order._id || order.id} className="bg-surface-white border border-outline-variant rounded-lg shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <p className="font-label-caps text-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                    Order #{(order._id || order.id).toString().slice(-6).toUpperCase()}
                  </p>
                  <p className="font-body-md text-sm text-on-surface-variant mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-label-caps ${getStatusColor(order.status)} border`}>
                    {getStatusLabel(order.status)}
                  </span>
                  {order.paymentMethod && order.paymentMethod !== 'cod' && (
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-label-caps border ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusLabel(order.paymentStatus)}
                    </span>
                  )}
                </div>
              </div>
              {(order.paymentStatus === 'failed' && order.paymentMethod !== 'cod') && (
                <div className="px-6 py-3 bg-error-container/10 border-b border-error-container/20 flex items-center justify-between">
                  <p className="text-xs text-error">Payment failed. You can retry or choose a different payment method.</p>
                  <Link
                    to={`/payment?orderId=${order._id}&method=${order.paymentMethod}`}
                    className="text-xs font-label-caps text-deep-emerald hover:text-regal-gold transition-colors"
                  >
                    Retry Payment
                  </Link>
                </div>
              )}
              <div className="p-6 space-y-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 bg-surface-container-low rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                      {item.image && (
                        <img
                          className="w-full h-full object-cover"
                          alt={item.name}
                          src={resolveImageUrl(item.image)}
                          onError={(e) => { e.target.src = 'https://placehold.co/64x64'; }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-body-md text-sm text-deep-emerald">{item.name || 'Product'}</p>
                      <p className="text-xs text-on-surface-variant">Qty: {item.quantity} × ₹ {item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-body-md text-sm text-deep-emerald">
                        ₹ {(item.price * item.quantity).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="flex justify-between pt-4 border-t border-outline-variant font-headline-md text-headline-md text-deep-emerald">
                  <span>Total</span>
                  <span>{formatCurrency(order.totalPrice)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
