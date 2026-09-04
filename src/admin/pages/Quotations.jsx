import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { quotationAPI, orderAPI } from '../../services/api'
import { formatCurrency, formatDate, calculateLineItem, hasAnyDiscount } from '../../utils/formatters'
import { exportToExcel } from '../../utils/excelExport'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const QUOTATION_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'converted', label: 'Converted to Order' },
]

export default function Quotations() {
  const navigate = useNavigate()
  const location = useLocation()

  const parseNumber = (value) => {
    if (typeof value === 'number') return value
    if (typeof value !== 'string') return 0
    const cleaned = value.replace(/[^0-9.\-]/g, '')
    const num = parseFloat(cleaned)
    return Number.isFinite(num) ? num : 0
  }

  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [viewQuotation, setViewQuotation] = useState(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [convertConfirmId, setConvertConfirmId] = useState(null)

  useEffect(() => {
    fetchQuotations()
  }, [])

  useEffect(() => {
    if (location.state?.quotation) {
      const q = location.state.quotation
      if (location.state.action === 'create') {
        setQuotations(prev => [q, ...prev])
        setSuccessMessage('Quotation created successfully')
      } else if (location.state.action === 'update') {
        setQuotations(prev => prev.map(item => (item._id === q._id ? q : item)))
        setSuccessMessage('Quotation updated successfully')
      }
      setTimeout(() => setSuccessMessage(''), 3000)
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state])

  const fetchQuotations = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await quotationAPI.getAll()
      if (response.data.success) {
        setQuotations(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch quotations')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch quotations')
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations.filter((q) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      q.quotationNumber?.toLowerCase().includes(term) ||
      q.customerName?.toLowerCase().includes(term) ||
      q.email?.toLowerCase().includes(term)
    )
  }).filter((q) => {
    if (statusFilter === 'all') return true
    return q.status === statusFilter
  })

  const handleCreateQuotation = () => {
    navigate('/admin/quotations/create')
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await quotationAPI.delete(deleteConfirmId)
      setQuotations(quotations.filter((q) => q._id !== deleteConfirmId))
      setSuccessMessage('Quotation deleted successfully')
      setError('')
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete quotation')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const handlePrint = (quotation) => {
    setViewQuotation(quotation)
    setTimeout(() => window.print(), 300)
  }

  const generatePDF = (quotation) => {
    if (!quotation) return
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('JKR Jewellery', margin, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Crafting timeless elegance since 2017', margin, y)
    y += 10

    doc.setDrawColor(21, 59, 45)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('QUOTATION', pageWidth - margin, y, { align: 'right' })
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Quotation Number: ${quotation.quotationNumber || '-'}`, pageWidth - margin, y, { align: 'right' })
    y += 12

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Quotation Details', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${formatDate(quotation.date)}`, margin, y)
    doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, pageWidth / 2, y)
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.text('Customer Details', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const customer = quotation.customer || {}
    doc.text(`Name: ${customer.name || '-'}`, margin, y)
    doc.text(`Phone: ${customer.phone || '-'}`, pageWidth / 2, y)
    y += 6
    doc.text(`Email: ${customer.email || '-'}`, margin, y)
    y += 10

    if (customer.address) {
      doc.setFont('helvetica', 'bold')
      doc.text('Address', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const addressLines = doc.splitTextToSize(customer.address, pageWidth - 2 * margin)
      doc.text(addressLines, margin, y)
      y += addressLines.length * 6 + 8
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Products', margin, y)
    y += 4

    const items = quotation.items || []
    const hasDiscount = hasAnyDiscount(items)
    const tableColumn = ['Product', 'SKU', 'Qty', 'Price', ...(hasDiscount ? ['Discount'] : []), 'GST', 'Total']
    const lineItems = items.map((item) => calculateLineItem(item))
    const tableRows = lineItems.map((li, index) => {
      const item = items[index]
      return [
        item.productName || item.name || '-',
        item.sku || '-',
        li.qty.toString(),
        `₹ ${li.basePriceTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        ...(hasDiscount ? [`₹ ${li.discountAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`] : []),
        `${li.gstPercent}%`,
        `₹ ${li.lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [21, 59, 45], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    })

    y = doc.lastAutoTable.finalY + 10

    const totalQuantity = lineItems.reduce((sum, li) => sum + li.qty, 0)
    const totalGrossAmount = lineItems.reduce((sum, li) => sum + li.basePriceTotal, 0)
    const totalDiscount = lineItems.reduce((sum, li) => sum + li.discountAmount, 0)
    const totalGst = lineItems.reduce((sum, li) => sum + li.gstAmount, 0)
    const grandTotal = lineItems.reduce((sum, li) => sum + li.lineTotal, 0)

    doc.setFont('helvetica', 'bold')
    doc.text('Total Items', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(String(totalQuantity), pageWidth - margin, y, { align: 'right' })
    y += 8

    doc.setFont('helvetica', 'bold')
    doc.text('Gross Amount', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`₹ ${totalGrossAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, pageWidth - margin, y, { align: 'right' })
    y += 8

    if (hasDiscount) {
      doc.setFont('helvetica', 'bold')
      doc.text('Total Discount', margin, y)
      doc.setFont('helvetica', 'normal')
      doc.text(`- ₹ ${totalDiscount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, pageWidth - margin, y, { align: 'right' })
      y += 8
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Total GST', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`₹ ${totalGst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, pageWidth - margin, y, { align: 'right' })
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text('Grand Total', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)
    doc.text(`₹ ${grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, pageWidth - margin, y, { align: 'right' })
    y += 12

    if (quotation.notes) {
      doc.setFont('helvetica', 'bold')
      doc.text('Notes', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const noteLines = doc.splitTextToSize(quotation.notes, pageWidth - 2 * margin)
      doc.text(noteLines, margin, y)
      y += noteLines.length * 6 + 8
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const terms = [
      '1. This quotation is valid for 30 days from the date of issue.',
      '2. Prices are subject to change based on market gold rates.',
      '3. GST is calculated as per current applicable rates.',
      '4. Making charges and wastage are approximate and may vary.',
      '5. Payment must be made in full before dispatch.',
    ]
    terms.forEach((term) => {
      const termLines = doc.splitTextToSize(term, pageWidth - 2 * margin)
      doc.text(termLines, margin, y)
      y += termLines.length * 6
    })

    y += 20
    doc.setDrawColor(150)
    doc.line(margin, y, margin + 70, y)
    doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
    y += 6
    doc.setFontSize(9)
    doc.text('Authorized Signature', margin + 35, y, { align: 'center' })
    doc.text('Customer Signature', pageWidth - margin - 35, y, { align: 'center' })

    doc.save(`Quotation-${quotation.quotationNumber || 'draft'}.pdf`)
  }

  const handlePDF = (quotation) => {
    generatePDF(quotation)
  }

  const handleDownloadExcel = () => {
    if (!filteredQuotations.length) {
      setError('No quotations available to export')
      setSuccessMessage('')
      return
    }

    try {
      const exportData = filteredQuotations.map((q) => ({
        'Quotation Number': q.quotationNumber || '',
        Date: formatDate(q.date),
        'Customer Name': q.customerName || '',
        Email: q.email || '',
        Phone: q.phone || '',
        Address: q.address || '',
        'Valid Until': formatDate(q.validUntil),
        'Total Amount': Number(q.totalAmount || 0),
        Status: (q.status || '').toUpperCase(),
        Notes: q.notes || '',
      }))

      exportToExcel({
        data: exportData,
        columns: [
          { wch: 18 },
          { wch: 20 },
          { wch: 25 },
          { wch: 30 },
          { wch: 18 },
          { wch: 40 },
          { wch: 18 },
          { wch: 18 },
          { wch: 14 },
          { wch: 40 },
        ],
        sheetName: 'Quotations',
        filename: 'quotations.xlsx',
      })

      setSuccessMessage('Quotations downloaded successfully')
      setError('')
    } catch (err) {
      console.error('Excel export error:', err)
      setError('Failed to download Excel file')
      setSuccessMessage('')
    }
  }

  const getStatusBadge = (status) => {
    const configs = {
      draft: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant', label: 'Draft' },
      sent: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', border: 'border-secondary-fixed', label: 'Sent' },
      accepted: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed', label: 'Accepted' },
      rejected: { bg: 'bg-error-container/20', text: 'text-error', border: 'border-error-container/30', label: 'Rejected' },
      expired: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant', label: 'Expired' },
      converted: { bg: 'bg-deep-emerald/10', text: 'text-deep-emerald', border: 'border-deep-emerald/30', label: 'Converted to Order' },
    }
    const cfg = configs[status] || configs.draft
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
        {cfg.label}
      </span>
    )
  }

  const handleStatusChange = async (quotationId, newStatus) => {
    try {
      const response = await quotationAPI.update(quotationId, { status: newStatus })
      if (response.data.success) {
        setQuotations(quotations.map((q) => (q._id === quotationId ? response.data.data : q)))
        setSuccessMessage('Quotation status updated successfully')
        setError('')
        setTimeout(() => setSuccessMessage(''), 3000)
      } else {
        setError(response.data.message || 'Failed to update status')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleEditQuotation = (quotation) => {
    navigate('/admin/quotations/create', { state: { quotation } })
  }

  const handleConvertClick = (quotation) => {
    setConvertConfirmId(quotation._id || quotation.id)
  }

  const handleConvertConfirm = async () => {
    if (!convertConfirmId) return
    const quotation = quotations.find(q => (q._id || q.id) === convertConfirmId)
    if (!quotation) return

    try {
      const response = await orderAPI.convertFromQuotation(convertConfirmId, {
        paymentMethod: 'cod',
      })

      if (response.data.success) {
        const order = response.data.data
        setQuotations(quotations.map((q) => (q._id === convertConfirmId ? { ...q, status: 'converted', orderId: order._id } : q)))
        setSuccessMessage(`Quotation ${quotation.quotationNumber} converted to order ${order._id.slice(-6).toUpperCase()} successfully!`)
        setError('')
        setTimeout(() => setSuccessMessage(''), 4000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to convert quotation to order')
    } finally {
      setConvertConfirmId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Quotations</h1>
          <p className="text-sm text-gray-500">Create, manage, and track customer quotations.</p>
        </div>
        <button
          onClick={handleCreateQuotation}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Create Quotation
        </button>
      </div>

      {error && (
        <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
          {successMessage}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <div className="relative w-full lg:w-96">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
            placeholder="Search quotations..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative min-w-[160px]">
            <select
              className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {QUOTATION_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleDownloadExcel}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-[10px] rounded hover:bg-surface-container-low transition-colors"
              title="Download Excel"
            >
              <span className="material-symbols-outlined text-sm">download</span>
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
              progress_activity
            </span>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">
              Loading quotations...
            </p>
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              description
            </span>
            <p className="font-body-md text-sm text-on-surface-variant">
              No quotations found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1200px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Quotation Number</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Customer Name</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Valid Until</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Total Amount</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {filteredQuotations.map((quotation) => (
                  <tr key={quotation._id} className="table-row-hover bg-surface-white group">
                    <td className="py-4 pl-6 pr-4 font-medium text-deep-emerald">
                      {quotation.quotationNumber}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                          {quotation.customerName?.charAt(0) || '?'}
                        </div>
                        <span className="truncate max-w-[180px]">{quotation.customerName}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-on-surface text-xs whitespace-nowrap">{formatDate(quotation.date)}</td>
                    <td className="py-4 px-4 text-on-surface text-xs whitespace-nowrap">{formatDate(quotation.validUntil)}</td>
                    <td className="py-4 px-4 text-right font-semibold text-deep-emerald">{formatCurrency(quotation.totalAmount)}</td>
                     <td className="py-4 px-4">
                       <select
                         value={quotation.status}
                         onChange={(e) => handleStatusChange(quotation._id, e.target.value)}
                         className="appearance-none bg-surface-white border border-outline-variant rounded-md px-2 py-1.5 text-xs font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors cursor-pointer"
                       >
                         {QUOTATION_STATUSES.map((s) => (
                           <option key={s.value} value={s.value}>{s.label}</option>
                         ))}
                       </select>
                     </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setViewQuotation(quotation)}
                          className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                          title="View"
                        >
                          <span className="material-symbols-outlined text-s">visibility</span>
                        </button>
                        <button
                          onClick={() => handleEditQuotation(quotation)}
                          className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                          title="Edit"
                        >
                          <span className="material-symbols-outlined text-s">edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteClick(quotation._id)}
                          className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                          title="Delete"
                        >
                          <span className="material-symbols-outlined text-s">delete</span>
                        </button>
                        <button
                          onClick={() => handlePDF(quotation)}
                          className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                          title="Download PDF"
                        >
                          <span className="material-symbols-outlined text-s">picture_as_pdf</span>
                        </button>
                        <button
                          onClick={() => handlePrint(quotation)}
                          className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                          title="Print"
                        >
                          <span className="material-symbols-outlined text-s">print</span>
                        </button>
                        {quotation.status === 'converted' && quotation.orderId && (
                          <button
                            onClick={() => navigate('/admin/orders')}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="View Order"
                          >
                            <span className="material-symbols-outlined text-s">receipt_long</span>
                          </button>
                        )}
                        {quotation.status === 'accepted' && (
                          <button
                            onClick={() => handleConvertClick(quotation)}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Convert to Order"
                          >
                            <span className="material-symbols-outlined text-s">shopping_bag</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Modal */}
      {viewQuotation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto" onClick={() => setViewQuotation(null)}>
          <div className="bg-surface-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div>
                <h2 className="font-headline-md text-headline-md text-deep-emerald">Quotation {viewQuotation.quotationNumber}</h2>
                <p className="text-xs text-on-surface-variant mt-1">Created on {formatDate(viewQuotation.date)}</p>
              </div>
              <div className="flex items-center gap-2">
                {viewQuotation.status === 'converted' && viewQuotation.orderId && (
                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="px-3 py-1.5 text-xs font-label-caps text-deep-emerald border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
                    title="View related order"
                  >
                    Order #{viewQuotation.orderId.toString().slice(-6).toUpperCase()}
                  </button>
                )}
                <button onClick={() => setViewQuotation(null)} className="text-on-surface-variant hover:text-deep-emerald transition-colors">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Customer Name</p>
                    <p className="text-sm font-body-md text-charcoal-text">{viewQuotation.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Email</p>
                    <p className="text-sm font-body-md text-charcoal-text">{viewQuotation.email}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Valid Until</p>
                    <p className="text-sm font-body-md text-charcoal-text">{formatDate(viewQuotation.validUntil)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Total Amount</p>
                    <p className="text-sm font-body-md text-deep-emerald font-semibold">{formatCurrency(viewQuotation.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Status</p>
                    {getStatusBadge(viewQuotation.status)}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-outline-variant flex justify-end gap-3">
              {viewQuotation.status === 'accepted' && (
                <button onClick={() => handleConvertClick(viewQuotation)} className="px-6 py-3 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm">
                  Convert to Order
                </button>
              )}
              <button onClick={() => { setViewQuotation(null); handleEditQuotation(viewQuotation); }} className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">Edit</button>
              <button onClick={() => handlePDF(viewQuotation)} className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">Download PDF</button>
              <button onClick={() => handlePrint(viewQuotation)} className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">Print</button>
            </div>
          </div>
        </div>
      )}

      {convertConfirmId && (() => {
        const quotation = quotations.find(q => (q._id || q.id) === convertConfirmId)
        if (!quotation) return null
        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="font-headline-md text-headline-md text-deep-emerald mb-2">Convert to Order</h3>
              <p className="font-body-md text-body-md text-on-surface-variant mb-6">Convert quotation {quotation.quotationNumber} into an order? This action cannot be undone.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setConvertConfirmId(null)} className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">Cancel</button>
                <button onClick={handleConvertConfirm} className="px-6 py-3 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm">Convert</button>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-2">Delete Quotation</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">Are you sure you want to delete this quotation? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">Cancel</button>
              <button onClick={handleDeleteConfirm} className="px-6 py-3 bg-error text-surface-white text-sm font-semibold hover:bg-error/90 transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
