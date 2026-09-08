import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { orderAPI } from '../services/api'
import { formatDate, formatCurrency } from '../utils/formatters'
import { resolveImageUrl } from '../utils/apiUrl'

const ORDER_STEPS = [
  { value: 'new', label: 'Order Placed' },
  { value: 'confirmed', label: 'Payment Confirmed' },
  { value: 'payment_received', label: 'Payment Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'quality_check', label: 'Quality Check' },
  { value: 'packed', label: 'Packed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'out_for_delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

const ORDER_STATUS_LABELS = {
  new: 'Order Placed',
  confirmed: 'Payment Confirmed',
  payment_received: 'Payment Confirmed',
  pending_payment: 'Pending Payment',
  processing: 'Processing',
  manufacturing: 'Manufacturing',
  quality_check: 'Quality Check',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

const ORDER_PRIORITY = [
  'new',
  'confirmed',
  'payment_received',
  'pending_payment',
  'processing',
  'manufacturing',
  'quality_check',
  'packed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled',
]

export default function OrderDetail() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, loading: authLoading } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [downloadingInvoice, setDownloadingInvoice] = useState(false)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: `/account/orders/${orderId}` } })
      return
    }

    if (isAuthenticated && orderId) {
      fetchOrder()
    }
  }, [isAuthenticated, authLoading, orderId, navigate])

  const fetchOrder = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.getById(orderId)
      if (response.data.success) {
        setOrder(response.data.data)
      } else {
        setError(response.data.message || 'Order not found')
      }
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('You are not authorized to view this order')
      } else if (status === 404) {
        setError('Order not found')
      } else {
        setError(err.response?.data?.message || 'Failed to fetch order details')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!order) return
    setDownloadingInvoice(true)
    try {
      const response = await orderAPI.downloadInvoice(orderId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const filename = `invoice-${order.invoiceNumber || order.orderNumber || orderId}.pdf`
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Failed to download invoice. Please try again.')
    } finally {
      setDownloadingInvoice(false)
    }
  }

  const handleViewInvoice = async () => {
    if (!order) return
    try {
      const response = await orderAPI.downloadInvoice(orderId)
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => window.URL.revokeObjectURL(url), 300000)
    } catch (err) {
      setError('Failed to open invoice')
    }
  }

  const getCurrentStepIndex = (status) => {
    if (status === 'cancelled') return ORDER_STEPS.length - 1
    const normalized = status === 'payment_received' ? 'confirmed' : status
    return ORDER_STEPS.findIndex((step) => step.value === normalized)
  }

  const getOrderNumber = () => {
    return order?.orderNumber || `#${(order?._id || order?.id || '').toString().slice(-6).toUpperCase()}`
  }

  const isCancelled = order?.status === 'cancelled'

  if (authLoading || !isAuthenticated) {
    return null
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <Link className="hover:text-primary transition-colors" to="/">Home</Link>
          <span>/</span>
          <Link className="hover:text-primary transition-colors" to="/account/orders">My Orders</Link>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">{getOrderNumber()}</span>
        </nav>
        <h1 className="font-headline-lg text-headline-lg text-deep-emerald mb-2">
          Order {getOrderNumber()}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Placed on {order ? formatDate(order.createdAt) : formatDate(new Date().toISOString())}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading order details...</p>
        </div>
      ) : !order ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">
            error
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            {error || 'Order not found'}
          </p>
          <Link
            to="/account/orders"
            className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
          >
            Back to My Orders
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Order Status & Actions */}
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <span className="font-label-caps text-label-caps text-xs text-on-surface-variant uppercase tracking-wider">
                  Order Status
                </span>
                <p className="font-headline-md text-headline-md text-deep-emerald mt-1">
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-label-caps border ${(() => {
                  switch (order.status) {
                    case 'delivered': return 'bg-primary-fixed/20 text-on-primary-fixed-variant border-primary-fixed'
                    case 'shipped':
                    case 'packed': return 'bg-secondary-container/30 text-on-secondary-fixed-variant border-secondary-fixed'
                    case 'processing':
                    case 'manufacturing':
                    case 'quality_check': return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
                    case 'cancelled': return 'bg-error-container/20 text-error border-error-container/30'
                    default: return 'bg-surface-container/50 text-on-surface-variant border-outline-variant'
                  }
                })()}`}>
                  {ORDER_STATUS_LABELS[order.status] || order.status}
                </span>
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <button
                onClick={handleViewInvoice}
                disabled={downloadingInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-deep-emerald font-label-caps text-label-caps text-xs rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">visibility</span>
                View Invoice
              </button>
              <button
                onClick={handleDownloadInvoice}
                disabled={downloadingInvoice}
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-deep-emerald font-label-caps text-label-caps text-xs rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                {downloadingInvoice ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[16px]">download</span>
                )}
                Download Invoice
              </button>
              <Link
                to="/account/orders"
                className="inline-flex items-center gap-2 px-4 py-2.5 border border-outline-variant text-charcoal-text font-label-caps text-label-caps text-xs rounded hover:bg-surface-container-low transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                Back to Orders
              </Link>
            </div>
          </div>

          {/* Order Timeline / Status History */}
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6">Order Timeline</h2>

            {order.cancelledAt && isCancelled ? (
              <div className="p-4 bg-error-container/10 border border-error-container/20 rounded-lg">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-error text-[20px]">cancel</span>
                  <div>
                    <p className="font-body-md text-body-md text-error font-semibold">Order Cancelled</p>
                    {order.cancellationReason && (
                      <p className="text-sm text-on-surface-variant mt-1">Reason: {order.cancellationReason}</p>
                    )}
                    {order.cancelledAt && (
                      <p className="text-xs text-on-surface-variant mt-1">
                        Cancelled on {formatDate(order.cancelledAt)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-[2px] bg-outline-variant/50"></div>
                <div className="space-y-6">
                  {(order.statusHistory || []).length > 0 ? (
                    [...(order.statusHistory || [])].reverse().map((entry, idx) => (
                      <div key={idx} className="relative flex items-start gap-6">
                        <div className="w-6 h-6 rounded-full border-2 border-primary bg-white z-10 flex items-center justify-center">
                          <span className="w-2 h-2 rounded-full bg-deep-emerald"></span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-body-md text-body-md text-deep-emerald capitalize">
                            {entry.status.replace(/_/g, ' ')}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-1">
                            {formatDate(entry.timestamp)}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-on-surface-variant mt-1">{entry.note}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative flex items-start gap-6">
                      <div className="w-6 h-6 rounded-full border-2 border-primary bg-white z-10 flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-deep-emerald"></span>
                      </div>
                      <div>
                        <p className="font-body-md text-body-md text-deep-emerald capitalize">
                          {ORDER_STATUS_LABELS[order.status] || order.status}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Customer Information */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Customer Information</h2>
                {order.user ? (
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="font-label-caps text-xs text-on-surface-variant">Name</span>
                      <p className="font-body-md text-body-md text-primary mt-1">{order.user.name || '-'}</p>
                    </div>
                    <div>
                      <span className="font-label-caps text-xs text-on-surface-variant">Email</span>
                      <p className="font-body-md text-body-md text-primary mt-1">{order.user.email || '-'}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">Guest checkout</p>
                )}
              </div>

              <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Shipping Address</h2>
                {order.shippingAddress && (
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-primary">{order.shippingAddress.fullName}</p>
                    {order.shippingAddress.phone && (
                      <p className="text-on-surface-variant">Phone: {order.shippingAddress.phone}</p>
                    )}
                    <p className="text-on-surface">{order.shippingAddress.address}</p>
                    {order.shippingAddress.landmark && (
                      <p className="text-on-surface-variant">Landmark: {order.shippingAddress.landmark}</p>
                    )}
                    <p className="text-on-surface">
                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}
                    </p>
                  </div>
                )}
              </div>

              {order.billingAddress && (
                <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                  <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Billing Address</h2>
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-primary">{order.billingAddress.fullName || order.shippingAddress?.fullName}</p>
                    {order.billingAddress.address && (
                      <p className="text-on-surface">{order.billingAddress.address}</p>
                    )}
                    {order.billingAddress.city && (
                      <p className="text-on-surface">
                        {order.billingAddress.city}, {order.billingAddress.state} {order.billingAddress.pincode}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Order Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant">Order Number</span>
                    <p className="font-body-md text-body-md text-primary font-mono break-all mt-1">
                      {getOrderNumber()}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant">Order Date</span>
                    <p className="font-body-md text-body-md text-primary mt-1">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  {order.invoiceNumber && (
                    <div>
                      <span className="font-label-caps text-xs text-on-surface-variant">Invoice Number</span>
                      <p className="font-body-md text-body-md text-primary font-mono break-all mt-1">
                        {order.invoiceNumber}
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant">Payment Method</span>
                    <p className="font-body-md text-body-md text-primary capitalize mt-1">
                      {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                    </p>
                  </div>
                  <div>
                    <span className="font-label-caps text-xs text-on-surface-variant">Payment Status</span>
                    <p className={`font-body-md text-body-md mt-1 ${order.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {order.paymentStatus || 'Pending'}
                    </p>
                  </div>
                  {order.trackingNumber && (
                    <div>
                      <span className="font-label-caps text-xs text-on-surface-variant">Tracking Number</span>
                      <p className="font-body-md text-body-md text-primary mt-1 font-mono">
                        {order.trackingNumber}
                      </p>
                    </div>
                  )}
                  {order.estimatedDeliveryDate && (
                    <div>
                      <span className="font-label-caps text-xs text-on-surface-variant">Estimated Delivery</span>
                      <p className="font-body-md text-body-md text-primary mt-1">
                        {formatDate(order.estimatedDeliveryDate)}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ordered Products */}
              <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Ordered Products</h2>
                <div className="space-y-4">
                  {order.items?.map((item, idx) => (
                    <div key={idx} className="flex gap-4 items-center">
                      <div className="w-20 h-20 bg-surface-container-low rounded overflow-hidden flex-shrink-0 border border-outline-variant/30">
                        {item.image && (
                          <img
                            className="w-full h-full object-cover"
                            alt={item.name}
                            src={resolveImageUrl(item.image)}
                            onError={(e) => { e.target.src = 'https://placehold.co/80x80'; }}
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-body-md text-body-md text-primary font-medium truncate">
                          {item.name || 'Product'}
                        </h3>
                        <p className="text-xs text-on-surface-variant">
                          SKU: {item.sku || '-'} | Qty: {item.quantity}
                        </p>
                        {item.gst > 0 && (
                          <p className="text-xs text-on-surface-variant">
                            GST: {item.gst}%
                          </p>
                        )}
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-body-md text-body-md text-primary">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <p className="font-semibold text-deep-emerald">
                          {formatCurrency((item.price * item.quantity))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Summary */}
              <div className="bg-surface-white border border-outline-variant rounded-lg p-6 shadow-sm">
                <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Price Summary</h2>
                <div className="space-y-3 text-sm max-w-md ml-auto">
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Subtotal</span>
                    <span className="text-primary">{formatCurrency(order.itemsPrice)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Discount</span>
                      <span className="text-primary">-{formatCurrency(order.discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Tax (GST)</span>
                    <span className="text-primary">{formatCurrency(order.taxPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-on-surface-variant">Shipping</span>
                    <span className="text-primary">
                      {order.shippingPrice > 0 ? formatCurrency(order.shippingPrice) : 'FREE'}
                    </span>
                  </div>
                  <div className="border-t border-outline-variant pt-3 mt-3">
                    <div className="flex justify-between font-headline-md text-headline-md">
                      <span className="text-deep-emerald">Grand Total</span>
                      <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
