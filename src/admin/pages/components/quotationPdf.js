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
  return { qty, price, discountPct, gstPct, basePrice, discountAmount, taxable, gstAmount, lineTotal };
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
  const head = [['#', 'Item / SKU', 'Metal / Purity', 'Wt (g)', 'Qty', 'Rate', 'Making', 'GST', 'Total']];
  const body = items.map((item, idx) => {
    const t = computeLineTotals(item);
    const metalPurity = [item.metal, item.purity].filter(Boolean).join(' / ') || '-';
    const itemName = item.name || '-';
    const sku = item.sku ? `\n${item.sku}` : '';
    return [
      String(idx + 1),
      `${itemName}${sku}`,
      metalPurity,
      item.netWeight || item.grossWeight || '-',
      String(t.qty),
      formatMoney(t.basePrice - t.discountAmount),
      formatMoney(parseNumber(item.makingCharges) + parseNumber(item.wastage) + parseNumber(item.stoneCharges)),
      `${t.gstPct}%`,
      formatMoney(t.lineTotal),
    ];
  });

  autoTable(doc, {
    startY,
    head,
    body,
    theme: 'grid',
    margin: { left: margin, right: margin },
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
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
      fontSize: 8.5,
      halign: 'center',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 22 },
      3: { halign: 'right', cellWidth: 14 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'right', cellWidth: 22 },
      6: { halign: 'right', cellWidth: 18 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'right', cellWidth: 24, fontStyle: 'bold', textColor: DEEP_EMERALD },
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 1 && typeof data.cell.raw === 'string' && data.cell.raw.includes('\n')) {
        data.cell.styles.cellPadding = { top: 4, right: 3, bottom: 4, left: 3 };
      }
    },
  });
};

const drawSummary = (doc, pageWidth, margin, startY, totals) => {
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
    ['Discount', `- ${formatMoney(totals.discount)}`],
    ['Taxable Value', formatMoney(totals.taxable)],
  ];

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
    '4. Making charges and wastage are approximate and may vary marginally.',
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

  if (quotation.notes) {
    const notesY = Math.max(grandEndY + 4, summaryY + 50);
    if (notesY < pageHeight - 60) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(...DEEP_EMERALD);
      doc.text('NOTES', margin, notesY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(31, 41, 55);
      const noteLines = doc.splitTextToSize(quotation.notes, pageWidth - 2 * margin);
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
