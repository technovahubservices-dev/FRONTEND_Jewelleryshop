import { useState, useEffect } from 'react'
import { supplierAPI, rawMaterialAPI } from '../../services/api'

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [viewSupplier, setViewSupplier] = useState(null)
  const [editingSupplier, setEditingSupplier] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    supplierCode: '',
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    gstNumber: '',
    materialsSupplied: [],
    paymentTerms: '',
    isActive: true,
    notes: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const [suppliersRes, materialsRes] = await Promise.all([
        supplierAPI.getAll(),
        rawMaterialAPI.getAll(),
      ])
      if (suppliersRes.data.success) {
        setSuppliers(suppliersRes.data.data || [])
      }
      if (materialsRes.data.success) {
        setRawMaterials(materialsRes.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch suppliers')
    } finally {
      setLoading(false)
    }
  }

  const handleAddClick = () => {
    setEditingSupplier(null)
    setFormData({
      supplierCode: '',
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      gstNumber: '',
      materialsSupplied: [],
      paymentTerms: '',
      isActive: true,
      notes: '',
    })
    setShowModal(true)
  }

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier)
    setFormData({
      supplierCode: supplier.supplierCode || '',
      name: supplier.name || '',
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      phone: supplier.phone || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      pincode: supplier.pincode || '',
      gstNumber: supplier.gstNumber || '',
      materialsSupplied: supplier.materialsSupplied?.map(m => m._id || m) || [],
      paymentTerms: supplier.paymentTerms || '',
      isActive: supplier.isActive !== undefined ? supplier.isActive : true,
      notes: supplier.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        ...formData,
        materialsSupplied: formData.materialsSupplied,
      }

      if (editingSupplier) {
        const response = await supplierAPI.update(editingSupplier._id, payload)
        if (response.data.success) {
          setSuccessMessage('Supplier updated successfully')
          setShowModal(false)
          fetchInitialData()
          setTimeout(() => setSuccessMessage(''), 3000)
        }
      } else {
        const response = await supplierAPI.create(payload)
        if (response.data.success) {
          setSuccessMessage('Supplier created successfully')
          setShowModal(false)
          fetchInitialData()
          setTimeout(() => setSuccessMessage(''), 3000)
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save supplier')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return
    try {
      await supplierAPI.delete(id)
      setSuccessMessage('Supplier deleted successfully')
      setError('')
      setSuppliers(suppliers.filter(s => s._id !== id))
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete supplier')
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    return (
      supplier.name?.toLowerCase().includes(term) ||
      supplier.supplierCode?.toLowerCase().includes(term) ||
      supplier.contactPerson?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term) ||
      supplier.phone?.toLowerCase().includes(term)
    )
  }).filter(supplier => {
    if (statusFilter === 'all') return true
    return statusFilter === 'active' ? supplier.isActive : !supplier.isActive
  })

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

  const getStatusBadge = (isActive) => {
    if (isActive) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed-dim/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">
          <span className="w-1.5 h-1.5 rounded-full bg-deep-emerald"></span>
          Active
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-error-container/20 text-error border border-error-container/30">
        <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
        Inactive
      </span>
    )
  }

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="w-full space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Suppliers</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage supplier information, contact details, and purchase history.</p>
          </div>
          <button
            onClick={handleAddClick}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Supplier
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

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search suppliers..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[140px]">
              <select
                className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading suppliers...
              </p>
            </div>
          ) : filteredSuppliers.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                local_shipping
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                No suppliers found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Supplier</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Contact Person</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Email</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Phone</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Materials</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Total Purchase</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Pending Payment</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredSuppliers.map((supplier) => (
                    <tr key={supplier._id} className="table-row-hover bg-surface-white group">
                      <td className="py-4 pl-6 pr-4">
                        <div>
                          <p className="font-semibold text-deep-emerald">{supplier.name}</p>
                          <p className="text-xs text-on-surface-variant">{supplier.supplierCode}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">{supplier.contactPerson || '-'}</td>
                      <td className="py-4 px-4 text-xs">{supplier.email || '-'}</td>
                      <td className="py-4 px-4 text-xs">{supplier.phone || '-'}</td>
                      <td className="py-4 px-4">
                        <span className="text-xs bg-surface-container-low px-2 py-1 rounded border border-outline-variant/30">
                          {supplier.materialsSupplied?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right font-semibold text-deep-emerald">
                        {formatPrice(supplier.totalPurchaseAmount)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={supplier.pendingPayment > 0 ? 'text-error font-semibold' : 'text-deep-emerald'}>
                          {formatPrice(supplier.pendingPayment)}
                        </span>
                      </td>
                      <td className="py-4 px-4">{getStatusBadge(supplier.isActive)}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setViewSupplier(supplier)}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="View Details"
                          >
                            <span className="material-symbols-outlined text-s">visibility</span>
                          </button>
                          <button
                            onClick={() => handleEditClick(supplier)}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-s">Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(supplier._id)}
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-s">Delete</span>
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
      </div>

      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                {editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Supplier Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Enter supplier name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Enter contact person name"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Enter email address"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Address
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                  placeholder="Enter full address"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="City"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="State"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Pincode"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    GST Number
                  </label>
                  <input
                    type="text"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="GST Number"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Payment Terms
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="e.g., Net 30 days"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Materials Supplied
                </label>
                <select
                  multiple
                  value={formData.materialsSupplied}
                  onChange={(e) => {
                    const selected = Array.from(e.target.options).filter(opt => opt.selected).map(opt => opt.value)
                    setFormData({ ...formData, materialsSupplied: selected })
                  }}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none h-32"
                >
                  {rawMaterials.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.materialCode})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-on-surface-variant mt-1">Hold Ctrl/Cmd to select multiple materials</p>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                  placeholder="Optional notes"
                ></textarea>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
                />
                <label htmlFor="isActive" className="font-body-md text-on-surface">
                  Active Supplier
                </label>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                disabled={submitting}
                className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  'Save Supplier'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {viewSupplier && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setViewSupplier(null)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div>
                <h2 className="font-headline-md text-headline-md text-deep-emerald">
                  {viewSupplier.name}
                </h2>
                <p className="text-xs text-on-surface-variant mt-1">{viewSupplier.supplierCode}</p>
              </div>
              <button
                onClick={() => setViewSupplier(null)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Contact Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Contact Person</p>
                      <p className="font-medium text-deep-emerald">{viewSupplier.contactPerson || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Email</p>
                      <p className="font-medium text-deep-emerald">{viewSupplier.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Phone</p>
                      <p className="font-medium text-deep-emerald">{viewSupplier.phone || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Address</p>
                      <p className="font-medium text-deep-emerald">
                        {viewSupplier.address || '-'}
                        {viewSupplier.city && <span>, {viewSupplier.city}</span>}
                        {viewSupplier.state && <span>, {viewSupplier.state}</span>}
                        {viewSupplier.pincode && <span> - {viewSupplier.pincode}</span>}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">GST Number</p>
                      <p className="font-medium text-deep-emerald">{viewSupplier.gstNumber || '-'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Financial Details</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <p className="text-xs text-on-surface-variant">Total Purchase Amount</p>
                      <p className="font-semibold text-deep-emerald">{formatPrice(viewSupplier.totalPurchaseAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Pending Payment</p>
                      <p className={`font-semibold ${viewSupplier.pendingPayment > 0 ? 'text-error' : 'text-deep-emerald'}`}>
                        {formatPrice(viewSupplier.pendingPayment)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Payment Terms</p>
                      <p className="font-medium text-deep-emerald">{viewSupplier.paymentTerms || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-on-surface-variant">Status</p>
                      {getStatusBadge(viewSupplier.isActive)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                <h3 className="font-label-caps text-xs text-on-surface-variant mb-3 uppercase tracking-wider">Materials Supplied</h3>
                {viewSupplier.materialsSupplied && viewSupplier.materialsSupplied.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {viewSupplier.materialsSupplied.map((material) => (
                      <div key={material._id} className="flex items-center justify-between p-3 bg-surface-container-low rounded border border-outline-variant/30">
                        <div>
                          <p className="text-sm font-medium text-deep-emerald">{material.name}</p>
                          <p className="text-xs text-on-surface-variant">{material.materialCode}</p>
                        </div>
                        <span className="text-xs text-on-surface-variant">{material.unit}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-on-surface-variant">No materials supplied yet</p>
                )}
              </div>

              {viewSupplier.notes && (
                <div className="bg-surface-white border border-outline-variant rounded-lg p-4">
                  <h3 className="font-label-caps text-xs text-on-surface-variant mb-2 uppercase tracking-wider">Notes</h3>
                  <p className="text-sm text-on-surface">{viewSupplier.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
              <button
                onClick={() => {
                  setViewSupplier(null)
                  handleEditClick(viewSupplier)
                }}
                className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
              >
                Edit Supplier
              </button>
              <button
                onClick={() => setViewSupplier(null)}
                className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
