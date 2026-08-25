import { Link, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'

export default function Account() {
  const navigate = useNavigate()
  const { user, logout, isAuthenticated } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/account' } })
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

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

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
    <div className="flex-grow flex w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-2 border-b border-outline-variant">My Account</h2>
          <nav className="flex flex-col gap-2 font-body-md text-body-md">
            <Link to="/account" className="flex items-center gap-3 px-4 py-3 bg-surface-white text-deep-emerald font-bold rounded border border-outline-variant shadow-sm transition-all">
              <span className="material-symbols-outlined text-regal-gold">person</span>
              Profile Overview
            </Link>
            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">shopping_basket</span>
              My Orders
            </Link>
            <Link to="/account/wishlist" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">favorite</span>
              Wishlist
            </Link>
            <Link to="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">location_on</span>
              Addresses
            </Link>
            <Link to="/account/settings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </Link>
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container hover:text-error rounded transition-all mt-8 w-full text-left">
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </button>
          </nav>
        </div>
      </aside>
      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col gap-12">
        <header className="mb-4">
          <h1 className="font-display-lg text-display-lg text-deep-emerald">Welcome Back, {user?.name || 'User'}.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your personal details, view orders, and track your loyalty status.</p>
        </header>

        {/* Profile Overview Section */}
        <section className="bg-surface-white p-8 border border-outline-variant rounded shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Personal Information</h3>
            <Link to="/account/settings" className="text-on-surface-variant hover:text-deep-emerald transition-colors">
              <span className="material-symbols-outlined">edit</span>
            </Link>
          </div>
          <div className="space-y-6 font-body-md text-body-md">
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Full Name</p>
              <p className="text-on-surface font-medium">{user?.name || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Email Address</p>
              <p className="text-on-surface font-medium">{user?.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-on-surface-variant mb-1">Phone Number</p>
              <p className="text-on-surface font-medium">{user?.phone || 'Not set'}</p>
            </div>
          </div>
        </section>

        {/* Order History Section */}
        <section className="bg-surface-white p-8 border border-outline-variant rounded shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Order History</h3>
            <Link to="/account/orders" className="font-label-caps text-label-caps text-regal-gold hover:text-deep-emerald uppercase transition-colors">View All Orders</Link>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-4">hourglass_empty</span>
              <p className="font-body-md text-body-md text-on-surface-variant">Loading orders...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
              {error}
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-4">shopping_bag</span>
              <p className="font-body-md text-body-md text-on-surface-variant">You have no orders yet</p>
              <Link to="/shop" className="inline-block mt-4 text-deep-emerald hover:text-regal-gold font-medium">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left font-body-md text-body-md border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                    <th className="pb-4 font-semibold w-1/3">Order</th>
                    <th className="pb-4 font-semibold px-4">Date</th>
                    <th className="pb-4 font-semibold px-4 text-right">Total</th>
                    <th className="pb-4 font-semibold pl-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50">
                  {orders.slice(0, 3).map((order) => (
                    <tr key={order._id || order.id} className="group hover:bg-surface-container-lowest transition-colors">
                      <td className="py-6 pr-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-surface-container-low rounded flex-shrink-0 overflow-hidden border border-outline-variant/30">
                            {order.items && order.items.length > 0 && (
                              <img
                                className="w-full h-full object-cover"
                                alt={order.items[0].name}
                                src={order.items[0].image || 'https://placehold.co/64x64'}
                                onError={(e) => { e.target.src = 'https://placehold.co/64x64'; }}
                              />
                            )}
                          </div>
                          <div>
                            <Link to="/account/orders" className="font-medium text-deep-emerald group-hover:text-regal-gold transition-colors">
                              Order #{(order._id || order.id).toString().slice(-6).toUpperCase()}
                            </Link>
                            <p className="text-sm text-on-surface-variant mt-1">{order.items?.length || 0} item(s)</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-4 text-on-surface">{formatDate(order.createdAt)}</td>
                      <td className="py-6 px-4 text-right font-semibold text-deep-emerald">{formatPrice(order.totalPrice)}</td>
                      <td className="py-6 pl-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${getStatusColor(order.status)} border`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
