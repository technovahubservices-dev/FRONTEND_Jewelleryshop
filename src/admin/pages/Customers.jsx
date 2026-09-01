import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { userAPI } from '../../services/api'
import { exportToExcel } from '../../utils/excelExport'

export default function Customers() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    if (!isAdmin) {
      navigate('/login')
      return
    }
    fetchCustomers()
  }, [isAdmin, navigate])

  const fetchCustomers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await userAPI.getAll()
      if (response.data.success) {
        setCustomers(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch customers')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers')
    } finally {
      setLoading(false)
    }
  }

  const filteredCustomers = customers.filter((customer) => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      customer.name?.toLowerCase().includes(term) ||
      customer.email?.toLowerCase().includes(term) ||
      customer.phone?.toLowerCase().includes(term)
    )
  })

  const handleDownloadExcel = () => {
    if (!filteredCustomers.length) {
      setError('No customers available to export')
      setSuccessMessage('')
      return
    }

    try {
      const exportData = filteredCustomers.map((customer) => ({
        Name: customer.name || '',
        Email: customer.email || '',
        Phone: customer.phone || '',
        'Default Address': customer.addresses?.find((a) => a.isDefault)?.address || '',
        City: customer.addresses?.find((a) => a.isDefault)?.city || '',
        State: customer.addresses?.find((a) => a.isDefault)?.state || '',
        Pincode: customer.addresses?.find((a) => a.isDefault)?.pincode || '',
        'Joined Date': new Date(customer.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
      }))

      exportToExcel({
        data: exportData,
        columns: [
          { wch: 25 },
          { wch: 35 },
          { wch: 18 },
          { wch: 40 },
          { wch: 20 },
          { wch: 20 },
          { wch: 12 },
          { wch: 20 },
        ],
        sheetName: 'Customers',
        filename: 'customers.xlsx',
      })

      setSuccessMessage('Customers downloaded successfully')
      setError('')
    } catch (err) {
      console.error('Excel export error:', err)
      setError('Failed to download Excel file')
      setSuccessMessage('')
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Customers</h1>
          <p className="text-sm text-gray-500">Manage customer information and view order history.</p>
        </div>
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

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <div className="relative w-full sm:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search by name, email, or phone..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
              progress_activity
            </span>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">
              Loading customers...
            </p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              person
            </span>
            <p className="font-body-md text-sm text-on-surface-variant">
              No customers found.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Name</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Email</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Phone</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Address</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">City</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">State</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {filteredCustomers.map((customer) => {
                  const defaultAddress = customer.addresses?.find((a) => a.isDefault) || customer.addresses?.[0]
                  return (
                    <tr key={customer._id} className="table-row-hover bg-surface-white">
                      <td className="py-4 pl-6 pr-4 font-medium text-deep-emerald">
                        {customer.name || '-'}
                      </td>
                      <td className="py-4 px-4 text-on-surface">{customer.email || '-'}</td>
                      <td className="py-4 px-4 text-on-surface">{customer.phone || '-'}</td>
                      <td className="py-4 px-4 text-on-surface">{defaultAddress?.address || '-'}</td>
                      <td className="py-4 px-4 text-on-surface">{defaultAddress?.city || '-'}</td>
                      <td className="py-4 px-4 text-on-surface">{defaultAddress?.state || '-'}</td>
                      <td className="py-4 px-6 text-on-surface text-xs whitespace-nowrap">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
