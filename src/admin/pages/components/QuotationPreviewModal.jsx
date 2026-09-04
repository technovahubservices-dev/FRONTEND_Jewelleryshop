import logo from '../../../assets/icons/logo.jpeg'
import { calculateLineItem, hasAnyDiscount } from '../../../utils/formatters'

const printStyles = `
  @media print {
    @page {
      size: A4;
      margin: 10mm;
    }
    body * {
      visibility: hidden !important;
    }
    #quotation-preview, #quotation-preview * {
      visibility: visible !important;
    }
    #quotation-preview {
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

export default function QuotationPreviewModal({ open, onClose, quotationNumber, date, validUntil, customer, notes, items, calculations, hasDiscount, onGeneratePDF, onPrint }) {
  if (!open) return null

  const showDiscount = hasDiscount !== undefined ? hasDiscount : hasAnyDiscount(items)

  return (
    <>
      <style>{printStyles}</style>
      <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
        <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl my-8">
          <div className="p-8 md:p-12" id="quotation-preview">
            {/* Header */}
            <div className="flex items-start justify-between border-b-2 border-deep-emerald pb-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="JKR" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h1 className="text-2xl font-playfair font-bold text-deep-emerald">JKR Jewellery</h1>
                  <p className="text-xs text-gray-500 mt-1">Crafting timeless elegance since 2017</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-deep-emerald">QUOTATION</h2>
                <p className="text-sm text-gray-600 mt-1">{quotationNumber}</p>
              </div>
            </div>

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quotation Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-900 font-medium">{date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Valid Until:</span>
                    <span className="text-gray-900 font-medium">{validUntil}</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Name:</span>
                    <span className="text-gray-900 font-medium">{customer.name || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Phone:</span>
                    <span className="text-gray-900 font-medium">{customer.phone || '-'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Email:</span>
                    <span className="text-gray-900 font-medium">{customer.email || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Address */}
            {customer.address && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</h3>
                <p className="text-sm text-gray-700">{customer.address}</p>
              </div>
            )}

            {/* Products Table */}
             <div className="mb-8">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Products</h3>
               <table className="w-full border-collapse" style={{ tableLayout: 'fixed', width: '100%' }}>
                 <colgroup>
                   <col style={{ width: '35%' }} />
                   <col style={{ width: '15%' }} />
                   <col style={{ width: '10%' }} />
                   <col style={{ width: '12%' }} />
                   {showDiscount && <col style={{ width: '12%' }} />}
                   <col style={{ width: '8%' }} />
                   <col style={{ width: '18%' }} />
                 </colgroup>
                 <thead>
                   <tr className="bg-deep-emerald text-white">
                     <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">Product</th>
                     <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">SKU</th>
                     <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Qty</th>
                     <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Price</th>
                     {hasDiscount && <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Discount</th>}
                     <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">GST</th>
                     <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {items.map((item, index) => {
                     const { qty, basePriceTotal, discountAmount, gstPercent, lineTotal } = calculateLineItem(item)

                     return (
                       <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                         <td className="py-3 px-3 text-sm text-gray-900 font-medium">{item.productName || item.name || '-'}</td>
                         <td className="py-3 px-3 text-sm text-gray-600">{item.sku || '-'}</td>
                         <td className="py-3 px-3 text-sm text-gray-600 text-right">{qty}</td>
                         <td className="py-3 px-3 text-sm text-gray-600 text-right whitespace-nowrap">₹ {basePriceTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
{showDiscount && (
                          <td className="py-3 px-3 text-sm text-gray-600 text-right whitespace-nowrap">₹ {discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        )}
                         <td className="py-3 px-3 text-sm text-gray-600 text-right">{gstPercent}%</td>
                         <td className="py-3 px-3 text-sm text-deep-emerald font-semibold text-right whitespace-nowrap">₹ {lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
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
                    <span className="text-gray-500">Gross Amount</span>
                    <span className="text-gray-900 font-medium">₹ {calculations.totalGrossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  {showDiscount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Discount</span>
                      <span className="text-gray-900 font-medium">- ₹ {calculations.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Total GST</span>
                    <span className="text-gray-900 font-medium">₹ {calculations.totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="border-t-2 border-deep-emerald pt-2 flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Grand Total</span>
                    <span className="text-xl font-bold text-deep-emerald">₹ {calculations.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {notes && (
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
              </div>
            )}

            {/* Terms & Conditions */}
            <div className="mb-12">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
              <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                <li>This quotation is valid for 30 days from the date of issue.</li>
                <li>Prices are per piece and inclusive of applicable discounts unless otherwise stated.</li>
                <li>GST is calculated as per current applicable rates on the taxable value.</li>
                <li>Designs, colors, and plating may vary slightly from the displayed images.</li>
                <li>Payment must be made in full before dispatch.</li>
              </ul>
            </div>

            {/* Signature */}
            <div className="flex justify-between items-end mt-8 pt-8 border-t border-gray-200">
              <div className="text-center">
                <div className="border-b border-gray-400 w-48 mb-2"></div>
                <p className="text-xs text-gray-500">Authorized Signature</p>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 w-48 mb-2"></div>
                <p className="text-xs text-gray-500">Customer Signature</p>
              </div>
            </div>
          </div>

          {/* Print Actions */}
          <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-4 flex justify-end gap-3 print-hide">
            <button onClick={onClose} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">
              Close
            </button>
            <button onClick={onGeneratePDF} className="px-6 py-2.5 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">download</span>
              Download PDF
            </button>
            <button onClick={onPrint} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">print</span>
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
