import { useState, useEffect } from 'react'
import { accessoryAPI } from '../../services/api'

export default function Accessories() {
  const [accessories, setAccessories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAccessory, setEditingAccessory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    fetchAccessories()
  }, [])

  const fetchAccessories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await accessoryAPI.getAll()
      if (response.data.success) {
        setAccessories(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch accessories')
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to fetch accessories'
      )
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
    setEditingAccessory(null)
    setFormData({
      name: '',
      description: '',
      isActive: true,
    })
    setError('')
    setIsModalOpen(true)
  }

  const openEditModal = (accessory) => {
    setEditingAccessory(accessory)
    setFormData({
      name: accessory.name || '',
      description: accessory.description || '',
      isActive: accessory.isActive !== undefined ? accessory.isActive : true,
    })
    setError('')
    setIsModalOpen(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      setError('Accessory name is required')
      return
    }

    setLoading(true)
    setError('')
    setSuccessMessage('')

    try {
      if (editingAccessory) {
        await accessoryAPI.update(
          editingAccessory._id || editingAccessory.id,
          formData
        )
        setSuccessMessage('Accessory updated successfully')
      } else {
        await accessoryAPI.create(formData)
        setSuccessMessage('Accessory created successfully')
      }

      setIsModalOpen(false)
      setEditingAccessory(null)
      setFormData({
        name: '',
        description: '',
        isActive: true,
      })

      await fetchAccessories()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to save accessory'
      )
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return

    try {
      await accessoryAPI.delete(deleteConfirmId)
      setSuccessMessage('Accessory deleted successfully')
      setError('')
      await fetchAccessories()
    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        'Failed to delete accessory'
      )
      setSuccessMessage('')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const filteredAccessories = accessories.filter(
    (accessory) =>
      accessory.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      accessory.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">
            Accessories Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage the accessories shown in Home and Header navigation.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Create New Accessory
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
            placeholder="Search accessories..."
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <button
          onClick={() => {
            fetchAccessories()
            setSearchTerm('')
          }}
          className="px-4 py-2 text-on-surface-variant hover:text-deep-emerald border border-outline-variant rounded hover:bg-surface-container-low transition-colors"
          title="Refresh"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
              progress_activity
            </span>
            <p className="font-body-md text-sm text-on-surface-variant mt-2">
              Loading accessories...
            </p>
          </div>
        ) : filteredAccessories.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
              shopping_bag
            </span>
            <p className="font-body-md text-sm text-on-surface-variant">
              {searchTerm
                ? 'No accessories match your search'
                : 'No accessories found. Click "Create New Accessory" to get started.'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                      Accessory Name
                    </th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                      Slug
                    </th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                      Description
                    </th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">
                      Status
                    </th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">
                      Created
                    </th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredAccessories.map((accessory) => (
                    <tr
                      key={accessory._id || accessory.id}
                      className="table-row-hover bg-surface-white group"
                    >
                      <td className="py-4 px-4">
                        <span className="font-medium text-deep-emerald">
                          {accessory.name}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-on-surface-variant">
                        {accessory.slug || '-'}
                      </td>

                      <td className="py-4 px-4 text-on-surface-variant max-w-xs truncate">
                        {accessory.description || '-'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        {accessory.isActive ? (
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
                        {accessory.createdAt
                          ? new Date(accessory.createdAt).toLocaleDateString(
                              'en-US',
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )
                          : '-'}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEditModal(accessory)}
                            className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined">
                              edit
                            </span>
                          </button>

                          <button
                            onClick={() =>
                              setDeleteConfirmId(
                                accessory._id || accessory.id
                              )
                            }
                            className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined">
                              delete
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant">
              <span className="text-xs font-body-md text-on-surface-variant">
                Showing 1 to {filteredAccessories.length} of{' '}
                {filteredAccessories.length} entries
              </span>
            </div>
          </>
        )}
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
                {editingAccessory
                  ? 'Edit Accessory'
                  : 'Add New Accessory'}
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
                  Accessory Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Enter accessory name"
                  required
                />
              </div>

              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                  placeholder="Enter accessory description (optional)"
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
                  className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
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
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Saving...
                    </>
                  ) : (
                    'Save Accessory'
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
              Are you sure you want to delete this accessory? This action
              cannot be undone.
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
    </div>
  )
}
