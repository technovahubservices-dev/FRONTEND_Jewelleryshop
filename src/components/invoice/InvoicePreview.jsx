import { useState, useEffect } from 'react'
import {
  formatCurrency,
  formatDate,
  calculateLineItem,
  hasAnyDiscount,
} from '../../utils/formatters'
import { resolveImageUrl } from '../../utils/apiUrl'
import { storeAPI, orderAPI } from '../../services/api'
import logo from '../../assets/icons/logo.jpeg'

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
  const [storeInfo, setStoreInfo] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (orderProp) {
      setOrder(orderProp)
    }
  }, [orderProp])

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      setLoading(true)

      try {
        if (!orderProp && orderId) {
          const response = await orderAPI.getById(orderId)

          const data =
            response?.data?.data ||
            response?.data ||
            null

          setOrder(data)
        }

        try {
          const storeResponse =
            await storeAPI.getSettings()

          const storeData =
            storeResponse?.data?.data ||
            storeResponse?.data ||
            {}

          setStoreInfo(storeData)
        } catch (storeError) {
          console.error(
            'Failed to load store information:',
            storeError
          )
        }
      } catch (error) {
        console.error(
          'Failed to load invoice:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, orderId, orderProp])

  useEffect(() => {
    if (!open) return

    const style = document.createElement('style')
    style.id = 'invoice-print-styles'
    style.innerHTML = printStyles

    document.head.appendChild(style)

    return () => {
      const existing = document.getElementById(
        'invoice-print-styles'
      )

      if (existing) {
        existing.remove()
      }
    }
  }, [open])

  if (!open) return null

  if (loading && !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white px-8 py-6 shadow-xl">
          Loading invoice...
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white p-8 shadow-xl">
          <p className="mb-4 text-gray-700">
            Invoice details not found.
          </p>

          <button
            onClick={onClose}
            className="bg-deep-emerald px-6 py-2.5 text-sm font-semibold text-white"
          >
            Close
          </button>
        </div>
      </div>
    )
  }

  const items =
    order.items ||
    order.orderItems ||
    order.products ||
    []

  const customer =
    order.customer ||
    order.shippingAddress ||
    order.user ||
    {}

  const invoiceNumber =
    order.invoiceNumber ||
    order.orderNumber ||
    order._id ||
    '-'

  const invoiceDate =
    order.invoiceDate ||
    order.createdAt ||
    order.date

  const customerName =
    customer.name ||
    order.customerName ||
    order.user?.name ||
    '-'

  const customerPhone =
    customer.phone ||
    order.customerPhone ||
    order.user?.phone ||
    '-'

  const customerEmail =
    customer.email ||
    order.customerEmail ||
    order.user?.email ||
    '-'

  const customerAddress =
    customer.address ||
    customer.addressLine1 ||
    order.shippingAddress?.address ||
    order.shippingAddress?.addressLine1 ||
    ''

  const showDiscount = hasAnyDiscount(items)

  const calculations = items.reduce(
    (acc, item) => {
      const calculation = calculateLineItem({
        qty:
          item.quantity ??
          item.qty ??
          1,
        price:
          item.price ??
          0,
        discount:
          item.discount ??
          0,
        gst:
          item.gst ??
          item.gstPercent ??
          0,
      })

      acc.totalQuantity +=
        calculation.qty

      acc.totalGrossAmount +=
        calculation.basePriceTotal

      acc.totalDiscount +=
        calculation.discountAmount

      acc.totalGst +=
        calculation.gstAmount

      acc.grandTotal +=
        calculation.lineTotal

      return acc
    },
    {
      totalQuantity: 0,
      totalGrossAmount: 0,
      totalDiscount: 0,
      totalGst: 0,
      grandTotal: 0,
    }
  )

  const logoSrc = logo

  const handleDownloadPDF = async () => {
    const element =
      document.getElementById('invoice-preview')

    if (!element) {
      console.error(
        'Invoice preview not found'
      )
      return
    }

    try {
      const images =
        Array.from(
          element.querySelectorAll('img')
        )

      await Promise.all(
        images.map((img) => {
          if (img.complete) {
            return Promise.resolve()
          }

          return new Promise((resolve) => {
            img.onload = resolve
            img.onerror = resolve
          })
        })
      )

      const html2canvas =
        (
          await import('html2canvas')
        ).default

      const { jsPDF } =
        await import('jspdf')

      const canvas =
        await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          width: element.scrollWidth,
          height: element.scrollHeight,
          windowWidth: element.scrollWidth,
          windowHeight: element.scrollHeight,
        })

      const imgData =
        canvas.toDataURL('image/png')

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        210,
        297,
        undefined,
        'FAST'
      )

      pdf.save(
        `invoice-${invoiceNumber}.pdf`
      )
    } catch (error) {
      console.error(
        'Failed to generate invoice PDF:',
        error
      )

      alert(
        'Failed to generate invoice PDF. Please try again.'
      )
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
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
                    src={logoSrc}
                    alt="JKR Jewellery"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>
                  <h1 className="font-playfair text-2xl font-bold text-deep-emerald">
                    {storeInfo?.storeName ||
                      'JKR Jewellery'}
                  </h1>

                  <p className="mt-1 text-xs text-gray-500">
                    Crafting timeless elegance since
                    2017
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

            {/* DETAILS */}
            <div className="mb-8 grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Invoice Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">
                      Invoice No:
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

                    <span className="font-medium text-gray-900 break-all">
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
                  {customerAddress}
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
                    style={{ width: '28%' }}
                  />

                  <col
                    style={{ width: '15%' }}
                  />

                  <col
                    style={{ width: '8%' }}
                  />

                  <col
                    style={{ width: '14%' }}
                  />

                  {showDiscount && (
                    <col
                      style={{ width: '13%' }}
                    />
                  )}

                  <col
                    style={{
                      width: showDiscount
                        ? '9%'
                        : '17%',
                    }}
                  />

                  <col
                    style={{
                      width: showDiscount
                        ? '13%'
                        : '18%',
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
                  {items.map(
                    (item, index) => {
                      const {
                        qty,
                        price,
                        discountAmount,
                        gstPercent,
                        lineTotal,
                      } =
                        calculateLineItem({
                          qty:
                            item.quantity ??
                            item.qty ??
                            1,
                          price:
                            item.price ??
                            0,
                          discount:
                            item.discount ??
                            0,
                          gst:
                            item.gst ??
                            item.gstPercent ??
                            0,
                        })

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
                              item.product?.name ||
                              '-'}
                          </td>

                          <td className="break-words px-2 py-3 text-sm text-gray-600">
                            {item.sku ||
                              item.product?.sku ||
                              '-'}
                          </td>

                          <td className="px-2 py-3 text-right text-sm text-gray-600">
                            {qty}
                          </td>

                          <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                            {formatCurrency(
                              price
                            )}
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
                            {formatCurrency(
                              lineTotal
                            )}
                          </td>
                        </tr>
                      )
                    }
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTALS */}
            <div className="mb-8 flex justify-end">
              <div className="w-[82mm]">
                <div className="space-y-2">
                  <div className="grid grid-cols-[1fr_auto] items-center gap-6 text-sm">
                    <span className="text-gray-500">
                      Total Items
                    </span>

                    <span className="whitespace-nowrap text-right font-medium text-gray-900">
                      {calculations.totalQuantity}
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-center gap-6 text-sm">
                    <span className="text-gray-500">
                      Gross Amount
                    </span>

                    <span className="whitespace-nowrap text-right font-medium text-gray-900">
                      {formatCurrency(
                        calculations.totalGrossAmount
                      )}
                    </span>
                  </div>

                  {showDiscount && (
                    <div className="grid grid-cols-[1fr_auto] items-center gap-6 text-sm">
                      <span className="text-gray-500">
                        Total Discount
                      </span>

                      <span className="whitespace-nowrap text-right font-medium text-gray-900">
                        -{' '}
                        {formatCurrency(
                          calculations.totalDiscount
                        )}
                      </span>
                    </div>
                  )}

                  <div className="grid grid-cols-[1fr_auto] items-center gap-6 text-sm">
                    <span className="text-gray-500">
                      Total GST
                    </span>

                    <span className="whitespace-nowrap text-right font-medium text-gray-900">
                      {formatCurrency(
                        calculations.totalGst
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] items-center gap-6 border-t-2 border-deep-emerald pt-2">
                    <span className="text-base font-bold text-gray-900">
                      Grand Total
                    </span>

                    <span className="whitespace-nowrap text-right text-xl font-bold text-deep-emerald">
                      {formatCurrency(
                        calculations.grandTotal
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOTES */}
            {order.notes && (
              <div className="mb-8">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Notes
                </h3>

                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {order.notes}
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
                  This invoice is issued against the
                  confirmed order.
                </li>

                <li>
                  Prices are per piece and include
                  applicable discounts where stated.
                </li>

                <li>
                  GST is calculated on the taxable
                  value at the applicable rate.
                </li>

                <li>
                  Designs, colors, and plating may vary
                  slightly from displayed images.
                </li>

                <li>
                  Payment must be made as per the
                  agreed order terms.
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

          {/* ACTIONS */}
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