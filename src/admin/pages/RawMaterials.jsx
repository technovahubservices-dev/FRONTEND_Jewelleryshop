import { useState, useEffect } from 'react'
import { rawMaterialAPI } from '../../services/api'

export default function RawMaterials() {
  const [rawMaterials, setRawMaterials] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState(null)
  const [formData, setFormData] = useState({
    materialCode: '',
    itemCode: '',
    name: '',
    quantity: '',
    unit: 'grams',
    cost: '',
    isActive: true,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    fetchRawMaterials()
  }, [])

  const fetchRawMaterials = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await rawMaterialAPI.getAll()
      if (response.data.success) {
        setRawMaterials(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch raw materials')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch raw materials')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const openCreateModal = () => {
    setEditingMaterial(null)
    setFormData({
      materialCode: '',
      itemCode: '',
      name: '',
      quantity: '',
      unit: 'grams',
      cost: '',
      isActive: true,
    })
    setIsModalOpen(true)
    setError('')
  }

  const openEditModal = (material) => {
    setEditingMaterial(material)
    setFormData({
      materialCode: material.materialCode || '',
      itemCode: material.itemCode || '',
      name: material.name || '',
      quantity: material.quantity !== undefined ? String(material.quantity) : '',
      unit: material.unit || 'grams',
      cost: material.cost !== undefined ? String(material.cost) : '',
      isActive: material.isActive !== undefined ? material.isActive : true,
    })
    setIsModalOpen(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.materialCode.trim()) {
      setError('Material code is required')
      return
    }
    if (!formData.name.trim()) {
      setError('Material name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const payload = {
        materialCode: formData.materialCode.trim(),
        itemCode: formData.itemCode.trim(),
        name: formData.name.trim(),
        quantity: formData.quantity !== '' && formData.quantity !== null && formData.quantity !== undefined ? Number(formData.quantity) : 0,
        unit: formData.unit,
        cost: formData.cost !== '' && formData.cost !== null && formData.cost !== undefined ? Number(formData.cost) : 0,
        isActive: formData.isActive,
      }

      if (editingMaterial) {
        await rawMaterialAPI.update(editingMaterial._id || editingMaterial.id, payload)
        setSuccessMessage('Raw material updated successfully')
      } else {
        await rawMaterialAPI.create(payload)
        setSuccessMessage('Raw material created successfully')
      }
      setIsModalOpen(false)
      setEditingMaterial(null)
      setFormData({
        materialCode: '',
        itemCode: '',
        name: '',
        quantity: '',
        unit: 'grams',
        cost: '',
        isActive: true,
      })
      fetchRawMaterials()
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save raw material')
      setSuccessMessage('')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (id) => {
    setDeleteConfirmId(id)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return
    try {
      await rawMaterialAPI.delete(deleteConfirmId)
      setSuccessMessage('Raw material deleted successfully')
      setError('')
      setTimeout(() => setSuccessMessage(''), 4000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete raw material')
      setSuccessMessage('')
    } finally {
      setDeleteConfirmId(null)
      fetchRawMaterials()
    }
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

  const filteredMaterials = rawMaterials.filter(
    (m) =>
      m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.materialCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.itemCode?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getUnitSymbol = (unit) => {
    const symbols = {
      grams: 'g',
      kg: 'kg',
      pieces: 'pcs',
      liters: 'L',
      ml: 'ml',
      meters: 'm',
      cm: 'cm',
      mm: 'mm',
    }
    return symbols[unit] || unit
  }

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Raw Materials</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your raw material inventory, stock levels, and costs.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Material
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
              placeholder="Search by name, material code, or item code..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { fetchRawMaterials(); setSearchTerm('') }}
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
                Loading raw materials...
              </p>
            </div>
          ) : filteredMaterials.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                inventory_2
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                {searchTerm
                  ? 'No raw materials match your search'
                  : 'No raw materials found. Click "Add New Material" to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Material Code</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Item Code</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Name</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Stock</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Unit</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Cost</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Status</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Created</th>
                      <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                    {filteredMaterials.map((material) => (
                      <tr key={material._id} className="table-row-hover bg-surface-white group">
                        <td className="py-4 px-4">
                          <span className="font-medium text-deep-emerald font-mono">{material.materialCode}</span>
                        </td>
                        <td className="py-4 px-4 text-on-surface-variant">
                          {material.itemCode || '-'}
                        </td>
                        <td className="py-4 px-4">
                          <span className="font-medium text-deep-emerald">{material.name}</span>
                        </td>
                        <td className="py-4 px-4 text-center font-semibold text-on-surface">
                          {material.quantity}
                        </td>
                        <td className="py-4 px-4 text-center text-on-surface-variant">
                          {getUnitSymbol(material.unit)}
                        </td>
                        <td className="py-4 px-4 text-right font-semibold text-deep-emerald">
                          {formatPrice(material.cost)}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {material.isActive ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed-dim/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-label-caps bg-surface-container/50 text-on-surface-variant border border-outline-variant/20">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-on-surface-variant">
                          {new Date(material.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(material)}
                              className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(material._id)}
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
                  Showing 1 to {filteredMaterials.length} of {filteredMaterials.length} entries
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-xs font-body-md text-on-surface-variant">
                    Total Stock Value: {formatPrice(filteredMaterials.reduce((sum, m) => sum + (m.cost || 0), 0))}
                  </span>
                </div>
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
            className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                {editingMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="p-3 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Material Code *
                </label>
                <input
                  type="text"
                  name="materialCode"
                  value={formData.materialCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md font-mono"
                  placeholder="e.g., MAT-001"
                  required
                  disabled={!!editingMaterial}
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Item Code
                </label>
                <input
                  type="text"
                  name="itemCode"
                  value={formData.itemCode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md font-mono"
                  placeholder="e.g., GC-18K-001 (optional)"
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Material Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="e.g., 18K Gold"
                  required
                />
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
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Unit *
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                    required
                  >
                    <option value="grams">Grams</option>
                    <option value="kg">Kilograms</option>
                    <option value="pieces">Pieces</option>
                    <option value="liters">Liters</option>
                    <option value="ml">Milliliters</option>
                    <option value="meters">Meters</option>
                    <option value="cm">Centimeters</option>
                    <option value="mm">Millimeters</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Cost (₹) *
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
                />
                <label className="font-body-md text-on-surface">
                  Active
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={loading}
                  className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    'Save'
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
              Are you sure you want to delete this raw material? This action cannot be undone.
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
