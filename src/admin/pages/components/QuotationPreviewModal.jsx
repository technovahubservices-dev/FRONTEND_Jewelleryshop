import { useEffect, useMemo, useRef, useState } from 'react';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import logo from '../../../assets/icons/logo.jpeg';
import { downloadQuotationPdf, buildQuotationPdf } from './quotationPdf';

const RUPEE_SYMBOL = 'Rs.';

const PRINT_STYLES = `
  @page { size: A4; margin: 0; }
  @media print {
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body * { visibility: hidden !important; }
    .qpm-print-root, .qpm-print-root * { visibility: visible !important; }
    .qpm-print-root {
      position: absolute !important;
      left: 0 !important;
      top: 0 !important;
      width: 210mm !important;
      min-height: 297mm !important;
      margin: 0 !important;
      padding: 12mm 14mm !important;
      background: #ffffff !important;
      box-shadow: none !important;
    }
    .qpm-no-print { display: none !important; }
    .qpm-page-break { page-break-after: always; break-after: page; }
    .qpm-avoid-break {
      page-break-inside: avoid !important;
      break-inside: avoid !important;
    }
    .qpm-keep-together { page-break-inside: avoid !important; }
  }
`;

const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const computeLineTotals = (item) => {
  const qty = parseNumber(item.quantity) || 0;
  const price = parseNumber(item.price) || 0;
  const discountPct = parseNumber(item.discount) || 0;
  const gstPct = parseNumber(item.gst) || 0;
  const making = parseNumber(item.makingCharges) || 0;
  const wastage = parseNumber(item.wastage) || 0;
  const stone = parseNumber(item.stoneCharges) || 0;
  const basePrice = qty * price + making + wastage + stone;
  const discountAmount = basePrice * (discountPct / 100);
  const taxable = Math.max(0, basePrice - discountAmount);
  const gstAmount = taxable * (gstPct / 100);
  const lineTotal = taxable + gstAmount;
  return { qty, basePrice, discountAmount, taxable, gstAmount, lineTotal, discountPct, gstPct };
};

const computeTotals = (items = []) => {
  return items.reduce(
    (acc, it) => {
      const t = computeLineTotals(it);
      acc.gross += t.basePrice;
      acc.discount += t.discountAmount;
      acc.taxable += t.taxable;
      acc.gst += t.gstAmount;
      acc.grand += t.lineTotal;
      acc.quantity += t.qty;
      return acc;
    },
    { gross: 0, discount: 0, taxable: 0, gst: 0, grand: 0, quantity: 0 }
  );
};

