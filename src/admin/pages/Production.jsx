import { useState, useEffect } from 'react'
import { productionAPI, productAPI, rawMaterialAPI } from '../../services/api'

const STATUS_OPTIONS = [
  { value: 'planned', label: 'Planned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const UNIT_SYMBOLS = {
  grams: 'g',
  kg: 'kg',
  pieces: 'pcs',
  liters: 'L',
  ml: 'ml',
  meters: 'm',
  cm: 'cm',
  mm: 'mm',
}

export default function Production() {
  const [productions, setProductions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduction, setEditingProduction] = useState(null)
  const [formData, setFormData] = useState({
    product: '',
    quantity: '1',
    productionDate: new Date().toISOString().split('T')[0],
    rawMaterials: [{ rawMaterial: '', quantity: '', cost: '' }],
    totalMaterialCost: '',
    laborCost: '',
    otherCost: '',
    status: 'planned',
    notes: '',
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)
  const [products, setProducts] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [formLoading, setFormLoading] = useState(false)

  useEffect(() => {
    fetchProductions()
    fetchProducts()
    fetchRawMaterials()
  }, [])

  const fetchProductions = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await productionAPI.getAll()
      if (response.data.success) {
        setProductions(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch production records')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch production records')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await productAPI.getAll()
      if (response.data.success) {
        setProducts(response.data.data || [])
      }
    } catch (err) {
      // Silently fail — product dropdown will be empty
    }
  }

  const fetchRawMaterials = async () => {
    try {
      const response = await rawMaterialAPI.getAll()
      if (response.data.success) {
        setRawMaterials((response.data.data || []).filter((m) => m.isActive))
      }
    } catch (err) {
      // Silently fail — raw material dropdown will be empty
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleRawMaterialChange = (index, field, value) => {
    const newRawMaterials = [...formData.rawMaterials]
    newRawMaterials[index] = { ...newRawMaterials[index], [field]: value }
    setFormData((prev) => ({
      ...prev,
      rawMaterials: newRawMaterials,
    }))
  }

  const addRawMaterialRow = () => {
    setFormData((prev) => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { rawMaterial: '', quantity: '', cost: '' }],
    }))
  }

  const removeRawMaterialRow = (index) => {
    if (formData.rawMaterials.length <= 1) return
    const newRawMaterials = formData.rawMaterials.filter((_, i) => i !== index)
    setFormData((prev) => ({
      ...prev,
      rawMaterials: newRawMaterials,
    }))
  }

  const openCreateModal = () => {
    setEditingProduction(null)
    setFormData({
      product: '',
      quantity: '1',
      productionDate: new Date().toISOString().split('T')[0],
      rawMaterials: [{ rawMaterial: '', quantity: '', cost: '' }],
      totalMaterialCost: '',
      laborCost: '',
      otherCost: '',
      status: 'planned',
      notes: '',
    })
    setIsModalOpen(true)
    setError('')
  }

  const openEditModal = (production) => {
    setEditingProduction(production)
    setFormData({
      product: production.product?._id || production.product || '',
      quantity: production.quantity !== undefined ? String(production.quantity) : '1',
      productionDate: production.productionDate
        ? new Date(production.productionDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      rawMaterials:
        production.rawMaterials && production.rawMaterials.length > 0
          ? production.rawMaterials.map((rm) => ({
              rawMaterial: rm.rawMaterial?._id || rm.rawMaterial || '',
              quantity: rm.quantity !== undefined ? String(rm.quantity) : '',
              cost: rm.cost !== undefined ? String(rm.cost) : '',
            }))
          : [{ rawMaterial: '', quantity: '', cost: '' }],
      totalMaterialCost: production.totalMaterialCost !== undefined ? String(production.totalMaterialCost) : '',
      laborCost: production.laborCost !== undefined ? String(production.laborCost) : '',
      otherCost: production.otherCost !== undefined ? String(production.otherCost) : '',
      status: production.status || 'planned',
      notes: production.notes || '',
    })
    setIsModalOpen(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.product) {
      setError('Product selection is required')
      return
    }
    if (!formData.quantity || Number(formData.quantity) < 1) {
      setError('Quantity must be at least 1')
      return
    }

    setFormLoading(true)
    setError('')

    try {
      const payload = {
        product: formData.product,
        quantity: Number(formData.quantity),
        productionDate: formData.productionDate,
        rawMaterials: formData.rawMaterials
          .filter((rm) => rm.rawMaterial && rm.quantity && Number(rm.quantity) > 0)
          .map((rm) => ({
            rawMaterial: rm.rawMaterial,
            quantity: Number(rm.quantity),
            cost: rm.cost !== '' && rm.cost !== undefined ? Number(rm.cost) : 0,
          })),
        totalMaterialCost: formData.totalMaterialCost !== '' && formData.totalMaterialCost !== undefined
          ? Number(formData.totalMaterialCost)
          : undefined,
        laborCost: formData.laborCost !== '' && formData.laborCost !== undefined
          ? Number(formData.laborCost)
          : 0,
        otherCost: formData.otherCost !== '' && formData.otherCost !== undefined
          ? Number(formData.otherCost)
          : 0,
        status: formData.status,
        notes: formData.notes,
      }

      if (editingProduction) {
        await productionAPI.update(editingProduction._id || editingProduction.id, payload)
        setSuccessMessage('Production record updated successfully')
      } else {
        await productionAPI.create(payload)
        setSuccessMessage('Production record created successfully')
      }
      setIsModalOpen(false)
      setEditingProduction(null)
      fetchProductions()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save production record')
      setSuccessMessage('')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await productionAPI.delete(deleteConfirmId)
      setSuccessMessage('Production record deleted successfully')
      setError('')
      fetchProductions()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete production record')
      setSuccessMessage('')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

  const filteredProductions = productions.filter(
    (p) =>
      p.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.status?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusLabel = (status) => {
    const option = STATUS_OPTIONS.find((s) => s.value === status)
    return option ? option.label : status || 'Unknown'
  }

  const getStatusBadge = (status) => {
    const configs = {
      planned: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', border: 'border-outline-variant/20', dot: 'bg-outline' },
      in_progress: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', border: 'border-secondary-fixed/30', dot: 'bg-regal-gold' },
      completed: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', border: 'border-primary-fixed-dim/30', dot: 'bg-deep-emerald' },
      cancelled: { bg: 'bg-error-container/20', text: 'text-error', border: 'border-error-container/30', dot: 'bg-error' },
    }
    const cfg = configs[status] || configs.planned
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} ${cfg.border} border`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {getStatusLabel(status)}
      </span>
    )
  }

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Production Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Track production runs, raw material usage, and costs.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Production Record
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
              placeholder="Search by product, notes, or status..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { fetchProductions(); setSearchTerm('') }}
            className="px-4 py-2 text-on-surface-variant hover:text-deep-emerald border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading production records...
              </p>
            </div>
          ) : filteredProductions.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                factory
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                {searchTerm
                  ? 'No production records match your search'
                  : 'No production records found. Click "Add Production Record" to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Product</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">SKU</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Qty</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Materials</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Cost</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Status</th>
                      <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                    {filteredProductions.map((prod) => (
                      <tr key={prod._id} className="table-row-hover bg-surface-white group">
                        <td className="py-4 px-4">
                          <span className="font-medium text-deep-emerald">{prod.product?.name || 'N/A'}</span>
                        </td>
                        <td className="py-4 px-4 text-on-surface-variant font-mono">{prod.product?.sku || '-'}</td>
                        <td className="py-4 px-4 text-center text-on-surface">{prod.quantity}</td>
                        <td className="py-4 px-4 text-on-surface-variant">{formatDate(prod.productionDate)}</td>
                        <td className="py-4 px-4 text-on-surface-variant">
                          {prod.rawMaterials && prod.rawMaterials.length > 0
                            ? `${prod.rawMaterials.length} material(s)`
                            : 'None specified'}
                        </td>
                         <td className="py-4 px-4 text-right font-semibold text-deep-emerald">{formatPrice((prod.totalMaterialCost || 0) + (prod.laborCost || 0) + (prod.otherCost || 0))}</td>
                        <td className="py-4 px-4 text-center">{getStatusBadge(prod.status)}</td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(prod)}
                              className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(prod._id)}
                              className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                              title="Delete"
                            >
                              <span className="material-symbols-outlined">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant flex items-center justify-between">
                <span className="text-xs font-body-md text-on-surface-variant">
                  Showing 1 to {filteredProductions.length} of {filteredProductions.length} entries
                </span>
                <span className="text-xs font-body-md text-on-surface-variant">
                  Total Cost: {formatPrice(filteredProductions.reduce((sum, p) => sum + (p.totalCost || 0), 0))}
                </span>
              </div>
            </>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-3xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                {editingProduction ? 'Edit Production Record' : 'Add New Production Record'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
              {error && (
                <div className="p-3 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Product *
                </label>
                <select
                  name="product"
                  value={formData.product}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                  required
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.name} ({p.sku || 'No SKU'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="1"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Production Date *
                  </label>
                  <input
                    type="date"
                    name="productionDate"
                    value={formData.productionDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block font-label-caps text-xs text-on-surface-variant">
                    Raw Material Usage
                  </label>
                  <button
                    type="button"
                    onClick={addRawMaterialRow}
                    className="text-deep-emerald hover:text-regal-gold text-xs font-medium"
                  >
                    + Add Material
                  </button>
                </div>
                <div className="space-y-3">
                  {formData.rawMaterials.map((rm, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div>
                        <select
                          value={rm.rawMaterial}
                          onChange={(e) => handleRawMaterialChange(index, 'rawMaterial', e.target.value)}
                          className="w-full px-4 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                          required
                        >
                          <option value="">Select Material</option>
                          {rawMaterials.map((mat) => (
                            <option key={mat._id} value={mat._id}>
                              {mat.materialCode} - {mat.name} ({UNIT_SYMBOLS[mat.unit] || mat.unit})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <input
                          type="number"
                          value={rm.quantity}
                          onChange={(e) => handleRawMaterialChange(index, 'quantity', e.target.value)}
                          className="w-full px-4 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                          placeholder="Qty"
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          value={rm.cost}
                          onChange={(e) => handleRawMaterialChange(index, 'cost', e.target.value)}
                          className="w-full px-4 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                          placeholder="Cost (₹)"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        {formData.rawMaterials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeRawMaterialRow(index)}
                            className="w-full px-3 py-2 text-error hover:bg-error/10 border border-error/20 rounded text-sm font-body-md"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Total Material Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="totalMaterialCost"
                    value={formData.totalMaterialCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Labor Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="laborCost"
                    value={formData.laborCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Other Cost (₹)
                  </label>
                  <input
                    type="number"
                    name="otherCost"
                    value={formData.otherCost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                  placeholder="Enter production notes (optional)"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Production Record'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteConfirmId && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setDeleteConfirmId(null)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">
              Confirm Delete
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Are you sure you want to delete this production record? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 bg-error text-surface-white font-label-caps text-label-caps rounded hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
