import { formatCurrency, calculateLineItem, hasAnyDiscount } from '../../../utils/formatters'

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

    #quotation-preview,
    #quotation-preview * {
      visibility: visible !important;
    }

    #quotation-preview {
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

export default function QuotationPreviewModal({
  open,
  onClose,
  quotationNumber,
  date,
  validUntil,
  customer,
  notes,
  items = [],
  calculations,
  hasDiscount,
  onGeneratePDF,
  onPrint,
}) {
  if (!open) return null

  const showDiscount =
    hasDiscount !== undefined
      ? hasDiscount
      : hasAnyDiscount(items)

  const safeCalculations = {
    totalQuantity: calculations?.totalQuantity || 0,
    totalGrossAmount: calculations?.totalGrossAmount || 0,
    totalDiscount: calculations?.totalDiscount || 0,
    totalGst: calculations?.totalGst || 0,
    grandTotal: calculations?.grandTotal || 0,
  }

  return (
    <>
      <style>{printStyles}</style>

      <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 md:p-8">
        <div className="my-8 w-full max-w-[210mm] bg-white shadow-2xl">
          <div
            id="quotation-preview"
            className="min-h-[297mm] w-[210mm] max-w-full bg-white p-[10mm] text-gray-900"
          >
            {/* Header */}
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
                    JKR Jewellery
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Crafting timeless elegance since 2017
                  </p>
                </div>
              </div>

              <div className="text-right">
                <h2 className="text-xl font-bold text-deep-emerald">
                  QUOTATION
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {quotationNumber || '-'}
                </p>
              </div>
            </div>

            {/* Meta Information */}
            <div className="mb-8 grid grid-cols-2 gap-8">
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Quotation Details
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="font-medium text-gray-900">
                      {date || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Valid Until:</span>
                    <span className="font-medium text-gray-900">
                      {validUntil || '-'}
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
                    <span className="text-gray-500">Name:</span>
                    <span className="font-medium text-gray-900">
                      {customer?.name || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Phone:</span>
                    <span className="font-medium text-gray-900">
                      {customer?.phone || '-'}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="font-medium text-gray-900">
                      {customer?.email || '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {customer?.address && (
              <div className="mb-8">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                  Address
                </h3>

                <p className="whitespace-pre-wrap text-sm text-gray-700">
                  {customer.address}
                </p>
              </div>
            )}

            {/* Products Table */}
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
                  <col style={{ width: showDiscount ? '28%' : '32%' }} />
                  <col style={{ width: showDiscount ? '15%' : '17%' }} />
                  <col style={{ width: '8%' }} />
                  <col style={{ width: showDiscount ? '14%' : '16%' }} />
                  {showDiscount && (
                    <col style={{ width: '13%' }} />
                  )}
                  <col style={{ width: '9%' }} />
                  <col style={{ width: showDiscount ? '13%' : '18%' }} />
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
                        key={`${item.sku || item.productName || 'item'}-${index}`}
                        className={
                          index % 2 === 0
                            ? 'bg-gray-50'
                            : 'bg-white'
                        }
                      >
                        <td className="break-words px-2 py-3 text-sm font-medium text-gray-900">
                          {item.productName || item.name || '-'}
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
                            {formatCurrency(discountAmount)}
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

            {/* Totals */}
            <div className="mb-8 flex justify-end">
              <div className="w-72 max-w-full">
                <div className="space-y-2">
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Total Items</span>
                    <span className="font-medium text-gray-900">
                      {safeCalculations.totalQuantity}
                    </span>
                  </div>

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Gross Amount</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(safeCalculations.totalGrossAmount)}
                    </span>
                  </div>

                  {showDiscount && (
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-gray-500">Total Discount</span>
                      <span className="font-medium text-gray-900">
                        - {formatCurrency(safeCalculations.totalDiscount)}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between gap-4 text-sm">
                    <span className="text-gray-500">Total GST</span>
                    <span className="font-medium text-gray-900">
                      {formatCurrency(safeCalculations.totalGst)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t-2 border-deep-emerald pt-2">
                    <span className="text-base font-bold text-gray-900">
                      Grand Total
                    </span>

                    <span className="text-xl font-bold text-deep-emerald">
                      {formatCurrency(safeCalculations.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
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

            {/* Terms and Conditions */}
            <div className="mb-12">
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                Terms & Conditions
              </h3>

              <ul className="list-inside list-disc space-y-1 text-xs text-gray-600">
                <li>
                  This quotation is valid for 30 days from the date of issue.
                </li>
                <li>
                  Prices are per piece and inclusive of applicable discounts
                  unless otherwise stated.
                </li>
                <li>
                  GST is calculated as per current applicable rates on the
                  taxable value.
                </li>
                <li>
                  Designs, colors, and plating may vary slightly from the
                  displayed images.
                </li>
                <li>
                  Payment must be made in full before dispatch.
                </li>
              </ul>
            </div>

            {/* Signature */}
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

          {/* Actions */}
          <div className="print-hide sticky bottom-0 flex justify-end gap-3 border-t border-gray-200 bg-gray-100 p-4">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-semibold text-charcoal-text transition-colors hover:bg-surface-variant"
            >
              Close
            </button>

            <button
              onClick={onGeneratePDF}
              className="flex items-center gap-2 bg-deep-emerald px-6 py-2.5 text-sm font-semibold text-surface-white shadow-sm transition-colors hover:bg-regal-gold"
            >
              <span className="material-symbols-outlined text-[16px]">
                download
              </span>
              Download PDF
            </button>

            <button
              onClick={onPrint}
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