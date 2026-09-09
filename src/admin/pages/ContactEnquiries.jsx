import { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { contactAPI } from '../../services/api'
import { resolveImageUrl } from '../../utils/apiUrl'
import { formatDateTime, formatDate } from '../../utils/formatters'

const CONTACT_STATUSES = [
  { value: 'new', label: 'New', color: 'bg-secondary-fixed/20', dot: 'bg-outline' },
  { value: 'read', label: 'Read', color: 'bg-primary-fixed-dim/20', dot: 'bg-deep-emerald' },
  { value: 'replied', label: 'Replied', color: 'bg-primary-fixed/20', dot: 'bg-deep-emerald' },
  { value: 'archived', label: 'Archived', color: 'bg-surface-container/50', dot: 'bg-outline' },
]

const STATUS_COLORS = {
  new: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
  read: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
  replied: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
  archived: { bg: 'bg-surface-container-low/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
}

export default function ContactEnquiries() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [enquiries, setEnquiries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [stats, setStats] = useState({})
  const [statuses, setStatuses] = useState([])
  const [viewEnquiry, setViewEnquiry] = useState(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [replying, setReplying] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const currentPage = Number(searchParams.get('page') || 1)
  const currentSearch = searchParams.get('search') || ''
  const currentStatus = searchParams.get('status') || 'all'
  const currentStartDate = searchParams.get('startDate') || ''
  const currentEndDate = searchParams.get('endDate') || ''

  const itemsPerPage = 20

  const fetchEnquiries = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
      }
      if (currentSearch) params.search = currentSearch
      if (currentStatus !== 'all') params.status = currentStatus
      if (currentStartDate) params.startDate = currentStartDate
      if (currentEndDate) params.endDate = currentEndDate

      const response = await contactAPI.getAll(params)
      if (response.data.success) {
        setEnquiries(response.data.data || [])
        setTotal(response.data.total || 0)
        setPages(response.data.pages || 1)
        setStats(response.data.stats || {})
      } else {
        setError(response.data.message || 'Failed to fetch enquiries')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch enquiries')
    } finally {
      setLoading(false)
    }
  }

  const fetchStatuses = async () => {
    try {
      const response = await contactAPI.getStatuses()
      if (response.data.success) {
        setStatuses(response.data.data || CONTACT_STATUSES)
      }
    } catch {
    }
  }

  useEffect(() => {
    fetchEnquiries()
  }, [currentPage, currentSearch, currentStatus, currentStartDate, currentEndDate])

  useEffect(() => {
    fetchStatuses()
  }, [])

  const handleSearch = (e) => {
    const value = e.target.value
    const newParams = {}
    if (value) newParams.search = value
    if (currentStatus !== 'all') newParams.status = currentStatus
    if (currentStartDate) newParams.startDate = currentStartDate
    if (currentEndDate) newParams.endDate = currentEndDate
    newParams.page = 1
    setSearchParams(newParams)
  }

  const handleStatusFilter = (status) => {
    const newParams = {}
    if (currentSearch) newParams.search = currentSearch
    if (status !== 'all') newParams.status = status
    if (currentStartDate) newParams.startDate = currentStartDate
    if (currentEndDate) newParams.endDate = currentEndDate
    newParams.page = 1
    setSearchParams(newParams)
  }

  const handlePageChange = (page) => {
    const newParams = {}
    if (currentSearch) newParams.search = currentSearch
    if (currentStatus !== 'all') newParams.status = currentStatus
    if (currentStartDate) newParams.startDate = currentStartDate
    if (currentEndDate) newParams.endDate = currentEndDate
    newParams.page = page
    setSearchParams(newParams)
  }

  const handleDateFilter = (e) => {
    const { name, value } = e.target
    const newParams = {}
    if (currentSearch) newParams.search = currentSearch
    if (currentStatus !== 'all') newParams.status = currentStatus
    if (currentStartDate) newParams.startDate = currentStartDate
    if (currentEndDate) newParams.endDate = currentEndDate
    newParams.page = 1
    newParams[name] = value
    setSearchParams(newParams)
  }

  const clearDateFilter = () => {
    const newParams = {}
    if (currentSearch) newParams.search = currentSearch
    if (currentStatus !== 'all') newParams.status = currentStatus
    newParams.page = 1
    setSearchParams(newParams)
  }

  const handleViewEnquiry = (enquiry) => {
    setViewEnquiry(enquiry)
    setReplyMessage('')
  }

  const handleStatusUpdate = async (status) => {
    if (!viewEnquiry) return
    try {
      const response = await contactAPI.updateStatus(viewEnquiry._id, { status })
      if (response.data.success) {
        setViewEnquiry(response.data.data)
        setEnquiries(enquiries.map(e => e._id === viewEnquiry._id ? response.data.data : e))
        setSuccessMessage('Status updated successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    }
  }

  const handleReply = async () => {
    if (!viewEnquiry || !replyMessage.trim()) return
    setReplying(true)
    setError('')
    try {
      const response = await contactAPI.reply(viewEnquiry._id, {
        replyMessage,
        subject: `Re: Your enquiry on ${(process.env.STORE_NAME || 'Jewellery Shop')}`,
      })
      if (response.data.success) {
        setViewEnquiry(response.data.data)
        setEnquiries(enquiries.map(e => e._id === viewEnquiry._id ? response.data.data : e))
        setSuccessMessage('Reply sent successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
        setReplyMessage('')
      } else {
        setError(response.data.message || 'Failed to send reply')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reply')
    } finally {
      setReplying(false)
    }
  }

  const getStatusBadge = (status) => {
    const cfg = STATUS_COLORS[status] || STATUS_COLORS.new
    const label = (statuses.find(s => s.value === status)?.label) ||
      (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} border border-outline-variant/20`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {label}
      </span>
    )
  }

  const hasActiveFilters = currentSearch || currentStatus !== 'all' || currentStartDate || currentEndDate

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Contact Us Enquiries</h1>
        <p className="text-sm text-gray-500">Manage customer contact enquiries and respond to their questions.</p>
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

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
            search
          </span>
          <input
            className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
            placeholder="Search by name, email, phone, or message..."
            type="text"
             value={currentSearch}
             onChange={handleSearch}
           />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[160px]">
            <select
              className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
              value={currentStatus}
              onChange={(e) => handleStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              {CONTACT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>

          <input
            type="date"
            name="startDate"
            className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface bg-surface-white"
            value={currentStartDate}
            onChange={handleDateFilter}
          />
          <input
            type="date"
            name="endDate"
            className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface bg-surface-white"
            value={currentEndDate}
            onChange={handleDateFilter}
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => setSearchParams({})}
              className="px-3 py-1.5 text-xs font-label-caps text-on-surface-variant hover:text-deep-emerald bg-surface-container-low rounded transition-colors"
            >
              Clear Filters
            </button>
          )}

          <div className="ml-auto flex items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-on-surface-variant">
              {CONTACT_STATUSES.map((s) => (
                <span key={s.value} className="flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${s.dot}`}></span>
                  {s.label}: {stats[s.value] || 0}
                </span>
              ))}
            </div>
            <button
              onClick={fetchEnquiries}
              className="px-4 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-xs rounded hover:bg-surface-container-low transition-colors"
              title="Refresh"
            >
              <span className="material-symbols-outlined text-sm">refresh</span>
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
              Loading enquiries...
            </p>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">
              mail
            </span>
            <p className="font-body-md text-sm text-on-surface-variant">
              No customer enquiries yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Name</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Email</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Phone</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Message</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Received</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Delivery</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry._id} className="table-row-hover bg-surface-white group">
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                          {(enquiry.name || '?').charAt(0)}
                        </div>
                        <span className={`font-medium ${enquiry.isRead ? 'text-on-surface' : 'text-deep-emerald'}`}>{enquiry.name || '-'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-on-surface">{enquiry.email || '-'}</td>
                    <td className="py-4 px-4 text-on-surface">{enquiry.phone || '-'}</td>
                    <td className="py-4 px-4 text-on-surface-variant max-w-[200px] truncate" title={enquiry.message}>
                      {enquiry.message || '-'}
                    </td>
                    <td className="py-4 px-4 text-on-surface-variant whitespace-nowrap">
                      {formatDateTime(enquiry.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-label-caps ${enquiry.delivered ? 'bg-primary-fixed/20 text-on-primary-fixed-variant' : 'bg-error-container/20 text-error'}`}>
                        {enquiry.delivered ? 'Delivered' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(enquiry.status)}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewEnquiry(enquiry)}
                          className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                          title="View Details"
                        >
                          <span className="material-symbols-outlined text-sm">visibility</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-gray-100 shadow-sm">
          <div className="text-sm text-on-surface-variant">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, total)} of {total} enquiries
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage <= 1 || loading}
              className="px-3 py-1.5 text-xs font-label-caps text-on-surface-variant hover:text-deep-emerald bg-surface-container-low rounded disabled:opacity-50 transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, pages) }, (_, i) => {
              const pageNum = i + 1
              if (pageNum === currentPage) {
                return (
                  <span key={pageNum} className="px-3 py-1.5 bg-deep-emerald text-surface-white text-xs rounded font-label-caps">
                    {pageNum}
                  </span>
                )
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className="px-3 py-1.5 text-xs font-label-caps text-on-surface-variant hover:text-deep-emerald bg-surface-container-low rounded transition-colors"
                >
                  {pageNum}
                </button>
              )
            })}
            <button
              onClick={() => handlePageChange(Math.min(pages, currentPage + 1))}
              disabled={currentPage >= pages || loading}
              className="px-3 py-1.5 text-xs font-label-caps text-on-surface-variant hover:text-deep-emerald bg-surface-container-low rounded disabled:opacity-50 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {viewEnquiry && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setViewEnquiry(null)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div>
                <h2 className="font-headline-md text-headline-md text-deep-emerald">
                  Enquiry from {viewEnquiry.name}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">
                  Received on {formatDateTime(viewEnquiry.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(viewEnquiry.status)}
                <button
                  onClick={() => setViewEnquiry(null)}
                  className="text-on-surface-variant hover:text-deep-emerald transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Contact Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Name</p>
                      <p className="font-medium text-deep-emerald">{viewEnquiry.name || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Email</p>
                      <p className="font-medium text-deep-emerald">{viewEnquiry.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Phone</p>
                      <p className="font-medium text-deep-emerald">{viewEnquiry.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Delivery Information</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Status</p>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${viewEnquiry.delivered ? 'bg-primary-fixed/20 text-on-primary-fixed-variant' : 'bg-error-container/20 text-error'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${viewEnquiry.delivered ? 'bg-deep-emerald' : 'bg-error'}`}></span>
                        {viewEnquiry.delivered ? 'Delivered' : 'Failed'}
                      </span>
                    </div>
                    {viewEnquiry.deliveryError && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Error</p>
                        <p className="font-medium text-error text-xs break-words">{viewEnquiry.deliveryError}</p>
                      </div>
                    )}
                    {viewEnquiry.routedTo && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Routed To</p>
                        <p className="font-medium text-deep-emerald">{viewEnquiry.routedTo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Full Message</h3>
                <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap break-words">
                  {viewEnquiry.message || 'No message content'}
                </p>
              </div>

              {viewEnquiry.adminNote && (
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Admin Note</h3>
                  <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">
                    {viewEnquiry.adminNote}
                  </p>
                </div>
              )}

              <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Update Status</h3>
                <div className="flex flex-wrap items-center gap-3">
                  {CONTACT_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => handleStatusUpdate(s.value)}
                      className={`px-3 py-1.5 text-xs font-label-caps rounded transition-colors ${
                        viewEnquiry.status === s.value
                          ? 'bg-deep-emerald text-surface-white'
                          : 'bg-surface-container-low text-on-surface-variant hover:text-deep-emerald'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Send Reply</h3>
                <textarea
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface resize-none"
                  rows="4"
                  placeholder="Type your reply message here..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                />
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleReply}
                    disabled={replying || !replyMessage.trim()}
                    className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {replying ? (
                      <>
                        <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                        Sending...
                      </>
                    ) : (
                      'Send Reply'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
