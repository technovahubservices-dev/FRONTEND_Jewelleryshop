import { useState, useEffect } from 'react'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import { Link } from 'react-router-dom'

export default function Orders() {
  const { isAdmin } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const orderId = (order._id || order.id).toString().toLowerCase()
    const customerName = (order.user?.name || order.user?.email || '').toLowerCase()
    return orderId.includes(term) || customerName.includes(term)
  })

  const fetchOrders = async () => {
    setLoading(true)
    setError('')
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

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await orderAPI.updateStatus(orderId, newStatus)
      setOrders(orders.map(o =>
        (o._id || o.id) === orderId ? { ...o, status: newStatus } : o
      ))
      setSuccessMessage('Order status updated successfully')
      setError('')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order status')
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order?')) return
    try {
      await orderAPI.delete(orderId)
      setOrders(orders.filter(o => (o._id || o.id) !== orderId))
      setSuccessMessage('Order deleted successfully')
      setError('')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete order')
    }
  }

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

  const getStatusBadge = (status) => {
    const configs = {
      pending: {
        bg: 'bg-surface-container/50',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        label: 'Pending',
        dot: 'bg-outline',
      },
      processing: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Processing',
        dot: 'bg-regal-gold',
      },
      shipped: {
        bg: 'bg-primary-fixed-dim/20',
        text: 'text-on-primary-fixed-variant',
        border: 'border-primary-fixed-dim',
        label: 'Shipped',
        dot: 'bg-deep-emerald',
      },
      delivered: {
        bg: 'bg-primary-fixed/20',
        text: 'text-on-primary-fixed-variant',
        border: 'border-primary-fixed',
        label: 'Delivered',
        dot: 'bg-deep-emerald',
      },
      cancelled: {
        bg: 'bg-error-container/20',
        text: 'text-error',
        border: 'border-error-container/30',
        label: 'Cancelled',
        dot: 'bg-error',
      },
    }
    const cfg = configs[status] || configs.pending
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {cfg.label}
      </span>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Orders</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage customer orders, track shipments, and view order history.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search by Order ID or Customer..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading orders...
              </p>
            </div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                shopping_bag
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                No orders found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Order ID</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Customer</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Amount</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredOrders.map((order) => {
                    const orderId = order._id || order.id
                    return (
                      <tr key={orderId} className="table-row-hover bg-surface-white group">
                        <td className="py-4 pl-6 pr-4 font-medium text-deep-emerald">
                          #{orderId.toString().slice(-6).toUpperCase()}
                        </td>
                        <td className="py-4 px-4">
                          {order.user ? (
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                                {order.user.name?.charAt(0) || order.user.email?.charAt(0) || '?'}
                              </div>
                              <span>{order.user.name || order.user.email || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant">Guest</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-on-surface">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-4 text-right font-semibold text-deep-emerald">{formatPrice(order.totalPrice)}</td>
                        <td className="py-4 px-4">
                          {getStatusBadge(order.status)}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleDeleteOrder(orderId)}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                              title="Delete Order"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
