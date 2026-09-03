import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const RUPEE = 'Rs.';

const parseNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.\-]/g, '');
  const num = parseFloat(cleaned);
  return Number.isFinite(num) ? num : 0;
};

const formatDate = (value) => {
  if (!value) return '-';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleDateString('en-GB', { year: 'numeric', month: 'short', day: '2-digit' });
};

const formatMoney = (value) => {
  const num = parseNumber(value);
  return `${RUPEE} ${num.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
};

const DEEP_EMERALD = [21, 59, 45];
const REGAL_GOLD = [212, 175, 55];
const SOFT_GREY = [107, 114, 128];
const BORDER_GREY = [229, 231, 235];

// Discount is now a flat ₹ amount per line (not a percentage).
// basePrice = qty * price
// taxable   = basePrice - discount
// gst       = taxable * gstPct/100
// total     = taxable + gst
const computeLineTotals = (item) => {
  const qty = parseNumber(item.quantity) || 0;
  const price = parseNumber(item.price) || 0;
  const discountAmount = parseNumber(item.discount) || 0;
  const gstPct = parseNumber(item.gst) || 0;

  const basePrice = qty * price;
  const taxable = Math.max(0, basePrice - discountAmount);
  const gstAmount = taxable * (gstPct / 100);
  const lineTotal = taxable + gstAmount;
  return { qty, price, discountAmount, gstPct, basePrice, taxable, gstAmount, lineTotal };
};

const computeTotals = (items) => {
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

const drawHeader = (doc, pageWidth, margin, quotation) => {
  const startY = 18;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(...DEEP_EMERALD);
  doc.text('JKR JEWELLERY', margin, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SOFT_GREY);
  doc.text('Crafting timeless elegance since 2017', margin, startY + 5);
  doc.text('123, Heritage Lane, T Nagar, Chennai - 600017', margin, startY + 10);
  doc.text('Phone: +91 44 0000 0000  |  Email: support@jkrjewellery.com', margin, startY + 15);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...DEEP_EMERALD);
  doc.text('QUOTATION', pageWidth - margin, startY, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(`No: ${quotation.quotationNumber || '-'}`, pageWidth - margin, startY + 6, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...SOFT_GREY);
  doc.text(`Date: ${formatDate(quotation.date)}`, pageWidth - margin, startY + 11, { align: 'right' });
  doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, pageWidth - margin, startY + 16, { align: 'right' });

  doc.setDrawColor(...DEEP_EMERALD);
  doc.setLineWidth(0.6);
  doc.line(margin, startY + 22, pageWidth - margin, startY + 22);
};

const drawBillTo = (doc, margin, startY, customer) => {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...DEEP_EMERALD);
  doc.text('BILL TO', margin, startY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  let y = startY + 6;
  doc.text(customer?.name || '-', margin, y);
  if (customer?.phone) {
    y += 5;
    doc.text(`Phone: ${customer.phone}`, margin, y);
  }
  if (customer?.email) {
    y += 5;
    doc.text(`Email: ${customer.email}`, margin, y);
  }
  if (customer?.address) {
    const addressLines = doc.splitTextToSize(customer.address, 95);
    y += 5;
    doc.text(addressLines, margin, y);
    y += (addressLines.length - 1) * 5;
  }
  return y;
};

const drawItemsTable = (doc, margin, startY, items) => {
  const showDiscount = items.some((it) => parseNumber(it.discount) > 0);

  const headRow1 = ['#', 'Product Name / SKU'];
  const headRow2 = ['', ''];
  const body = [];

  // Column widths — recalculated depending on whether Discount column exists.
  const widths = showDiscount
    ? [8, 60, 10, 22, 22, 12, 30]
    : [8, 70, 10, 26, 12, 38];

  // Build body first so we can attach it after autoTable is configured.
  items.forEach((item, idx) => {
    const t = computeLineTotals(item);
    const itemName = item.name || '-';
    const sku = item.sku ? `\n${item.sku}` : '';
    const row = [
      String(idx + 1),
      `${itemName}${sku}`,
      String(t.qty),
      formatMoney(t.price),
    ];
    if (showDiscount) {
      row.push(formatMoney(t.discountAmount));
    }
    row.push(`${t.gstPct}%`, formatMoney(t.lineTotal));
    body.push(row);
  });

  // Placeholder body for header; we'll run autoTable in two phases so we can
  // include the discount column conditionally.
  autoTable(doc, {
    startY,
    head: [showDiscount
      ? ['#', 'Product Name / SKU', 'Qty', 'Price (Rs.)', 'Discount (Rs.)', 'GST (%)', 'Total (Rs.)']
      : ['#', 'Product Name / SKU', 'Qty', 'Price (Rs.)', 'GST (%)', 'Total (Rs.)']
    ],
    body,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 9,
      cellPadding: { top: 4, right: 3, bottom: 4, left: 3 },
      valign: 'middle',
      lineColor: BORDER_GREY,
      lineWidth: 0.2,
      textColor: [31, 41, 55],
    },
    headStyles: {
      fillColor: DEEP_EMERALD,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    columnStyles: showDiscount
      ? {
          0: { halign: 'center', cellWidth: widths[0] },
          1: { cellWidth: widths[1] },
          2: { halign: 'center', cellWidth: widths[2] },
          3: { halign: 'right', cellWidth: widths[3] },
          4: { halign: 'right', cellWidth: widths[4] },
          5: { halign: 'center', cellWidth: widths[5] },
          6: { halign: 'right', cellWidth: widths[6], fontStyle: 'bold', textColor: DEEP_EMERALD },
        }
      : {
          0: { halign: 'center', cellWidth: widths[0] },
          1: { cellWidth: widths[1] },
          2: { halign: 'center', cellWidth: widths[2] },
          3: { halign: 'right', cellWidth: widths[3] },
          4: { halign: 'center', cellWidth: widths[4] },
          5: { halign: 'right', cellWidth: widths[5], fontStyle: 'bold', textColor: DEEP_EMERALD },
        },
  });

  // Suppress unused vars warnings while keeping API symmetry.
  void headRow1;
  void headRow2;
};

const drawSummary = (doc, pageWidth, margin, startY, totals) => {
  const showDiscount = totals.discount > 0;
  const boxWidth = 75;
  const boxX = pageWidth - margin - boxWidth;
  const lineHeight = 6;
  let y = startY + 4;

  doc.setDrawColor(...BORDER_GREY);
  doc.setLineWidth(0.2);
  doc.line(boxX, y - 2, pageWidth - margin, y - 2);

  const rows = [
    ['Total Items', String(totals.quantity)],
    ['Subtotal (Gross)', formatMoney(totals.gross)],
  ];
  if (showDiscount) {
    rows.push(['Discount', `- ${formatMoney(totals.discount)}`]);
  }
  rows.push(['Taxable Value', formatMoney(totals.taxable)]);

  const halfGst = totals.gst / 2;
  rows.push(['CGST (50%)', formatMoney(halfGst)]);
  rows.push(['SGST (50%)', formatMoney(halfGst)]);
  rows.push(['IGST', formatMoney(0)]);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(...SOFT_GREY);

  rows.forEach(([label, value]) => {
    doc.text(label, boxX + 2, y);
    doc.text(value, pageWidth - margin - 2, y, { align: 'right' });
    y += lineHeight;
  });

  doc.setDrawColor(...DEEP_EMERALD);
  doc.setLineWidth(0.5);
  doc.line(boxX, y - 1, pageWidth - margin, y - 1);

  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(...DEEP_EMERALD);
  doc.text('GRAND TOTAL', boxX + 2, y + 4);
  doc.text(formatMoney(totals.grand), pageWidth - margin - 2, y + 4, { align: 'right' });

  return y + lineHeight;
};

const drawTermsAndSignature = (doc, pageWidth, margin, startY) => {
  const termsY = Math.max(startY + 14, 230);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...DEEP_EMERALD);
  doc.text('TERMS & CONDITIONS', margin, termsY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  const terms = [
    '1. This quotation is valid for 30 days from the date of issue.',
    '2. Prices are subject to change based on prevailing market metal rates.',
    '3. GST is calculated as per current applicable rates on the taxable value.',
    '4. Discounts (if any) are applied as a flat amount per item before GST is computed.',
    '5. Designs, colors, and plating may vary slightly from the displayed images.',
    '6. Payment must be made in full before dispatch.',
  ];
  let y = termsY + 5;
  terms.forEach((t) => {
    doc.text(t, margin, y);
    y += 4.5;
  });

  const sigY = 275;
  doc.setDrawColor(150);
  doc.setLineWidth(0.3);
  doc.line(margin, sigY, margin + 60, sigY);
  doc.line(pageWidth - margin - 60, sigY, pageWidth - margin, sigY);

  doc.setFontSize(8.5);
  doc.setTextColor(...SOFT_GREY);
  doc.text('Authorized Signatory', margin + 30, sigY + 5, { align: 'center' });
  doc.text('Customer Signature', pageWidth - margin - 30, sigY + 5, { align: 'center' });
};

export const buildQuotationPdf = (quotation) => {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const items = Array.isArray(quotation?.items) ? quotation.items : [];
  const totals = computeTotals(items);

  drawHeader(doc, pageWidth, margin, quotation);

  const customer = quotation.customer || {};
  const billEndY = drawBillTo(doc, margin, 46, customer);

  const tableStartY = Math.max(billEndY + 4, 78);
  drawItemsTable(doc, margin, tableStartY, items);

  const afterTableY = doc.lastAutoTable?.finalY || tableStartY + 20;
  const summaryY = Math.min(afterTableY + 4, pageHeight - 70);
  const grandEndY = drawSummary(doc, pageWidth, margin, summaryY, totals);

  const trimmedNotes = String(quotation.notes || '').trim();
  if (trimmedNotes) {
    const notesY = Math.max(grandEndY + 4, summaryY + 50);
    if (notesY < pageHeight - 60) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...DEEP_EMERALD);
      doc.text('NOTE', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);
      const noteLines = doc.splitTextToSize(trimmedNotes, pageWidth - 2 * margin);
      doc.text(noteLines, margin, notesY + 5);
    }
  }

  drawTermsAndSignature(doc, pageWidth, margin, grandEndY);

  return doc;
};

export const downloadQuotationPdf = (quotation) => {
  const doc = buildQuotationPdf(quotation);
  const safeNumber = (quotation?.quotationNumber || 'quotation').replace(/[^\w\-]/g, '_');
  doc.save(`Quotation-${safeNumber}.pdf`);
};