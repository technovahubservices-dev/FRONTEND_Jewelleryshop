export default function QuotationSummary({ calculations, quotationNumber, date, validUntil, notes, saving, itemCount, onSave, onPreview, onUpdateValidUntil, onUpdateNotes }) {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6">Quotation Details</h2>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Quotation Number</p>
            <p className="text-sm font-body-md text-charcoal-text font-medium">{quotationNumber}</p>
          </div>
          <div>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Date</p>
            <p className="text-sm font-body-md text-charcoal-text">{date}</p>
          </div>
          <div>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Valid Until</p>
            <input type="date" value={validUntil} onChange={(e) => onUpdateValidUntil(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" />
          </div>
          <div>
            <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Notes</p>
            <textarea rows="4" value={notes} onChange={(e) => onUpdateNotes(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors resize-y" placeholder="Additional notes..."></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Summary</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Total Items</span>
            <span className="text-charcoal-text font-medium">{calculations.totalQuantity}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Gross Amount</span>
            <span className="text-charcoal-text font-medium">₹ {calculations.totalGrossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Total Discount</span>
            <span className="text-charcoal-text font-medium">- ₹ {calculations.totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-on-surface-variant">Total GST</span>
            <span className="text-charcoal-text font-medium">₹ {calculations.totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
          <div className="border-t border-outline-variant pt-3 flex justify-between items-center">
            <span className="text-sm font-semibold text-charcoal-text">Grand Total</span>
            <span className="text-lg font-bold text-deep-emerald">₹ {calculations.grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={() => onSave('draft')} disabled={saving || itemCount === 0} className="w-full py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button onClick={onPreview} disabled={itemCount === 0} className="w-full py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          Preview
        </button>
        <button onClick={() => onSave('sent')} disabled={saving || itemCount === 0} className="w-full py-3 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? 'Saving...' : 'Save Quotation'}
        </button>
      </div>
    </div>
  )
}