const Money = ({ value, className = '' }) => (
  <span className={className}>{`Rs. ${(Number(value) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}</span>
);

export default function QuotationPreviewModal({ open, onClose, quotation }) {
  const printRootRef = useRef(null);
  const [pdfReady, setPdfReady] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (!open) {
      setPdfReady(false);
      setActionError('');
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const prepared = useMemo(() => {
    if (!quotation) return null;
    const items = Array.isArray(quotation.items) ? quotation.items : [];
    const totals = computeTotals(items);
    return {
      quotationNumber: quotation.quotationNumber || '-',
      date: quotation.date,
      validUntil: quotation.validUntil,
      notes: quotation.notes || '',
      customer: {
        name: quotation.customer?.name || '-',
        phone: quotation.customer?.phone || '',
        email: quotation.customer?.email || '',
        address: quotation.customer?.address || '',
      },
      items,
      totals,
    };
  }, [quotation]);

  if (!open || !prepared) return null;

  const handleDownloadPdf = () => {
    setActionError('');
    try {
      downloadQuotationPdf(quotation);
    } catch (err) {
      console.error('PDF generation failed:', err);
      setActionError('Could not generate the PDF. Please try again.');
    }
  };

  const handlePrint = () => {
    setActionError('');
    try {
      const doc = buildQuotationPdf(quotation);
      const blobUrl = doc.output('bloburl');
      const win = window.open(blobUrl, '_blank', 'width=900,height=1200');
      if (!win) {
        setActionError('Pop-up blocked. Please allow pop-ups to print, or use Download PDF.');
      }
    } catch (err) {
      console.error('Print failed:', err);
      setActionError('Could not open the print preview. Please use Download PDF.');
    }
  };

  const halfGst = prepared.totals.gst / 2;

  return (
    <>
      <style>{PRINT_STYLES}</style>
      <div
        className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-y-auto p-4 md:p-8 qpm-no-print"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quotation-preview-title"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) onClose?.();
        }}
      >
        <div className="bg-white w-full max-w-[210mm] shadow-2xl my-8">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10 qpm-no-print">
            <div>
              <h2 id="quotation-preview-title" className="text-lg font-playfair font-bold text-deep-emerald">
                Quotation Preview
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                {prepared.quotationNumber} · {formatDate(prepared.date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-outline-variant text-charcoal-text text-xs font-label-caps uppercase tracking-wider rounded hover:bg-surface-variant transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
              </button>
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded hover:bg-primary-container active:scale-95 transition-all shadow-sm"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-on-surface-variant hover:text-deep-emerald transition-colors"
                aria-label="Close preview"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>

          {actionError && (
            <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded text-sm qpm-no-print">
              {actionError}
            </div>
          )}

          <div
            ref={printRootRef}
            className="qpm-print-root"
            style={{
              width: '210mm',
              minHeight: '297mm',
              padding: '12mm 14mm',
              boxSizing: 'border-box',
              background: '#ffffff',
              color: '#1f2937',
              fontFamily: '"Inter", "Segoe UI", system-ui, -apple-system, sans-serif',
              fontSize: '12pt',
              lineHeight: 1.45,
            }}
          >
            <header className="flex items-start justify-between border-b-2 border-[#153B2D] pb-5 qpm-avoid-break">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 flex items-center justify-center">
                  <img src={logo} alt="JKR" className="w-full h-full object-contain" crossOrigin="anonymous" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-wide" style={{ color: '#153B2D', letterSpacing: '0.04em' }}>
                    JKR JEWELLERY
                  </h1>
                  <p className="text-xs text-gray-500 mt-1">Crafting timeless elegance since 2017</p>
                  <p className="text-xs text-gray-500">123, Heritage Lane, T Nagar, Chennai - 600017</p>
                  <p className="text-xs text-gray-500">+91 44 0000 0000 · support@jkrjewellery.com</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold" style={{ color: '#153B2D' }}>QUOTATION</h2>
                <p className="text-sm text-gray-600 mt-1">No. <span className="font-semibold text-gray-900">{prepared.quotationNumber}</span></p>
                <p className="text-xs text-gray-500 mt-2">Date: <span className="text-gray-900 font-medium">{formatDate(prepared.date)}</span></p>
                <p className="text-xs text-gray-500">Valid Until: <span className="text-gray-900 font-medium">{formatDate(prepared.validUntil)}</span></p>
              </div>
            </header>

            <section className="grid grid-cols-2 gap-6 mt-6 qpm-avoid-break">
              <div>
                <h3 className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#153B2D' }}>Bill To</h3>
                <p className="text-sm font-semibold text-gray-900">{prepared.customer.name}</p>
                {prepared.customer.phone && <p className="text-xs text-gray-600 mt-1">Phone: {prepared.customer.phone}</p>}
                {prepared.customer.email && <p className="text-xs text-gray-600">Email: {prepared.customer.email}</p>}
                {prepared.customer.address && <p className="text-xs text-gray-600 mt-1 whitespace-pre-line">{prepared.customer.address}</p>}
              </div>
              <div>
                <h3 className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#153B2D' }}>Quotation Summary</h3>
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex justify-between"><span>Status</span><span className="font-semibold text-gray-900 uppercase">{(quotation.status || 'draft')}</span></div>
                  <div className="flex justify-between"><span>Items</span><span className="font-semibold text-gray-900">{prepared.items.length}</span></div>
                  <div className="flex justify-between"><span>Total Qty</span><span className="font-semibold text-gray-900">{prepared.totals.quantity}</span></div>
                </div>
              </div>
            </section>

            <section className="mt-8 qpm-keep-together">
              <h3 className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: '#153B2D' }}>Items</h3>
              <div className="overflow-hidden border border-gray-200 rounded">
                <table className="w-full border-collapse text-xs" style={{ tableLayout: 'fixed', width: '100%' }}>
                  <colgroup>
                    <col style={{ width: '4%' }} />
                    <col style={{ width: '26%' }} />
                    <col style={{ width: '14%' }} />
                    <col style={{ width: '8%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '10%' }} />
                    <col style={{ width: '6%' }} />
                    <col style={{ width: '14%' }} />
                  </colgroup>
                  <thead>
                    <tr style={{ background: '#153B2D', color: '#ffffff' }}>
                      <th className="py-2 px-2 text-center text-[10px] font-bold uppercase tracking-wider">#</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase tracking-wider">Item / SKU</th>
                      <th className="py-2 px-2 text-left text-[10px] font-bold uppercase tracking-wider">Metal / Purity</th>
                      <th className="py-2 px-2 text-right text-[10px] font-bold uppercase tracking-wider">Wt (g)</th>
                      <th className="py-2 px-2 text-center text-[10px] font-bold uppercase tracking-wider">Qty</th>
                      <th className="py-2 px-2 text-right text-[10px] font-bold uppercase tracking-wider">Rate</th>
                      <th className="py-2 px-2 text-right text-[10px] font-bold uppercase tracking-wider">Making</th>
                      <th className="py-2 px-2 text-center text-[10px] font-bold uppercase tracking-wider">GST</th>
                      <th className="py-2 px-2 text-right text-[10px] font-bold uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prepared.items.length === 0 && (
                      <tr>
                        <td colSpan={9} className="py-6 text-center text-gray-500">No items in this quotation.</td>
                      </tr>
                    )}
                    {prepared.items.map((item, idx) => {
                      const t = computeLineTotals(item);
                      const metalPurity = [item.metal, item.purity].filter(Boolean).join(' / ') || '-';
                      const making = parseNumber(item.makingCharges) + parseNumber(item.wastage) + parseNumber(item.stoneCharges);
                      const isEven = idx % 2 === 0;
                      return (
                        <tr
                          key={idx}
                          className="qpm-avoid-break"
                          style={{ background: isEven ? '#F9FAFB' : '#FFFFFF', breakInside: 'avoid' }}
                        >
                          <td className="py-2.5 px-2 text-center text-gray-700 align-top">{idx + 1}</td>
                          <td className="py-2.5 px-2 text-gray-900 align-top">
                            <div className="font-medium leading-tight">{item.name || '-'}</div>
                            {item.sku && <div className="text-[10px] text-gray-500 mt-0.5">SKU: {item.sku}</div>}
                          </td>
                          <td className="py-2.5 px-2 text-gray-700 align-top">{metalPurity}</td>
                          <td className="py-2.5 px-2 text-right text-gray-700 align-top">{item.netWeight || item.grossWeight || '-'}</td>
                          <td className="py-2.5 px-2 text-center text-gray-700 align-top">{t.qty}</td>
                          <td className="py-2.5 px-2 text-right text-gray-700 align-top whitespace-nowrap">
                            <Money value={t.basePrice - t.discountAmount} />
                          </td>
                          <td className="py-2.5 px-2 text-right text-gray-700 align-top whitespace-nowrap">
                            <Money value={making} />
                          </td>
                          <td className="py-2.5 px-2 text-center text-gray-700 align-top">{t.gstPct}%</td>
                          <td className="py-2.5 px-2 text-right align-top whitespace-nowrap" style={{ color: '#153B2D', fontWeight: 600 }}>
                            <Money value={t.lineTotal} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="mt-6 flex justify-end qpm-keep-together">
              <div className="w-[60mm] text-xs">
                <div className="flex justify-between py-1 text-gray-600"><span>Total Items</span><span className="text-gray-900 font-medium">{prepared.totals.quantity}</span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>Subtotal (Gross)</span><span className="text-gray-900 font-medium"><Money value={prepared.totals.gross} /></span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>Discount</span><span className="text-gray-900 font-medium">- <Money value={prepared.totals.discount} /></span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>Taxable Value</span><span className="text-gray-900 font-medium"><Money value={prepared.totals.taxable} /></span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>CGST (50%)</span><span className="text-gray-900 font-medium"><Money value={halfGst} /></span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>SGST (50%)</span><span className="text-gray-900 font-medium"><Money value={halfGst} /></span></div>
                <div className="flex justify-between py-1 text-gray-600"><span>IGST</span><span className="text-gray-900 font-medium"><Money value={0} /></span></div>
                <div className="flex justify-between items-center border-t-2 pt-2 mt-2" style={{ borderColor: '#153B2D' }}>
                  <span className="text-sm font-bold text-gray-900">GRAND TOTAL</span>
                  <span className="text-base font-bold" style={{ color: '#153B2D' }}><Money value={prepared.totals.grand} /></span>
                </div>
              </div>
            </section>

            {prepared.notes && (
              <section className="mt-6 qpm-keep-together">
                <h3 className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#153B2D' }}>Notes</h3>
                <p className="text-xs text-gray-700 whitespace-pre-line">{prepared.notes}</p>
              </section>
            )}

            <section className="mt-8 qpm-keep-together">
              <h3 className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: '#153B2D' }}>Terms & Conditions</h3>
              <ol className="text-[11px] text-gray-700 space-y-1 list-decimal list-inside">
                <li>This quotation is valid for 30 days from the date of issue.</li>
                <li>Prices are subject to change based on prevailing market metal rates.</li>
                <li>GST is calculated as per current applicable rates on the taxable value.</li>
                <li>Making charges and wastage are approximate and may vary marginally.</li>
                <li>Designs, colors, and plating may vary slightly from the displayed images.</li>
                <li>Payment must be made in full before dispatch.</li>
              </ol>
            </section>

            <section className="mt-10 pt-6 border-t border-gray-300 flex justify-between qpm-keep-together">
              <div className="text-center w-[60mm]">
                <div className="border-b border-gray-500 h-10"></div>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Authorized Signatory</p>
              </div>
              <div className="text-center w-[60mm]">
                <div className="border-b border-gray-500 h-10"></div>
                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-wider">Customer Signature</p>
              </div>
            </section>

            <footer className="mt-8 text-center text-[10px] text-gray-500">
              Thank you for choosing JKR Jewellery. This is a computer-generated quotation.
            </footer>
          </div>
        </div>
      </div>
    </>
  );
}
