import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { resolveImageUrl } from '../utils/apiUrl'

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const orderId = location.state?.orderId
  const paymentStatus = location.state?.paymentStatus

  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.getById(orderId)
      if (response.data.success) {
        setOrder(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch order details')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch order details')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatAmount = (amount) => {
    return amount?.toLocaleString('en-IN') || '0'
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <div className="w-24 h-24 mx-auto bg-deep-emerald/10 rounded-full flex items-center justify-center mb-8">
            <span className="material-symbols-outlined text-5xl text-deep-emerald" style={{ fontVariationSettings: "'FILL' 1" }}>
              check_circle
            </span>
          </div>

          <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">
            {paymentStatus === 'paid' ? 'Payment Successful!' : 'Order Placed Successfully!'}
          </h1>

          {paymentStatus === 'paid' && (
            <div className="bg-primary-fixed/10 border border-primary-fixed/30 text-primary rounded-lg p-4 mb-8 text-sm">
              Payment confirmed. A confirmation email has been sent to your registered email address.
            </div>
          )}

          {!paymentStatus && (
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Thank you for your order. Your order has been received and is being processed.
            </p>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading && (
          <div className="text-center py-8">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-2 block animate-spin">
              progress_activity
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Loading order details...
            </p>
          </div>
        )}

        {order && (
          <div className="bg-surface-white border border-outline-variant rounded-lg shadow-sm overflow-hidden mb-8">
            {/* Order Info */}
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">
                Order Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-label-caps text-xs text-on-surface-variant">Order ID</span>
                  <p className="font-body-md text-body-md text-primary font-mono break-all">
                    #{order._id}
                  </p>
                </div>
                <div>
                  <span className="font-label-caps text-xs text-on-surface-variant">Order Date</span>
                  <p className="font-body-md text-body-md text-primary">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div>
                  <span className="font-label-caps text-xs text-on-surface-variant">Payment Method</span>
                  <p className="font-body-md text-body-md text-primary capitalize">
                    {order.paymentMethod === 'cod'
                      ? 'Cash on Delivery'
                      : order.paymentMethod}
                  </p>
                </div>
                <div>
                  <span className="font-label-caps text-xs text-on-surface-variant">Payment Status</span>
                  <p className={`font-body-md text-body-md ${order.isPaid ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {order.paymentStatus === 'paid' ? 'Paid' : order.paymentStatus || 'Pending'}
                  </p>
                </div>
              </div>
            </div>

            {/* Ordered Products */}
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">
                Ordered Products
              </h2>
              <div className="space-y-4">
                {order.items?.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <div className="w-16 h-16 flex-shrink-0 bg-surface-container-low rounded overflow-hidden">
                      <img
                        src={resolveImageUrl(item.image)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-body-md text-body-md text-primary font-medium truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-on-surface-variant">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="font-body-md text-body-md text-primary">
                        ₹ {formatAmount(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Address */}
            <div className="p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">
                Delivery Address
              </h2>
              {order.shippingAddress && (
                <div className="font-body-md text-body-md text-on-surface">
                  <p className="font-semibold text-primary">{order.shippingAddress.fullName}</p>
                  {order.shippingAddress.phone && (
                    <p className="text-sm text-on-surface-variant">
                      {order.shippingAddress.phone}
                    </p>
                  )}
                  <p className="mt-1">{order.shippingAddress.address}</p>
                  {order.shippingAddress.landmark && (
                    <p className="text-sm text-on-surface-variant">
                      {order.shippingAddress.landmark}
                    </p>
                  )}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                  </p>
                </div>
              )}
            </div>

            {/* Price Summary */}
            <div className="p-6">
              <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">
                Price Summary
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Items Price</span>
                  <span className="text-primary">
                    ₹ {formatAmount(order.itemsPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Tax (GST)</span>
                  <span className="text-primary">
                    ₹ {formatAmount(order.taxPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Shipping</span>
                  <span className="text-primary">
                    {order.shippingPrice > 0
                      ? `₹ ${formatAmount(order.shippingPrice)}`
                      : 'FREE'}
                  </span>
                </div>
                <div className="border-t border-outline-variant pt-3 mt-3">
                  <div className="flex justify-between font-headline-md text-headline-md">
                    <span className="text-deep-emerald">Grand Total</span>
                    <span className="text-primary">
                      ₹ {formatAmount(order.totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!orderId && (
          <div className="bg-surface-white border border-outline-variant rounded-lg p-6 text-center mb-8">
            <p className="font-body-md text-body-md text-on-surface">
              Your order has been placed successfully.
            </p>
          </div>
        )}

         <div className="flex flex-col gap-3 sm:flex-row justify-center">
           <Link
             to="/shop"
             className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors shadow-sm"
           >
             <span className="material-symbols-outlined text-sm">arrow_forward</span>
             Continue Shopping
           </Link>
           {order && (
             <Link
               to={`/account/orders/${order._id}`}
               className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-outline-variant text-deep-emerald font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
             >
               <span className="material-symbols-outlined text-sm">visibility</span>
               View Order
             </Link>
           )}
           {orderId && (
             <button
               onClick={async () => {
                 try {
                   const response = await orderAPI.downloadInvoice(orderId)
                   const blob = new Blob([response.data], { type: 'application/pdf' })
                   const url = window.URL.createObjectURL(blob)
                   const link = document.createElement('a')
                   const filename = `invoice-${order?.invoiceNumber || order?.orderNumber || orderId}.pdf`
                   link.href = url
                   link.download = filename
                   document.body.appendChild(link)
                   link.click()
                   document.body.removeChild(link)
                   window.URL.revokeObjectURL(url)
                 } catch (err) {
                   console.error('Failed to download invoice:', err)
                 }
               }}
               className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-outline-variant text-deep-emerald font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
             >
               <span className="material-symbols-outlined text-sm">download</span>
               Download Invoice
             </button>
           )}
         </div>
      </div>
    </main>
  )
}
