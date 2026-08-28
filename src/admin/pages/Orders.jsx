import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { orderAPI } from '../../services/api'
import * as XLSX from 'xlsx'

const ORDER_STATES = [
  { value: 'new', label: 'New' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'payment_received', label: 'Payment Received' },
  { value: 'processing', label: 'Processing' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const PAYMENT_STATES = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const SHIPPING_STATES = [
  { value: 'not_shipped', label: 'Not Shipped' },
  { value: 'ready_to_ship', label: 'Ready to Ship' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
]

const ORDER_WORKFLOW = {
  new: ['confirmed', 'cancelled'],
  confirmed: ['payment_received', 'cancelled'],
  payment_received: ['processing', 'cancelled'],
  processing: ['manufacturing', 'cancelled'],
  manufacturing: ['quality_check', 'cancelled'],
  quality_check: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
}

export default function Orders() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewOrder, setViewOrder] = useState(null)
  const [updateForm, setUpdateForm] = useState({ status: '', paymentStatus: '', shippingStatus: '', trackingNumber: '', note: '' })
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const orderId = (order._id || order.id).toString().toLowerCase()
    const customerName = (order.user?.name || order.user?.email || '').toLowerCase()
    return orderId.includes(term) || customerName.includes(term)
  }).filter(order => {
    if (statusFilter === 'all') return true
    return order.status === statusFilter
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

  const handleDownloadExcel = () => {
    if (!filteredOrders.length) {
      setError('No orders available to export')
      setSuccessMessage('')
      return
    }

    try {
      const exportData = filteredOrders.map((order) => ({
        'Order ID': (order._id || order.id).toString().slice(-6).toUpperCase(),
        'Date': formatDate(order.createdAt),
        'Customer': order.user?.name || order.user?.email || 'Guest',
        'Email': order.user?.email || '',
        'Items': (order.items || []).map((item) => item.name).join(', '),
        'Total Qty': (order.items || []).reduce((sum, item) => sum + (item.quantity || 0), 0),
        'Total Amount': Number(order.totalPrice || 0),
        'Payment Method': (order.paymentMethod || '').toUpperCase(),
        'Payment Status': (order.paymentStatus || '').toUpperCase(),
        'Order Status': (order.status || '').toUpperCase(),
        'Shipping Status': (order.shippingStatus || '').toUpperCase(),
        'Tracking Number': order.trackingNumber || '',
      }))

      const worksheet = XLSX.utils.json_to_sheet(exportData)

      worksheet['!cols'] = [
        { wch: 14 },
        { wch: 20 },
        { wch: 25 },
        { wch: 30 },
        { wch: 40 },
        { wch: 10 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 16 },
        { wch: 18 },
        { wch: 24 },
      ]

      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders')
      XLSX.writeFile(workbook, 'orders.xlsx')

      setSuccessMessage('Orders downloaded successfully')
      setError('')
    } catch (err) {
      console.error('Excel export error:', err)
      setError('Failed to download Excel file')
      setSuccessMessage('')
    }
  }

  const handleViewOrder = (order) => {
    setViewOrder(order)
    setUpdateForm({
      status: order.status || 'new',
      paymentStatus: order.paymentStatus || 'pending',
      shippingStatus: order.shippingStatus || 'not_shipped',
      trackingNumber: order.trackingNumber || '',
      note: '',
    })
  }

  const handleUpdateOrder = async () => {
    if (!viewOrder) return
    setUpdating(true)
    setError('')
    try {
      const payload = {}
      if (updateForm.status !== viewOrder.status) payload.status = updateForm.status
      if (updateForm.paymentStatus !== viewOrder.paymentStatus) payload.paymentStatus = updateForm.paymentStatus
      if (updateForm.shippingStatus !== viewOrder.shippingStatus) payload.shippingStatus = updateForm.shippingStatus
      if (updateForm.trackingNumber !== viewOrder.trackingNumber) payload.trackingNumber = updateForm.trackingNumber
      if (updateForm.note) payload.note = updateForm.note

      if (Object.keys(payload).length === 0) {
        setError('No changes to update')
        setUpdating(false)
        return
      }

      const response = await orderAPI.updateStatus(viewOrder._id || viewOrder.id, payload)
      if (response.data.success) {
        setSuccessMessage('Order updated successfully')
        setError('')
        setTimeout(() => setSuccessMessage(''), 3000)
        setViewOrder(response.data.data)
        setOrders(orders.map(o => (o._id || o.id) === (viewOrder._id || viewOrder.id) ? response.data.data : o))
      } else {
        setError(response.data.message || 'Failed to update order')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update order')
    } finally {
      setUpdating(false)
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
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

  const getStatusBadge = (status) => {
    const configs = {
      new: {
        bg: 'bg-surface-container/50',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        label: 'New',
        dot: 'bg-outline',
      },
      confirmed: {
        bg: 'bg-surface-container/50',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        label: 'Confirmed',
        dot: 'bg-outline',
      },
      payment_received: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Payment Received',
        dot: 'bg-regal-gold',
      },
      processing: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Processing',
        dot: 'bg-regal-gold',
      },
      manufacturing: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Manufacturing',
        dot: 'bg-regal-gold',
      },
      quality_check: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Quality Check',
        dot: 'bg-regal-gold',
      },
      packed: {
        bg: 'bg-primary-fixed-dim/20',
        text: 'text-on-primary-fixed-variant',
        border: 'border-primary-fixed-dim',
        label: 'Packed',
        dot: 'bg-deep-emerald',
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
    const cfg = configs[status] || configs.new
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {cfg.label}
      </span>
    )
  }

  const getPaymentBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant', label: 'Pending' },
      paid: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed', label: 'Paid' },
      failed: { bg: 'bg-error-container/20', text: 'text-error', border: 'border-error-container/30', label: 'Failed' },
      refunded: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', border: 'border-secondary-fixed', label: 'Refunded' },
    }
    const cfg = configs[status] || configs.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
        {cfg.label}
      </span>
    )
  }

  const getShippingBadge = (status) => {
    const configs = {
      not_shipped: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant', label: 'Not Shipped' },
      ready_to_ship: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant', label: 'Ready to Ship' },
      shipped: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed-dim', label: 'Shipped' },
      out_for_delivery: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed-dim', label: 'Out for Delivery' },
      delivered: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed', label: 'Delivered' },
    }
    const cfg = configs[status] || configs.not_shipped
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
        {cfg.label}
      </span>
    )
  }

  const allowedNextStatuses = viewOrder ? (ORDER_WORKFLOW[viewOrder.status] || []) : []

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Orders</h1>
        <p className="text-sm text-gray-500">Manage customer orders, track shipments, and view order history.</p>
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

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
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
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[160px]">
              <select
                className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                {ORDER_STATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-[10px] rounded hover:bg-surface-container-low transition-colors"
              title="Download Excel"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading orders...
              </p>
            </div>
          ) : filteredOrders.length === 0 ? (
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
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Order ID</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Customer</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Product</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Qty</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Amount</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Payment</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Order Status</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Shipping</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredOrders.map((order) => {
                    const orderId = order._id || order.id
                    const firstItem = order.items && order.items[0]
                    const totalQty = order.items ? order.items.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0
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
                              <span className="truncate max-w-[160px]">{order.user.name || order.user.email || 'N/A'}</span>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant">Guest</span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {firstItem ? (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">
                                {firstItem.image && (
                                  <img
                                    className="w-full h-full object-cover"
                                    alt={firstItem.name}
                                    src={firstItem.image}
                                    onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                                  />
                                )}
                              </div>
                              <span className="truncate max-w-[180px]" title={firstItem.name}>{firstItem.name}</span>
                            </div>
                          ) : (
                            <span className="text-on-surface-variant">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">{totalQty}</td>
                        <td className="py-4 px-4 text-right font-semibold text-deep-emerald">{formatPrice(order.totalPrice)}</td>
                        <td className="py-4 px-4">{getPaymentBadge(order.paymentStatus)}</td>
                        <td className="py-4 px-4">{getStatusBadge(order.status)}</td>
                        <td className="py-4 px-4">{getShippingBadge(order.shippingStatus)}</td>
                        <td className="py-4 px-4 text-on-surface text-xs whitespace-nowrap">{formatDate(order.createdAt)}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                              title="View Details"
                            >
                              <span className="material-symbols-outlined text-s">visibility</span>
                            </button>
                            <button
                              onClick={() => handleDeleteOrder(orderId)}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                              title="Delete Order"
                            >
                              <span className="material-symbols-outlined text-s">delete</span>
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

      {viewOrder && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setViewOrder(null)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div>
                <h2 className="font-headline-md text-headline-md text-deep-emerald">
                  Order #{viewOrder._id?.toString().slice(-6).toUpperCase()}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Placed on {formatDate(viewOrder.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {viewOrder.quotationId && (
                  <button
                    onClick={() => navigate('/admin/quotations')}
                    className="px-3 py-1.5 text-xs font-label-caps text-deep-emerald border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
                    title="View related quotation"
                  >
                    Quotation #{viewOrder.quotationId.quotationNumber?.toString().slice(-6).toUpperCase()}
                  </button>
                )}
                <button
                  onClick={() => setViewOrder(null)}
                  className="text-on-surface-variant hover:text-deep-emerald transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Timeline */}
              <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 uppercase tracking-wider">Order Timeline</h3>
                <div className="relative">
                  <div className="absolute left-2 top-0 bottom-0 w-[2px] bg-outline-variant/50"></div>
                  <div className="space-y-4">
                    {(viewOrder.statusHistory || []).slice(-6).reverse().map((entry, idx) => (
                      <div key={idx} className="relative flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-deep-emerald border-2 border-surface-white z-10 flex-shrink-0 mt-0.5"></div>
                        <div>
                          <p className="text-sm font-semibold text-deep-emerald capitalize">{entry.status.replace(/_/g, ' ')}</p>
                          <p className="text-xs text-on-surface-variant">{formatDate(entry.timestamp)}</p>
                          {entry.note && <p className="text-xs text-on-surface-variant mt-0.5">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                    {viewOrder.paidAt && (
                      <div className="relative flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-regal-gold border-2 border-surface-white z-10 flex-shrink-0 mt-0.5"></div>
                        <div>
                          <p className="text-sm font-semibold text-deep-emerald">Payment Received</p>
                          <p className="text-xs text-on-surface-variant">{formatDate(viewOrder.paidAt)}</p>
                        </div>
                      </div>
                    )}
                    {viewOrder.deliveredAt && (
                      <div className="relative flex items-start gap-4">
                        <div className="w-4 h-4 rounded-full bg-deep-emerald border-2 border-surface-white z-10 flex-shrink-0 mt-0.5"></div>
                        <div>
                          <p className="text-sm font-semibold text-deep-emerald">Delivered</p>
                          <p className="text-xs text-on-surface-variant">{formatDate(viewOrder.deliveredAt)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Details */}
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Customer Details</h3>
                  {viewOrder.user ? (
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-on-surface-variant">Name</p>
                        <p className="font-medium text-deep-emerald">{viewOrder.user.name || '-'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-on-surface-variant">Email</p>
                        <p className="font-medium text-deep-emerald">{viewOrder.user.email || '-'}</p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-on-surface-variant">Guest checkout</p>
                  )}
                  <div className="mt-3 pt-3 border-t border-outline-variant/50 space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Shipping To</p>
                      <p className="font-medium text-deep-emerald">{viewOrder.shippingAddress?.fullName || '-'}</p>
                      <p className="text-xs text-on-surface-variant">{viewOrder.shippingAddress?.address || ''}</p>
                      <p className="text-xs text-on-surface-variant">{viewOrder.shippingAddress?.city || ''}, {viewOrder.shippingAddress?.state || ''}</p>
                      {viewOrder.shippingAddress?.pincode && <p className="text-xs text-on-surface-variant">PIN: {viewOrder.shippingAddress.pincode}</p>}
                    </div>
                  </div>
                </div>

                {/* Product Details */}
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Product Details</h3>
                  <div className="space-y-3">
                    {(viewOrder.items || []).map((item, idx) => (
                      <div key={idx} className="flex gap-3 items-center">
                        <div className="w-12 h-12 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">
                          {item.image && (
                            <img
                              className="w-full h-full object-cover"
                              alt={item.name}
                              src={item.image}
                              onError={(e) => { e.target.src = 'https://placehold.co/48x48'; }}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-deep-emerald truncate">{item.name || 'Product'}</p>
                          <p className="text-xs text-on-surface-variant">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-deep-emerald">{formatPrice(item.price * item.quantity)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-outline-variant/50 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Subtotal</span>
                      <span>{formatPrice(viewOrder.itemsPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Tax</span>
                      <span>{formatPrice(viewOrder.taxPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Shipping</span>
                      <span>{viewOrder.shippingPrice === 0 ? 'Free' : formatPrice(viewOrder.shippingPrice)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-deep-emerald pt-2 border-t border-outline-variant/50">
                      <span>Total</span>
                      <span>{formatPrice(viewOrder.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Payment Details */}
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Payment Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Method</p>
                      <p className="font-medium text-deep-emerald capitalize">{viewOrder.paymentMethod || 'COD'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Status</p>
                      {getPaymentBadge(viewOrder.paymentStatus)}
                    </div>
                    {viewOrder.paidAt && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Paid At</p>
                        <p className="font-medium text-deep-emerald">{formatDate(viewOrder.paidAt)}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Shipping Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Status</p>
                      {getShippingBadge(viewOrder.shippingStatus)}
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Tracking Number</p>
                      <p className="font-medium text-deep-emerald">{viewOrder.trackingNumber || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-4 uppercase tracking-wider">Update Order</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Order Status</label>
                    <select
                      value={updateForm.status}
                      onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                    >
                      {ORDER_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    {allowedNextStatuses.length > 0 && updateForm.status === viewOrder.status && (
                      <p className="text-xs text-on-surface-variant mt-1">Next allowed: {allowedNextStatuses.map(s => ORDER_STATES.find(os => os.value === s)?.label).join(', ')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Payment Status</label>
                    <select
                      value={updateForm.paymentStatus}
                      onChange={(e) => setUpdateForm({ ...updateForm, paymentStatus: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                    >
                      {PAYMENT_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Shipping Status</label>
                    <select
                      value={updateForm.shippingStatus}
                      onChange={(e) => setUpdateForm({ ...updateForm, shippingStatus: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                    >
                      {SHIPPING_STATES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Tracking Number</label>
                    <input
                      type="text"
                      value={updateForm.trackingNumber}
                      onChange={(e) => setUpdateForm({ ...updateForm, trackingNumber: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="Enter tracking number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Note</label>
                    <input
                      type="text"
                      value={updateForm.note}
                      onChange={(e) => setUpdateForm({ ...updateForm, note: e.target.value })}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="Optional note for this status change"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleUpdateOrder}
                    disabled={updating}
                    className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {updating ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
