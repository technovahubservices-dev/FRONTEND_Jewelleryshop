import { useState, useEffect } from 'react'
import QuotationPreviewModal from './components/QuotationPreviewModal'
import { useNavigate, useLocation } from 'react-router-dom'
import { quotationAPI, orderAPI } from '../../services/api'
import {
  formatCurrency,
  formatDate,
  calculateLineItem,
  hasAnyDiscount,
} from '../../utils/formatters'
import { exportToExcel } from '../../utils/excelExport'

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

  const [quotations, setQuotations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)

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
        setQuotations((prev) => [q, ...prev])
        setSuccessMessage('Quotation created successfully')
      } else if (location.state.action === 'update') {
        setQuotations((prev) =>
          prev.map((item) => (item._id === q._id ? q : item))
        )
        setSuccessMessage('Quotation updated successfully')
      }

      setTimeout(() => setSuccessMessage(''), 3000)

      navigate(location.pathname, {
        replace: true,
        state: {},
      })
    }
  }, [location.state, navigate])

  const fetchQuotations = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await quotationAPI.getAll()

      if (response.data.success) {
        setQuotations(response.data.data || [])
      } else {
        setError(
          response.data.message || 'Failed to fetch quotations'
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to fetch quotations'
      )
    } finally {
      setLoading(false)
    }
  }

  const filteredQuotations = quotations
    .filter((q) => {
      if (!searchTerm.trim()) return true

      const term = searchTerm.toLowerCase()

      return (
        q.quotationNumber
          ?.toLowerCase()
          .includes(term) ||
        q.customer?.name
          ?.toLowerCase()
          .includes(term) ||
        q.customer?.email
          ?.toLowerCase()
          .includes(term)
      )
    })
    .filter((q) => {
      if (statusFilter === 'all') return true

      return q.status === statusFilter
    })

  const totalPages = Math.ceil(
    filteredQuotations.length / pageSize
  )

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter])

  const paginatedQuotations = filteredQuotations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

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

      setQuotations((prev) =>
        prev.filter((q) => q._id !== deleteConfirmId)
      )

      setSuccessMessage('Quotation deleted successfully')
      setError('')

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to delete quotation'
      )
    } finally {
      setDeleteConfirmId(null)
    }
  }

  /*
   * Build quotation calculations only from saved quotation items.
   * No product price is hardcoded here.
   */
  const getQuotationCalculations = (quotation) => {
    const items = quotation?.items || []

    const lineItems = items.map((item) =>
      calculateLineItem(item)
    )

    return {
      totalQuantity: lineItems.reduce(
        (sum, item) => sum + item.qty,
        0
      ),

      totalGrossAmount: lineItems.reduce(
        (sum, item) => sum + item.basePriceTotal,
        0
      ),

      totalDiscount: lineItems.reduce(
        (sum, item) => sum + item.discountAmount,
        0
      ),

      totalGst: lineItems.reduce(
        (sum, item) => sum + item.gstAmount,
        0
      ),

      grandTotal: lineItems.reduce(
        (sum, item) => sum + item.lineTotal,
        0
      ),
    }
  }

  /*
   * Download the exact same quotation that is shown in preview.
   */
  const generatePDF = async () => {
    const element = document.getElementById(
      'quotation-preview'
    )

    if (!element || !viewQuotation) {
      alert('Quotation preview not found')
      return
    }

    try {
      const html2canvas = (
        await import('html2canvas')
      ).default

      const { jsPDF } = await import('jspdf')

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        logging: false,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      })

      const imgData = canvas.toDataURL('image/png')

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
        `Quotation-${
          viewQuotation.quotationNumber || 'draft'
        }.pdf`
      )
    } catch (err) {
      console.error(
        'Quotation PDF generation error:',
        err
      )

      alert(
        'Failed to generate quotation PDF. Please try again.'
      )
    }
  }

  const handlePDF = (quotation) => {
    setViewQuotation(quotation)
  }

  const handlePrint = (quotation) => {
    setViewQuotation(quotation)

    setTimeout(() => {
      window.print()
    }, 300)
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
        'Customer Name': q.customer?.name || '',
        Email: q.customer?.email || '',
        Phone: q.customer?.phone || '',
        Address:
          q.customer?.address ||
          q.address ||
          '',
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

      setSuccessMessage(
        'Quotations downloaded successfully'
      )
      setError('')
    } catch (err) {
      console.error('Excel export error:', err)

      setError('Failed to download Excel file')
      setSuccessMessage('')
    }
  }

  const getStatusBadge = (status) => {
    const configs = {
      draft: {
        bg: 'bg-surface-container/50',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        label: 'Draft',
      },

      sent: {
        bg: 'bg-secondary-fixed/20',
        text: 'text-on-secondary-fixed-variant',
        border: 'border-secondary-fixed',
        label: 'Sent',
      },

      accepted: {
        bg: 'bg-primary-fixed/20',
        text: 'text-on-primary-fixed-variant',
        border: 'border-primary-fixed',
        label: 'Accepted',
      },

      rejected: {
        bg: 'bg-error-container/20',
        text: 'text-error',
        border: 'border-error-container/30',
        label: 'Rejected',
      },

      expired: {
        bg: 'bg-surface-container/50',
        text: 'text-on-surface-variant',
        border: 'border-outline-variant',
        label: 'Expired',
      },

      converted: {
        bg: 'bg-deep-emerald/10',
        text: 'text-deep-emerald',
        border: 'border-deep-emerald/30',
        label: 'Converted to Order',
      },
    }

    const cfg =
      configs[status] || configs.draft

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}
      >
        {cfg.label}
      </span>
    )
  }

  const handleStatusChange = async (
    quotationId,
    newStatus
  ) => {
    try {
      const response =
        await quotationAPI.update(
          quotationId,
          {
            status: newStatus,
          }
        )

      if (response.data.success) {
        setQuotations((prev) =>
          prev.map((q) =>
            q._id === quotationId
              ? response.data.data
              : q
          )
        )

        setSuccessMessage(
          'Quotation status updated successfully'
        )

        setError('')

        setTimeout(
          () => setSuccessMessage(''),
          3000
        )
      } else {
        setError(
          response.data.message ||
            'Failed to update status'
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to update status'
      )
    }
  }

  const handleEditQuotation = (quotation) => {
    navigate('/admin/quotations/create', {
      state: {
        quotation,
      },
    })
  }

  const handleConvertClick = (quotation) => {
    setConvertConfirmId(
      quotation._id || quotation.id
    )
  }

  const handleConvertConfirm = async () => {
    if (!convertConfirmId) return

    const quotation = quotations.find(
      (q) =>
        (q._id || q.id) === convertConfirmId
    )

    if (!quotation) return

    try {
      const response =
        await orderAPI.convertFromQuotation(
          convertConfirmId,
          {
            paymentMethod: 'cod',
          }
        )

      if (response.data.success) {
        const order = response.data.data

        setQuotations((prev) =>
          prev.map((q) =>
            q._id === convertConfirmId
              ? {
                  ...q,
                  status: 'converted',
                  orderId: order._id,
                }
              : q
          )
        )

        setSuccessMessage(
          `Quotation ${
            quotation.quotationNumber
          } converted to order ${
            order._id
              .slice(-6)
              .toUpperCase()
          } successfully!`
        )

        setError('')

        setTimeout(
          () => setSuccessMessage(''),
          4000
        )
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to convert quotation to order'
      )
    } finally {
      setConvertConfirmId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">
            Quotations
          </h1>

          <p className="text-sm text-gray-500">
            Create, manage, and track customer quotations.
          </p>
        </div>

        <button
          onClick={handleCreateQuotation}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">
            add
          </span>

          Create Quotation
        </button>
      </div>

      {/* Messages */}
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

      {/* Search / Filter */}
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
            onChange={(e) =>
              setSearchTerm(e.target.value)
            }
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="relative min-w-[160px]">
            <select
              className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="all">
                All Statuses
              </option>

              {QUOTATION_STATUSES.map((s) => (
                <option
                  key={s.value}
                  value={s.value}
                >
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleDownloadExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-[10px] rounded hover:bg-surface-container-low transition-colors"
            title="Download Excel"
          >
            <span className="material-symbols-outlined text-sm">
              download
            </span>
            Export
          </button>
        </div>
      </div>

      {/* Quotations Table */}
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
                  <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    S.No
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    Quotation No
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    Customer Name
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    Date
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    Valid Until
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">
                    Total Amount
                  </th>

                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                    Status
                  </th>

                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {paginatedQuotations.map(
                  (quotation, index) => (
                    <tr
                      key={quotation._id}
                      className="table-row-hover bg-surface-white group"
                    >
                      <td className="py-4 pl-6 pr-4 text-on-surface-variant">
                        {(currentPage - 1) *
                          pageSize +
                          index +
                          1}
                      </td>

                      <td className="py-4 px-4 font-medium text-deep-emerald">
                        {quotation.quotationNumber}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                            {quotation.customer?.name?.charAt(
                              0
                            ) || '?'}
                          </div>

                          <span className="truncate max-w-[180px]">
                            {quotation.customer?.name ||
                              '-'}
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-on-surface text-xs whitespace-nowrap">
                        {formatDate(quotation.date)}
                      </td>

                      <td className="py-4 px-4 text-on-surface text-xs whitespace-nowrap">
                        {formatDate(
                          quotation.validUntil
                        )}
                      </td>

                      <td className="py-4 px-4 text-right font-semibold text-deep-emerald">
                        {formatCurrency(
                          quotation.totalAmount
                        )}
                      </td>

                      <td className="py-4 px-4">
                        <select
                          value={quotation.status}
                          onChange={(e) =>
                            handleStatusChange(
                              quotation._id,
                              e.target.value
                            )
                          }
                          className="appearance-none bg-surface-white border border-outline-variant rounded-md px-2 py-1.5 text-xs font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors cursor-pointer"
                        >
                          {QUOTATION_STATUSES.map(
                            (s) => (
                              <option
                                key={s.value}
                                value={s.value}
                              >
                                {s.label}
                              </option>
                            )
                          )}
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {/* View */}
                          <button
                            onClick={() =>
                              setViewQuotation(
                                quotation
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="View"
                          >
                            <span className="material-symbols-outlined text-s">
                              visibility
                            </span>
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() =>
                              handleEditQuotation(
                                quotation
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-s">
                              edit
                            </span>
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() =>
                              handleDeleteClick(
                                quotation._id
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-s">
                              delete
                            </span>
                          </button>

                          {/* PDF */}
                          <button
                            onClick={() =>
                              handlePDF(
                                quotation
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Download PDF"
                          >
                            <span className="material-symbols-outlined text-s">
                              picture_as_pdf
                            </span>
                          </button>

                          {/* Print */}
                          <button
                            onClick={() =>
                              handlePrint(
                                quotation
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Print"
                          >
                            <span className="material-symbols-outlined text-s">
                              print
                            </span>
                          </button>

                          {/* View Order */}
                          {quotation.status ===
                            'converted' &&
                            quotation.orderId && (
                              <button
                                onClick={() =>
                                  navigate(
                                    '/admin/orders'
                                  )
                                }
                                className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                                title="View Order"
                              >
                                <span className="material-symbols-outlined text-s">
                                  receipt_long
                                </span>
                              </button>
                            )}

                          {/* Convert */}
                          {quotation.status ===
                            'accepted' && (
                            <button
                              onClick={() =>
                                handleConvertClick(
                                  quotation
                                )
                              }
                              className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                              title="Convert to Order"
                            >
                              <span className="material-symbols-outlined text-s">
                                shopping_bag
                              </span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-outline-variant">
                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.max(page - 1, 1)
                    )
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 text-sm border border-outline-variant rounded disabled:opacity-40"
                >
                  Previous
                </button>

                <span className="text-sm text-on-surface-variant">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((page) =>
                      Math.min(
                        page + 1,
                        totalPages
                      )
                    )
                  }
                  disabled={
                    currentPage === totalPages
                  }
                  className="px-3 py-1.5 text-sm border border-outline-variant rounded disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shared Quotation Preview */}
      <QuotationPreviewModal
        open={Boolean(viewQuotation)}
        onClose={() => setViewQuotation(null)}
        quotationNumber={
          viewQuotation?.quotationNumber || ''
        }
        date={
          viewQuotation
            ? formatDate(viewQuotation.date)
            : ''
        }
        validUntil={
          viewQuotation
            ? formatDate(viewQuotation.validUntil)
            : ''
        }
        customer={
          viewQuotation?.customer || {}
        }
        notes={viewQuotation?.notes || ''}
        items={viewQuotation?.items || []}
        calculations={
          viewQuotation
            ? getQuotationCalculations(
                viewQuotation
              )
            : undefined
        }
        hasDiscount={
          viewQuotation
            ? hasAnyDiscount(
                viewQuotation.items || []
              )
            : false
        }
        onGeneratePDF={generatePDF}
        onPrint={() => window.print()}
      />

      {/* Convert Confirmation */}
      {convertConfirmId &&
        (() => {
          const quotation =
            quotations.find(
              (q) =>
                (q._id || q.id) ===
                convertConfirmId
            )

          if (!quotation) return null

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-surface-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="font-headline-md text-headline-md text-deep-emerald mb-2">
                  Convert to Order
                </h3>

                <p className="font-body-md text-body-md text-on-surface-variant mb-6">
                  Convert quotation{' '}
                  <span className="font-semibold text-deep-emerald">
                    {quotation.quotationNumber}
                  </span>{' '}
                  into an order? This action
                  cannot be undone.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={() =>
                      setConvertConfirmId(null)
                    }
                    className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors"
                  >
                    Cancel
                  </button>

                  <button
                    onClick={handleConvertConfirm}
                    className="px-6 py-3 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm"
                  >
                    Convert
                  </button>
                </div>
              </div>
            </div>
          )
        })()}

      {/* Delete Confirmation */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-2">
              Delete Quotation
            </h3>

            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Are you sure you want to delete
              this quotation? This action cannot
              be undone.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteConfirmId(null)
                }
                className="px-6 py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors"
              >
                Cancel
              </button>

              <button
                onClick={handleDeleteConfirm}
                className="px-6 py-3 bg-error text-surface-white text-sm font-semibold hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}