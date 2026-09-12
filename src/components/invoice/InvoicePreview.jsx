import { useEffect, useState } from 'react'
import {
  formatCurrency,
  formatDate,
  calculateLineItem,
  hasAnyDiscount,
} from '../../utils/formatters'
import { orderAPI, storeAPI } from '../../services/api'

const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 0;
    }

    html,
    body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
    }

    body * {
      visibility: hidden !important;
    }

    #invoice-preview,
    #invoice-preview * {
      visibility: visible !important;
    }

    #invoice-preview {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 10mm !important;
      box-sizing: border-box !important;
      background: #ffffff !important;
      box-shadow: none !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    .print-hide {
      display: none !important;
    }
  }
`

export default function InvoicePreview({
  open,
  onClose,
  orderId,
  orderProp,
}) {
  const [order, setOrder] = useState(orderProp || null)
  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      try {
        setLoading(true)

        let currentOrder = orderProp

        if (!currentOrder && orderId) {
          const response = await orderAPI.getById(orderId)

          currentOrder =
            response?.data?.order ||
            response?.data ||
            response?.order ||
            response
        }

        setOrder(currentOrder || null)

        try {
          const storeResponse = await storeAPI.getSettings()

          setStore(
            storeResponse?.data?.store ||
              storeResponse?.data ||
              storeResponse?.store ||
              storeResponse ||
              null
          )
        } catch (storeError) {
          console.warn('Unable to load store settings:', storeError)
        }
      } catch (error) {
        console.error('Unable to load invoice:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, orderId, orderProp])

  if (!open) return null

  const items =
    order?.items ||
    order?.orderItems ||
    order?.products ||
    []

  const customer =
    order?.customer ||
    order?.shippingAddress ||
    order?.user ||
    {}

  const invoiceNumber =
    order?.invoiceNumber ||
    order?.orderNumber ||
    order?._id ||
    '-'

  const invoiceDate =
    order?.invoiceDate ||
    order?.createdAt ||
    order?.date ||
    null

  const customerName =
    customer?.name ||
    customer?.fullName ||
    customer?.customerName ||
    order?.customerName ||
    '-'

  const customerPhone =
    customer?.phone ||
    customer?.mobile ||
    customer?.phoneNumber ||
    order?.phone ||
    '-'

  const customerEmail =
    customer?.email ||
    order?.email ||
    '-'

  const customerAddress =
    customer?.address ||
    customer?.fullAddress ||
    customer?.street ||
    order?.shippingAddress?.address ||
    ''

  const showDiscount = hasAnyDiscount(items)

  const calculatedItems = items.map((item) =>
    calculateLineItem(item)
  )

  const totalQuantity = calculatedItems.reduce(
    (sum, item) => sum + Number(item.qty || 0),
    0
  )

  const totalGrossAmount = calculatedItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0),
    0
  )

  const totalDiscount = calculatedItems.reduce(
    (sum, item) => sum + Number(item.discountAmount || 0),
    0
  )

  const totalGst = calculatedItems.reduce(
    (sum, item) => {
      const gross =
        Number(item.price || 0) * Number(item.qty || 0)

      const taxableAmount =
        gross - Number(item.discountAmount || 0)

      const gstAmount =
        taxableAmount * (Number(item.gstPercent || 0) / 100)

      return sum + gstAmount
    },
    0
  )

  const grandTotal = calculatedItems.reduce(
    (sum, item) => sum + Number(item.lineTotal || 0),
    0
  )

  const notes =
    order?.notes ||
    order?.customerNotes ||
    order?.remarks ||
    ''

  const storeName =
    store?.storeName ||
    store?.name ||
    'JKR Jewellery'

  const storeTagline =
    store?.tagline ||
    'Crafting timeless elegance since 2017'

  const handleDownloadPDF = async () => {
  try {
    const element = document.getElementById('invoice-preview')

    if (!element) {
      console.error('Invoice preview element not found')
      return
    }

    const html2canvasModule = await import('html2canvas')
    const jsPDFModule = await import('jspdf')

    const html2canvas =
      html2canvasModule.default || html2canvasModule

    const jsPDF =
      jsPDFModule.jsPDF || jsPDFModule.default

    // Wait for all images
    const images = Array.from(element.querySelectorAll('img'))

    await Promise.all(
      images.map(
        (img) =>
          new Promise((resolve) => {
            if (img.complete && img.naturalWidth > 0) {
              resolve()
            } else {
              img.onload = resolve
              img.onerror = resolve
            }
          })
      )
    )

    // Temporarily force exact A4 dimensions
    const originalWidth = element.style.width
    const originalMinHeight = element.style.minHeight
    const originalMaxWidth = element.style.maxWidth
    const originalPadding = element.style.padding
    const originalBoxSizing = element.style.boxSizing

    element.style.width = '210mm'
    element.style.minHeight = '297mm'
    element.style.maxWidth = '210mm'
    element.style.padding = '10mm'
    element.style.boxSizing = 'border-box'

    // Give browser one frame to recalculate layout
    await new Promise((resolve) =>
      requestAnimationFrame(() => resolve())
    )

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 15000,
      width: element.offsetWidth,
      height: element.offsetHeight,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
    })

    // Restore original styles
    element.style.width = originalWidth
    element.style.minHeight = originalMinHeight
    element.style.maxWidth = originalMaxWidth
    element.style.padding = originalPadding
    element.style.boxSizing = originalBoxSizing

    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
    })

    const pageWidth = 210
    const pageHeight = 297

    const canvasWidth = canvas.width
    const canvasHeight = canvas.height

    const ratio = pageWidth / canvasWidth

    const renderedHeight = canvasHeight * ratio

    const imageData = canvas.toDataURL(
      'image/jpeg',
      0.95
    )

    // Single A4 page when content fits
    if (renderedHeight <= pageHeight) {
      pdf.addImage(
        imageData,
        'JPEG',
        0,
        0,
        pageWidth,
        renderedHeight
      )
    } else {
      // Multi-page handling
      let remainingHeight = renderedHeight
      let sourceY = 0

      while (remainingHeight > 0) {
        const pageCanvas = document.createElement('canvas')

        const pagePixelHeight = Math.min(
          canvasHeight - sourceY,
          Math.floor(pageHeight / ratio)
        )

        pageCanvas.width = canvasWidth
        pageCanvas.height = pagePixelHeight

        const context = pageCanvas.getContext('2d')

        context.fillStyle = '#ffffff'
        context.fillRect(
          0,
          0,
          pageCanvas.width,
          pageCanvas.height
        )

        context.drawImage(
          canvas,
          0,
          sourceY,
          canvasWidth,
          pagePixelHeight,
          0,
          0,
          canvasWidth,
          pagePixelHeight
        )

        const pageImage = pageCanvas.toDataURL(
          'image/jpeg',
          0.95
        )

        const pageRenderedHeight =
          pagePixelHeight * ratio

        if (sourceY > 0) {
          pdf.addPage()
        }

        pdf.addImage(
          pageImage,
          'JPEG',
          0,
          0,
          pageWidth,
          pageRenderedHeight
        )

        sourceY += pagePixelHeight
        remainingHeight -= pageHeight
      }
    }

    pdf.save(`invoice-${invoiceNumber}.pdf`)
  } catch (error) {
    console.error(
      'Invoice PDF generation failed:',
      error
    )
  }
}
  return (
    <>
      <style>{printStyles}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-8">
        <div className="my-8 w-full max-w-[210mm] bg-white shadow-2xl">
          <div
            id="invoice-preview"
            className="min-h-[297mm] w-[210mm] max-w-full bg-white p-[10mm] text-gray-900"
          >
            {/* HEADER */}
            <div className="mb-8 flex items-start justify-between border-b-2 border-deep-emerald pb-6">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  <img
                    src="/assets/icons/logo.jpeg"
                    alt="JKR Jewellery"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <h1 className="font-playfair text-2xl font-bold text-deep-emerald">
                    {storeName}
                  </h1>

                  <p className="mt-1 text-xs text-gray-500">
                    {storeTagline}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold text-deep-emerald">
                  INVOICE
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  {invoiceNumber}
                </p>
              </div>
            </div>

            {/* META INFORMATION */}
            <div className="mb-8 grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Invoice Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Invoice Number:
                    </span>

                    <span className="font-medium text-gray-900">
                      {invoiceNumber}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Date:
                    </span>

                    <span className="font-medium text-gray-900">
                      {invoiceDate
                        ? formatDate(invoiceDate)
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Customer Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Name:
                    </span>

                    <span className="font-medium text-gray-900">
                      {customerName}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Phone:
                    </span>

                    <span className="font-medium text-gray-900">
                      {customerPhone}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Email:
                    </span>

                    <span className="font-medium text-gray-900">
                      {customerEmail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ADDRESS */}
            {customerAddress && (
              <div className="mb-8">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Address
                </h3>

                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {typeof customerAddress === 'string'
                    ? customerAddress
                    : [
                        customerAddress?.address,
                        customerAddress?.city,
                        customerAddress?.state,
                        customerAddress?.pincode,
                      ]
                        .filter(Boolean)
                        .join(', ')}
                </p>
              </div>
            )}

            {/* PRODUCTS */}
            <div className="mb-8">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Products
              </h3>

              <table
                className="w-full border-collapse"
                style={{
                  tableLayout: 'fixed',
                  width: '100%',
                }}
              >
                <colgroup>
                  <col
                    style={{
                      width: showDiscount ? '28%' : '32%',
                    }}
                  />

                  <col
                    style={{
                      width: showDiscount ? '15%' : '17%',
                    }}
                  />

                  <col style={{ width: '8%' }} />

                  <col
                    style={{
                      width: showDiscount ? '14%' : '16%',
                    }}
                  />

                  {showDiscount && (
                    <col style={{ width: '13%' }} />
                  )}

                  <col style={{ width: '9%' }} />

                  <col
                    style={{
                      width: showDiscount ? '13%' : '18%',
                    }}
                  />
                </colgroup>

                <thead>
                  <tr className="bg-deep-emerald text-white">
                    <th className="px-2 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                      Product
                    </th>

                    <th className="px-2 py-2.5 text-left text-xs font-bold uppercase tracking-wider">
                      SKU
                    </th>

                    <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider">
                      Qty
                    </th>

                    <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider">
                      Price
                    </th>

                    {showDiscount && (
                      <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider">
                        Discount
                      </th>
                    )}

                    <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider">
                      GST
                    </th>

                    <th className="px-2 py-2.5 text-right text-xs font-bold uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((item, index) => {
                    const {
                      qty,
                      price,
                      discountAmount,
                      gstPercent,
                      lineTotal,
                    } = calculateLineItem(item)

                    return (
                      <tr
                        key={`${
                          item.sku ||
                          item.productName ||
                          'item'
                        }-${index}`}
                        className={
                          index % 2 === 0
                            ? 'bg-gray-50'
                            : 'bg-white'
                        }
                      >
                        <td className="break-words px-2 py-3 text-sm font-medium text-gray-900">
                          {item.productName ||
                            item.name ||
                            '-'}
                        </td>

                        <td className="break-words px-2 py-3 text-sm text-gray-600">
                          {item.sku || '-'}
                        </td>

                        <td className="px-2 py-3 text-right text-sm text-gray-600">
                          {qty}
                        </td>

                        <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(price)}
                        </td>

                        {showDiscount && (
                          <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                            {formatCurrency(
                              discountAmount
                            )}
                          </td>
                        )}

                        <td className="px-2 py-3 text-right text-sm text-gray-600">
                          {gstPercent}%
                        </td>

                        <td className="whitespace-nowrap px-2 py-3 text-right text-sm font-semibold text-deep-emerald">
                          {formatCurrency(lineTotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="mb-8 flex justify-end">
              <div className="w-72 max-w-full">
                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Total Items
                    </span>

                    <span className="font-medium text-gray-900">
                      {totalQuantity}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Gross Amount
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatCurrency(totalGrossAmount)}
                    </span>
                  </div>

                  {showDiscount && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Total Discount
                      </span>

                      <span className="font-medium text-gray-900">
                        - {formatCurrency(totalDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Total GST
                    </span>

                    <span className="font-medium text-gray-900">
                      {formatCurrency(totalGst)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t-2 border-deep-emerald pt-2">
                    <span className="text-base font-bold text-gray-900">
                      Grand Total
                    </span>

                    <span className="text-xl font-bold text-deep-emerald">
                      {formatCurrency(grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTES */}
            {notes && (
              <div className="mb-8">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Notes
                </h3>

                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {notes}
                </p>
              </div>
            )}

            {/* TERMS */}
            <div className="mb-12">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Terms & Conditions
              </h3>

              <ul className="list-inside list-disc space-y-1 text-xs text-gray-600">
                <li>
                  This invoice is issued against the confirmed
                  jewellery order.
                </li>

                <li>
                  Prices are per piece and inclusive of applicable
                  discounts unless otherwise stated.
                </li>

                <li>
                  GST is calculated as per current applicable rates
                  on the taxable value.
                </li>

                <li>
                  Designs, colors, and plating may vary slightly
                  from the displayed images.
                </li>

                <li>
                  Payment must be made in full before dispatch.
                </li>
              </ul>
            </div>

            {/* SIGNATURE */}
            <div className="mt-8 flex items-end justify-between border-t border-gray-200 pt-8">
              <div className="text-center">
                <div className="mb-2 w-48 border-b border-gray-400" />

                <p className="text-xs text-gray-500">
                  Authorized Signature
                </p>
              </div>

              <div className="text-center">
                <div className="mb-2 w-48 border-b border-gray-400" />

                <p className="text-xs text-gray-500">
                  Customer Signature
                </p>
              </div>
            </div>
          </div>

          {/* ACTION BUTTONS */}
          <div className="print-hide sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-gray-100 p-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-charcoal-text transition-colors hover:bg-surface-variant"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 bg-deep-emerald px-6 py-2.5 text-sm font-semibold text-surface-white shadow-sm transition-colors hover:bg-regal-gold"
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>

              Download PDF
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-charcoal-text transition-colors hover:bg-surface-variant"
            >
              <span className="material-symbols-outlined text-[16px]">
                print
              </span>

              Print
            </button>
          </div>
        </div>
      </div>
    </>
  )
}