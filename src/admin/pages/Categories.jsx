import { useState, useEffect, useCallback } from 'react'
import { categoryAPI } from '../../services/api'

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({ name: '', description: '', isActive: true })
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await categoryAPI.getAll()
      if (response.data.success) {
        setCategories(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch categories')
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to fetch categories')
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
    setEditingCategory(null)
    setFormData({ name: '', description: '', isActive: true })
    setIsModalOpen(true)
    setError('')
  }

  const openEditModal = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive !== undefined ? category.isActive : true,
    })
    setIsModalOpen(true)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      setError('Category name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      if (editingCategory) {
        await categoryAPI.update(editingCategory._id || editingCategory.id, formData)
        setSuccessMessage('Category updated successfully')
      } else {
        await categoryAPI.create(formData)
        setSuccessMessage('Category created successfully')
      }
      setIsModalOpen(false)
      setEditingCategory(null)
      setFormData({ name: '', description: '', isActive: true })
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save category')
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
      await categoryAPI.delete(deleteConfirmId)
      setSuccessMessage('Category deleted successfully')
      setError('')
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete category')
      setSuccessMessage('')
    } finally {
      setDeleteConfirmId(null)
    }
  }

  const filteredCategories = categories.filter(
    (c) =>
      c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Category Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your inventory, prices, and product details.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Create New Category
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
              placeholder="Search by name..."
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => { fetchCategories(); setSearchTerm('') }}
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
                Loading categories...
              </p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                category
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                {searchTerm
                  ? 'No categories match your search'
                  : 'No categories found. Click "Create New Category" to get started.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant">
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Category Name</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Slug</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Description</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Status</th>
                      <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Created</th>
                      <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                    {filteredCategories.map((category) => (
                      <tr key={category._id} className="table-row-hover bg-surface-white group">
                        <td className="py-4 px-4">
                          <span className="font-medium text-deep-emerald">{category.name}</span>
                        </td>
                        <td className="py-4 px-4 text-on-surface-variant">{category.slug || '-'}</td>
                        <td className="py-4 px-4 text-on-surface-variant max-w-xs truncate">
                          {category.description || '-'}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {category.isActive ? (
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
                          {new Date(category.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => openEditModal(category)}
                              className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined">edit</span>
                            </button>
                            <button
                              onClick={() => handleDeleteClick(category._id)}
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
                  Showing 1 to {filteredCategories.length} of {filteredCategories.length} entries
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
            className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
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
                  Category Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                  placeholder="Enter category name"
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
                  placeholder="Enter category description (optional)"
                ></textarea>
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
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Saving...
                    </>
                  ) : (
                    'Save Category'
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
              Are you sure you want to delete this category? This action cannot be undone.
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
