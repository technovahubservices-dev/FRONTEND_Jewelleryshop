
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
  const [order, setOrder] = useState(
    orderProp || null
  )

  const [store, setStore] = useState(null)
  const [loading, setLoading] = useState(false)

  // ============================================================
  // LOAD ORDER + STORE DATA FROM API
  // ============================================================
  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      try {
        setLoading(true)

        let currentOrder = orderProp

        // ------------------------------------------------------
        // LOAD ORDER FROM API
        // ------------------------------------------------------
        if (!currentOrder && orderId) {
          const response =
            await orderAPI.getById(orderId)

          currentOrder =
            response?.data?.order ||
            response?.data ||
            response?.order ||
            response
        }

        setOrder(currentOrder || null)

        // ------------------------------------------------------
        // LOAD STORE SETTINGS FROM API
        // ------------------------------------------------------
        try {
          const storeResponse =
            await storeAPI.getSettings()

          setStore(
            storeResponse?.data?.store ||
              storeResponse?.data ||
              storeResponse?.store ||
              storeResponse ||
              null
          )
        } catch (storeError) {
          console.warn(
            'Unable to load store settings:',
            storeError
          )
        }
      } catch (error) {
        console.error(
          'Unable to load invoice:',
          error
        )

        setOrder(null)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, orderId, orderProp])

  // ============================================================
  // CLOSE WHEN NOT OPEN
  // ============================================================
  if (!open) return null

  // ============================================================
  // ORDER DATA
  // ============================================================
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

  // ============================================================
  // INVOICE INFORMATION
  // ============================================================
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

  const orderDate =
    order?.orderDate ||
    order?.createdAt ||
    order?.date ||
    null

  // ============================================================
  // CUSTOMER INFORMATION
  // ============================================================
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
    order?.customerPhone ||
    '-'

  const customerEmail =
    customer?.email ||
    order?.email ||
    order?.customerEmail ||
    'N/A'

  const customerAddress =
    customer?.address ||
    customer?.fullAddress ||
    customer?.street ||
    order?.shippingAddress?.address ||
    ''

  // ============================================================
  // CALCULATE ITEMS
  // ============================================================
  const calculatedItems = items.map((item) =>
    calculateLineItem(item)
  )

  // ============================================================
  // TOTAL QUANTITY
  // ============================================================
  const totalQuantity =
    calculatedItems.reduce(
      (sum, item) =>
        sum + Number(item.qty || 0),
      0
    )

  // ============================================================
  // SUBTOTAL
  // ============================================================
  const subtotal =
    calculatedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.price || 0) *
          Number(item.qty || 0),
      0
    )

  // ============================================================
  // DISCOUNT
  // ============================================================
  const totalDiscount =
    calculatedItems.reduce(
      (sum, item) =>
        sum +
        Number(item.discountAmount || 0),
      0
    )

  // ============================================================
  // GST
  // ============================================================
  const totalGst =
    calculatedItems.reduce(
      (sum, item) => {
        const gross =
          Number(item.price || 0) *
          Number(item.qty || 0)

        const discount =
          Number(
            item.discountAmount || 0
          )

        const taxableAmount =
          gross - discount

        const gstAmount =
          taxableAmount *
          (Number(
            item.gstPercent || 0
          ) / 100)

        return sum + gstAmount
      },
      0
    )

  // ============================================================
  // SHIPPING
  // ============================================================
  const shipping =
    Number(
      order?.shipping ||
        order?.shippingCharge ||
        order?.deliveryCharge ||
        0
    )

  // ============================================================
  // GRAND TOTAL
  // ============================================================
  const calculatedGrandTotal =
    subtotal -
    totalDiscount +
    totalGst +
    shipping

  /*
   * Prefer backend total when available.
   * This prevents frontend calculation from
   * conflicting with the actual order total.
   */
  const backendGrandTotal =
    order?.grandTotal ??
    order?.totalAmount ??
    order?.total ??
    order?.finalAmount ??
    null

  const grandTotal =
    backendGrandTotal !== null &&
    backendGrandTotal !== undefined &&
    !Number.isNaN(
      Number(backendGrandTotal)
    )
      ? Number(backendGrandTotal)
      : calculatedGrandTotal

  // ============================================================
  // DISCOUNT VISIBILITY
  // ============================================================
  const showDiscount =
    hasAnyDiscount(items) ||
    totalDiscount > 0

  // ============================================================
  // NOTES
  // ============================================================
  const notes =
    order?.notes ||
    order?.customerNotes ||
    order?.remarks ||
    ''

  // ============================================================
  // STORE DATA
  // ============================================================
  const storeName =
    store?.storeName ||
    store?.name ||
    'JKR Jewellery'

  const storeTagline =
    store?.tagline ||
    'Crafting timeless elegance since 2017'

  // ============================================================
  // DOWNLOAD PDF
  // ============================================================
  const handleDownloadPDF = async () => {
    try {
      const element =
        document.getElementById(
          'invoice-preview'
        )

      if (!element) {
        console.error(
          'Invoice preview element not found'
        )
        return
      }

      // --------------------------------------------------------
      // LOAD PDF LIBRARIES
      // --------------------------------------------------------
      const html2canvasModule =
        await import('html2canvas')

      const jsPDFModule =
        await import('jspdf')

      const html2canvas =
        html2canvasModule.default ||
        html2canvasModule

      const jsPDF =
        jsPDFModule.jsPDF ||
        jsPDFModule.default

      // --------------------------------------------------------
      // WAIT FOR IMAGES
      // --------------------------------------------------------
      const images = Array.from(
        element.querySelectorAll('img')
      )

      await Promise.all(
        images.map(
          (img) =>
            new Promise((resolve) => {
              if (
                img.complete &&
                img.naturalWidth > 0
              ) {
                resolve()
                return
              }

              img.onload = resolve
              img.onerror = resolve
            })
        )
      )

      // --------------------------------------------------------
      // SAVE ORIGINAL STYLES
      // --------------------------------------------------------
      const originalWidth =
        element.style.width

      const originalMinHeight =
        element.style.minHeight

      const originalMaxWidth =
        element.style.maxWidth

      const originalPadding =
        element.style.padding

      const originalBoxSizing =
        element.style.boxSizing

      // --------------------------------------------------------
      // FORCE EXACT A4 SIZE
      // --------------------------------------------------------
      element.style.width = '210mm'
      element.style.minHeight = '297mm'
      element.style.maxWidth = '210mm'
      element.style.padding = '10mm'
      element.style.boxSizing =
        'border-box'

      // --------------------------------------------------------
      // WAIT FOR BROWSER LAYOUT
      // --------------------------------------------------------
      await new Promise((resolve) =>
        requestAnimationFrame(() =>
          resolve()
        )
      )

      // --------------------------------------------------------
      // CREATE CANVAS
      // --------------------------------------------------------
      const canvas =
        await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          imageTimeout: 15000,

          width: element.offsetWidth,
          height: element.offsetHeight,

          windowWidth:
            element.scrollWidth,

          windowHeight:
            element.scrollHeight,
        })

      // --------------------------------------------------------
      // RESTORE ORIGINAL STYLES
      // --------------------------------------------------------
      element.style.width =
        originalWidth

      element.style.minHeight =
        originalMinHeight

      element.style.maxWidth =
        originalMaxWidth

      element.style.padding =
        originalPadding

      element.style.boxSizing =
        originalBoxSizing

      // --------------------------------------------------------
      // CREATE A4 PDF
      // --------------------------------------------------------
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
      })

      const pageWidth = 210
      const pageHeight = 297

      const canvasWidth =
        canvas.width

      const canvasHeight =
        canvas.height

      const ratio =
        pageWidth / canvasWidth

      const renderedHeight =
        canvasHeight * ratio

      // --------------------------------------------------------
      // SINGLE PAGE
      // --------------------------------------------------------
      if (
        renderedHeight <=
        pageHeight
      ) {
        const imageData =
          canvas.toDataURL(
            'image/jpeg',
            0.95
          )

        pdf.addImage(
          imageData,
          'JPEG',
          0,
          0,
          pageWidth,
          renderedHeight
        )
      } else {
        // ------------------------------------------------------
        // MULTI PAGE
        // ------------------------------------------------------
        let sourceY = 0
        let firstPage = true

        while (
          sourceY < canvasHeight
        ) {
          const pagePixelHeight =
            Math.min(
              canvasHeight -
                sourceY,
              Math.floor(
                pageHeight / ratio
              )
            )

          const pageCanvas =
            document.createElement(
              'canvas'
            )

          pageCanvas.width =
            canvasWidth

          pageCanvas.height =
            pagePixelHeight

          const context =
            pageCanvas.getContext(
              '2d'
            )

          context.fillStyle =
            '#ffffff'

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

          const pageImage =
            pageCanvas.toDataURL(
              'image/jpeg',
              0.95
            )

          const pageRenderedHeight =
            pagePixelHeight *
            ratio

          if (!firstPage) {
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

          firstPage = false

          sourceY +=
            pagePixelHeight
        }
      }

      // --------------------------------------------------------
      // SAVE
      // --------------------------------------------------------
      pdf.save(
        `invoice-${invoiceNumber}.pdf`
      )
    } catch (error) {
      console.error(
        'Invoice PDF generation failed:',
        error
      )
    }
  }

  // ============================================================
  // PRINT
  // ============================================================
  const handlePrint = () => {
    window.print()
  }

  // ============================================================
  // LOADING
  // ============================================================
  if (loading && !order) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
        <div className="bg-white px-8 py-6 shadow-xl">
          <p className="text-sm text-gray-600">
            Loading invoice...
          </p>
        </div>
      </div>
    )
  }

  // ============================================================
  // UI
  // ============================================================
  return (
    <>
      <style>
        {printStyles}
      </style>

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-8">

        <div className="my-8 w-full max-w-[210mm] bg-white shadow-2xl">

          {/* ==================================================
              INVOICE A4
          ================================================== */}
          <div
            id="invoice-preview"
            className="min-h-[297mm] w-[210mm] max-w-full bg-white p-[10mm] text-gray-900"
            style={{
              boxSizing: 'border-box',
            }}
          >

            {/* ==================================================
                HEADER
            ================================================== */}
            <div
              className="mb-8 flex items-start justify-between border-b-2 pb-6"
              style={{
                borderColor:
                  '#0F5132',
              }}
            >

              <div className="flex items-center gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center">
                  <img
                    src="/assets/icons/logo.jpeg"
                    alt="JKR Jewellery"
                    className="h-full w-full object-contain"
                  />
                </div>

                <div>

                  <h1
                    className="text-2xl font-bold"
                    style={{
                      color:
                        '#0F5132',
                    }}
                  >
                    {storeName}
                  </h1>

                  <p className="mt-1 text-xs text-gray-500">
                    {storeTagline}
                  </p>

                </div>

              </div>

              <div className="text-right">

                <h2
                  className="text-xl font-bold"
                  style={{
                    color:
                      '#0F5132',
                  }}
                >
                  INVOICE
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                  Invoice #: {invoiceNumber}
                </p>

              </div>

            </div>

            {/* ==================================================
                DETAILS
            ================================================== */}
            <div className="mb-8 grid grid-cols-2 gap-10">

              {/* INVOICE DETAILS */}
              <div>

                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Invoice Details
                </h3>

                <div className="space-y-2">

                  <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">

                    <span className="text-gray-500">
                      Invoice #:
                    </span>

                    <span className="font-medium text-gray-900">
                      {invoiceNumber}
                    </span>

                  </div>

                  <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">

                    <span className="text-gray-500">
                      Order #:
                    </span>

                    <span className="font-medium text-gray-900">
                      {order?.orderNumber ||
                        '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">

                    <span className="text-gray-500">
                      Invoice Date:
                    </span>

                    <span className="font-medium text-gray-900">
                      {invoiceDate
                        ? formatDate(
                            invoiceDate
                          )
                        : '-'}
                    </span>

                  </div>

                  <div className="grid grid-cols-[110px_1fr] gap-2 text-sm">

                    <span className="text-gray-500">
                      Order Date:
                    </span>

                    <span className="font-medium text-gray-900">
                      {orderDate
                        ? formatDate(
                            orderDate
                          )
                        : '-'}
                    </span>

                  </div>

                </div>

              </div>

              {/* CUSTOMER DETAILS */}
              <div>

                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Bill To
                </h3>

                <div className="space-y-2 text-sm">

                  <div className="font-semibold text-gray-900">
                    {customerName}
                  </div>

                  {customerAddress && (
                    <div className="leading-5 text-gray-700">

                      {typeof customerAddress ===
                      'string'
                        ? customerAddress
                        : [
                            customerAddress?.address,
                            customerAddress?.city,
                            customerAddress?.state,
                            customerAddress?.pincode,
                          ]
                            .filter(Boolean)
                            .join(', ')}

                    </div>
                  )}

                  <div className="grid grid-cols-[55px_1fr] gap-2">

                    <span className="text-gray-500">
                      Phone:
                    </span>

                    <span className="text-gray-900">
                      {customerPhone}
                    </span>

                  </div>

                  <div className="grid grid-cols-[55px_1fr] gap-2">

                    <span className="text-gray-500">
                      Email:
                    </span>

                    <span className="break-all text-gray-900">
                      {customerEmail}
                    </span>

                  </div>

                </div>

              </div>

            </div>

            {/* ==================================================
                PRODUCTS TABLE
            ================================================== */}
            <div className="mb-8">

              <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">
                Products
              </h3>

              <table
                className="w-full border-collapse"
                style={{
                  tableLayout:
                    'fixed',
                  width: '100%',
                }}
              >

                <colgroup>

                  <col
                    style={{
                      width: '27%',
                    }}
                  />

                  <col
                    style={{
                      width: '17%',
                    }}
                  />

                  <col
                    style={{
                      width: '8%',
                    }}
                  />

                  <col
                    style={{
                      width: '15%',
                    }}
                  />

                  <col
                    style={{
                      width: '12%',
                    }}
                  />

                  <col
                    style={{
                      width: '8%',
                    }}
                  />

                  <col
                    style={{
                      width: '13%',
                    }}
                  />

                </colgroup>

                <thead>

                  <tr
                    style={{
                      backgroundColor:
                        '#0F5132',
                    }}
                  >

                    <th className="px-2 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-white">
                      Product
                    </th>

                    <th className="px-2 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-white">
                      SKU
                    </th>

                    <th className="px-2 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-white">
                      Qty
                    </th>

                    <th className="px-2 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-white">
                      Unit Price
                    </th>

                    <th className="px-2 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-white">
                      Discount
                    </th>

                    <th className="px-2 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-white">
                      GST
                    </th>

                    <th className="px-2 py-3 text-right text-[11px] font-bold uppercase tracking-wide text-white">
                      Total
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {calculatedItems.map(
                    (item, index) => (
                      <tr
                        key={`${item.sku || item.productName || 'item'}-${index}`}
                        className={
                          index % 2 === 0
                            ? 'bg-gray-50'
                            : 'bg-white'
                        }
                      >

                        <td className="break-words px-2 py-3 text-left text-sm font-medium text-gray-900">
                          {item.productName ||
                            item.name ||
                            items[index]
                              ?.productName ||
                            items[index]
                              ?.name ||
                            '-'}
                        </td>

                        <td className="break-words px-2 py-3 text-left text-sm text-gray-600">
                          {item.sku ||
                            items[index]
                              ?.sku ||
                            '-'}
                        </td>

                        <td className="px-2 py-3 text-center text-sm text-gray-600">
                          {item.qty || 0}
                        </td>

                        <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(
                            item.price || 0
                          )}
                        </td>

                        <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                          {formatCurrency(
                            item.discountAmount ||
                              0
                          )}
                        </td>

                        <td className="whitespace-nowrap px-2 py-3 text-right text-sm text-gray-600">
                          {item.gstPercent ||
                            0}
                          %
                        </td>

                        <td
                          className="whitespace-nowrap px-2 py-3 text-right text-sm font-semibold"
                          style={{
                            color:
                              '#0F5132',
                          }}
                        >
                          {formatCurrency(
                            item.lineTotal ||
                              0
                          )}
                        </td>

                      </tr>
                    )
                  )}

                </tbody>

              </table>

            </div>

            {/* ==================================================
                TOTALS
            ================================================== */}

                        {/* ==================================================
   {/* ============================================================
    TOTALS
============================================================ */}

<div
  className="mb-8"
  style={{
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
    boxSizing: 'border-box',
  }}
>
  <div
    style={{
      width: '82mm',
      minWidth: '82mm',
      maxWidth: '82mm',
      boxSizing: 'border-box',
    }}
  >
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >

      {/* Total Items */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '22px',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 30mm - 6mm)',
            paddingRight: '6mm',
            textAlign: 'right',
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          Total Items:
        </div>

        <div
          style={{
            width: '30mm',
            minWidth: '30mm',
            textAlign: 'right',
            color: '#111827',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {totalQuantity}
        </div>
      </div>

      {/* Subtotal */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '22px',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 30mm - 6mm)',
            paddingRight: '6mm',
            textAlign: 'right',
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          Subtotal:
        </div>

        <div
          style={{
            width: '30mm',
            minWidth: '30mm',
            textAlign: 'right',
            color: '#111827',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {formatCurrency(subtotal)}
        </div>
      </div>

      {/* Discount */}
      {showDiscount && (
        <div
          style={{
            display: 'flex',
            width: '100%',
            minHeight: '22px',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxSizing: 'border-box',
          }}
        >
          <div
            style={{
              width: 'calc(100% - 30mm - 6mm)',
              paddingRight: '6mm',
              textAlign: 'right',
              color: '#6B7280',
              fontSize: '14px',
              lineHeight: '20px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}
          >
            Discount:
          </div>

          <div
            style={{
              width: '30mm',
              minWidth: '30mm',
              textAlign: 'right',
              color: '#111827',
              fontSize: '14px',
              fontWeight: 500,
              lineHeight: '20px',
              whiteSpace: 'nowrap',
              boxSizing: 'border-box',
            }}
          >
            - {formatCurrency(totalDiscount)}
          </div>
        </div>
      )}

      {/* GST */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '22px',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 30mm - 6mm)',
            paddingRight: '6mm',
            textAlign: 'right',
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          GST:
        </div>

        <div
          style={{
            width: '30mm',
            minWidth: '30mm',
            textAlign: 'right',
            color: '#111827',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {formatCurrency(totalGst)}
        </div>
      </div>

      {/* Shipping */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          minHeight: '22px',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 30mm - 6mm)',
            paddingRight: '6mm',
            textAlign: 'right',
            color: '#6B7280',
            fontSize: '14px',
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          Shipping:
        </div>

        <div
          style={{
            width: '30mm',
            minWidth: '30mm',
            textAlign: 'right',
            color: '#111827',
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {formatCurrency(shipping)}
        </div>
      </div>

      {/* Grand Total */}
      <div
        style={{
          display: 'flex',
          width: '100%',
          marginTop: '8px',
          paddingTop: '10px',
          borderTop: '2px solid #0F5132',
          alignItems: 'center',
          justifyContent: 'flex-end',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            width: 'calc(100% - 30mm - 6mm)',
            paddingRight: '6mm',
            textAlign: 'right',
            color: '#111827',
            fontSize: '16px',
            fontWeight: 700,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          Grand Total:
        </div>

        <div
          style={{
            width: '30mm',
            minWidth: '30mm',
            textAlign: 'right',
            color: '#0F5132',
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: '24px',
            whiteSpace: 'nowrap',
            boxSizing: 'border-box',
          }}
        >
          {formatCurrency(grandTotal)}
        </div>
      </div>

    </div>
  </div>
</div>

            {/* ==================================================
                NOTES
            ================================================== */}
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

            {/* ==================================================
                TERMS
            ================================================== */}
            <div className="mb-10">

              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Terms & Conditions
              </h3>

              <ul className="list-inside list-disc space-y-1 text-xs leading-5 text-gray-600">

                <li>
                  This invoice is issued
                  against the confirmed
                  jewellery order.
                </li>

                <li>
                  Prices are per piece and
                  inclusive of applicable
                  discounts unless
                  otherwise stated.
                </li>

                <li>
                  GST is calculated as per
                  current applicable rates
                  on the taxable value.
                </li>

                <li>
                  Designs, colors, and
                  plating may vary slightly
                  from the displayed images.
                </li>

                <li>
                  Payment must be made in
                  full before dispatch.
                </li>

              </ul>

            </div>

            {/* ==================================================
                SIGNATURE
            ================================================== */}
            <div className="mt-8 flex items-end justify-between border-t border-gray-200 pt-8">

              <div className="w-48 text-center">

                <div className="mb-2 border-b border-gray-400" />

                <p className="text-xs text-gray-500">
                  Authorized Signature
                </p>

              </div>

              <div className="w-48 text-center">

                <div className="mb-2 border-b border-gray-400" />

                <p className="text-xs text-gray-500">
                  Customer Signature
                </p>

              </div>

            </div>

          </div>

          {/* ==================================================
              ACTION BUTTONS
          ================================================== */}
          <div className="print-hide sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-gray-100 p-4">

            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-charcoal-text transition-colors hover:bg-surface-variant"
            >
              Close
            </button>

            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors"
              style={{
                backgroundColor:
                  '#0F5132',
              }}
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
