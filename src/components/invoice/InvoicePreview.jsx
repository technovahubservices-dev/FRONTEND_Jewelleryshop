import { useState, useEffect } from 'react'
import { formatCurrency, formatDate, calculateLineItem } from '../../utils/formatters'
import { resolveImageUrl, getBackendOrigin } from '../../utils/apiUrl'
import { storeAPI, orderAPI } from '../../services/api'
import logo from '../../assets/icons/logo.jpeg'

const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    body * {
      visibility: hidden !important;
    }
    #invoice-preview, #invoice-preview * {
      visibility: visible !important;
    }
    #invoice-preview {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 100% !important;
      padding: 0 !important;
      margin: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    .print-hide {
      display: none !important;
    }
  }
`

export default function InvoicePreview({ open, onClose, orderId, order: orderProp }) {
  const [order, setOrder] = useState(orderProp || null)
  const [storeInfo, setStoreInfo] = useState(null)
  const [loading, setLoading] = useState(!orderProp)

  useEffect(() => {
    if (orderProp) {
      setOrder(orderProp)
      setLoading(false)
    } else if (orderId) {
      setLoading(true)
      orderAPI.getById(orderId).then((res) => {
        if (res.data?.success) {
          setOrder(res.data.data)
        }
        setLoading(false)
      })
    }
  }, [orderId, orderProp])

  useEffect(() => {
    const fetchStoreInfo = async () => {
      try {
        const response = await storeAPI.getSettings()
        const data = response.data?.data || response.data || {}
        setStoreInfo({
          storeName: data.storeName || 'JKR Jewellery',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
        })
      } catch (err) {
        setStoreInfo({
          storeName: 'JKR Jewellery',
          email: '',
          phone: '',
          address: '',
        })
      }
    }
    fetchStoreInfo()
  }, [])

  if (!open) return null

  const items = order?.items || []
  const calculations = items.reduce(
    (acc, item) => {
      const { qty, basePriceTotal, discountAmount, gstPercent, lineTotal } = calculateLineItem({
        qty: item.quantity,
        price: item.price,
        discount: item.discount,
        gst: item.gst,
      })
      acc.totalQuantity += qty
      acc.totalGrossAmount += basePriceTotal
      acc.totalDiscount += discountAmount
      acc.totalGst += basePriceTotal > 0 ? (basePriceTotal - discountAmount) * (gstPercent / 100) : 0
      acc.grandTotal += lineTotal
      return acc
    },
    { totalQuantity: 0, totalGrossAmount: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 }
  )

  const handleDownloadPDF = async () => {
    const { jsPDF } = await import('jspdf')
    const html2canvas = (await import('html2canvas')).default

    const element = document.getElementById('invoice-preview')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = margin

      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
      heightLeft -= pageHeight - margin * 2

      while (heightLeft > margin) {
        position = heightLeft - margin
        pdf.addPage()
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const filename = `invoice-${order?.invoiceNumber || order?.orderNumber || orderId}.pdf`
      pdf.save(filename)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const storeLogoUrl = storeInfo ? `${getBackendOrigin()}/assets/icons/logo.jpeg` : ''
  const logoSrc = storeLogoUrl || logo

  return (
    <>
      <style>{printStyles}</style>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl my-8">
          <div className="p-8 md:p-12" id="invoice-preview">
            {loading ? (
              <div className="text-center py-20">
                <p className="font-body-md text-body-md text-on-surface-variant">Loading invoice...</p>
              </div>
            ) : !order ? (
              <div className="text-center py-20">
                <p className="font-body-md text-body-md text-on-surface-variant">Order not found</p>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-deep-emerald pb-6 mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img src={resolveImageUrl(logoSrc)} alt={storeInfo?.storeName || 'JKR'} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-playfair font-bold text-deep-emerald">{storeInfo?.storeName || 'JKR Jewellery'}</h1>
                      {storeInfo?.email && <p className="text-xs text-gray-500 mt-1">{storeInfo.email}</p>}
                      {storeInfo?.phone && <p className="text-xs text-gray-500 mt-1">{storeInfo.phone}</p>}
                      {storeInfo?.address && <p className="text-xs text-gray-500 mt-1">{storeInfo.address}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <h2 className="text-xl font-bold text-deep-emerald">INVOICE</h2>
                    <p className="text-sm text-gray-600 mt-1">{order.invoiceNumber || order.orderNumber || '#' + (order._id || order.id || '').toString().slice(-6).toUpperCase()}</p>
                  </div>
                </div>

                {/* Meta Info Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Invoice Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Invoice Date:</span>
                        <span className="text-gray-900 font-medium">{formatDate(order.createdAt)}</span>
                      </div>
                      {order.invoiceNumber && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Invoice Number:</span>
                          <span className="text-gray-900 font-medium">{order.invoiceNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Name:</span>
                        <span className="text-gray-900 font-medium">{order.shippingAddress?.fullName || order.user?.name || '-'}</span>
                      </div>
                      {order.shippingAddress?.phone && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Phone:</span>
                          <span className="text-gray-900 font-medium">{order.shippingAddress.phone}</span>
                        </div>
                      )}
                      {order.shippingAddress?.address && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Address:</span>
                          <span className="text-gray-900 font-medium">{order.shippingAddress.address}{order.shippingAddress.city ? ', ' + order.shippingAddress.city : ''}{order.shippingAddress.state ? ', ' + order.shippingAddress.state : ''}{order.shippingAddress.pincode ? ' ' + order.shippingAddress.pincode : ''}</span>
                        </div>
                      )}
                      {order.user?.email && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Email:</span>
                          <span className="text-gray-900 font-medium">{order.user.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Products Table */}
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Products</h3>
                  <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                    <colgroup>
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '15%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '8%' }} />
                      <col style={{ width: '15%' }} />
                    </colgroup>
                    <thead>
                      <tr className="bg-deep-emerald text-white">
                        <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">Product</th>
                        <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Qty</th>
                        <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Price</th>
                        <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">GST</th>
                        <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, index) => {
                        const { qty, price, gstPercent, lineTotal } = calculateLineItem({
                          qty: item.quantity,
                          price: item.price,
                          discount: item.discount,
                          gst: item.gst,
                        })
                        return (
                          <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                            <td className="py-3 px-3 text-sm text-gray-900 font-medium break-words">{item.name || 'Product'}</td>
                            <td className="py-3 px-3 text-sm text-gray-600 text-right">{qty}</td>
                            <td className="py-3 px-3 text-sm text-gray-600 text-right whitespace-nowrap">â‚¹ {price.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                            <td className="py-3 px-3 text-sm text-gray-600 text-right">{gstPercent}%</td>
                            <td className="py-3 px-3 text-sm text-deep-emerald font-semibold text-right whitespace-nowrap">â‚¹ {lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                  <div className="w-72">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Total Items</span>
                        <span className="text-gray-900 font-medium">{calculations.totalQuantity}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Subtotal</span>
                        <span className="text-gray-900 font-medium">â‚¹ {calculations.totalGrossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      {calculations.totalDiscount > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Discount</span>
                          <span className="text-gray-900 font-medium">- â‚¹ {calculations.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tax (GST)</span>
                        <span className="text-gray-900 font-medium">â‚¹ {calculations.totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                      <div className="border-t-2 border-deep-emerald pt-2 flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Grand Total</span>
                        <span className="text-xl font-bold text-deep-emerald">â‚¹ {calculations.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Payment & Order Summary */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Payment Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Method</span>
                        <span className="text-gray-900 font-medium">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Status</span>
                        <span className="text-gray-900 font-medium">{order.paymentStatus || 'Pending'}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Number</span>
                        <span className="text-gray-900 font-medium">{order.orderNumber || '#' + (order._id || order.id || '').toString().slice(-6).toUpperCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Order Date</span>
                        <span className="text-gray-900 font-medium">{formatDate(order.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="mb-12">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                  <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                    <li>This invoice is valid for 30 days from the date of issue.</li>
                    <li>Prices are per piece and inclusive of applicable taxes.</li>
                    <li>GST is calculated as per current applicable rates on the taxable value.</li>
                    <li>Designs, colors, and plating may vary slightly from the displayed images.</li>
                    <li>Payment must be made in full before dispatch.</li>
                  </ul>
                </div>
              </>
            )}
          </div>

          {/* Print Actions */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-4 flex justify-end gap-3 print-hide">
            <button onClick={onClose} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">
              Close
            </button>
            {!loading && order && (
              <>
                <button onClick={handleDownloadPDF} className="px-6 py-2.5 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">download</span>
                  Download PDF
                </button>
                <button onClick={handlePrint} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">print</span>
                  Print
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
