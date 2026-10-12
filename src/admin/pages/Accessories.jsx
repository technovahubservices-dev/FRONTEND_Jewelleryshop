import { useEffect, useMemo, useState } from 'react'
import { accessoryAPI, accessoryProductAPI } from '../../services/api'
import AccessoryProductModal from '../components/AccessoryProductModal'
import { getAccessoryImage, getRecordId } from '../../utils/accessoryProducts'
import { resolveImageUrl } from '../../utils/apiUrl'

const defaultCategoryForm = {
  name: '',
  description: '',
  isActive: true,
}

const statusBadge = (status) => {
  const normalized = status || 'active'
  const styles = {
    active: 'bg-primary-fixed-dim/20 text-on-primary-fixed-variant border-primary-fixed-dim/30',
    inactive: 'bg-error-container/20 text-error border-error-container/30',
    draft: 'bg-surface-container/50 text-on-surface-variant border-outline-variant/20',
  }
  const labels = {
    active: 'Active',
    inactive: 'Disabled',
    draft: 'Draft',
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-label-caps border ${styles[normalized] || styles.draft}`}>
      {labels[normalized] || 'Draft'}
    </span>
  )
}

export default function Accessories() {
  const [categories, setCategories] = useState([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [products, setProducts] = useState([])
  const [categoriesLoading, setCategoriesLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [savingCategory, setSavingCategory] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryModalOpen, setCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [categoryForm, setCategoryForm] = useState(defaultCategoryForm)
  const [productModalOpen, setProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const selectedCategory = useMemo(
    () => categories.find((category) => getRecordId(category) === selectedCategoryId) || categories[0] || null,
    [categories, selectedCategoryId]
  )

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([])
      return
    }
    fetchProducts(selectedCategory)
  }, [selectedCategoryId, selectedCategory])

  const fetchCategories = async () => {
    setCategoriesLoading(true)
    setError('')
    try {
      const response = await accessoryAPI.getAll()
      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error(response.data?.message || 'Failed to fetch accessory categories')
      }
      const loaded = response.data.data
      setCategories(loaded)
      if ((!selectedCategoryId || !loaded.some((category) => getRecordId(category) === selectedCategoryId)) && loaded[0]) {
        setSelectedCategoryId(getRecordId(loaded[0]))
      }
    } catch (err) {
      setCategories([])
      setError(err.response?.data?.message || err.message || 'Failed to fetch accessory categories')
    } finally {
      setCategoriesLoading(false)
    }
  }

  const fetchProducts = async (category) => {
    setProductsLoading(true)
    setError('')
    try {
      const categoryId = getRecordId(category)
      const response = await accessoryProductAPI.getAll({
        category: categoryId,
        categoryId,
        limit: 100,
        status: 'all',
      })

      if (!response.data?.success || !Array.isArray(response.data.data)) {
        throw new Error(response.data?.message || 'Failed to fetch accessory products')
      }
      setProducts(response.data.data)
    } catch (err) {
      setProducts([])
      setError(err.response?.data?.message || err.message || 'Failed to fetch accessory products')
    } finally {
      setProductsLoading(false)
    }
  }

  const openCategoryModal = (category = null) => {
    setEditingCategory(category)
    setCategoryForm(category ? {
      name: category.name || '',
      description: category.description || '',
      isActive: category.isActive !== false,
    } : defaultCategoryForm)
    setCategoryModalOpen(true)
    setError('')
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    if (!categoryForm.name.trim()) {
      setError('Category name is required')
      return
    }

    setSavingCategory(true)
    setError('')
    setSuccessMessage('')
    try {
      if (editingCategory) {
        await accessoryAPI.update(getRecordId(editingCategory), categoryForm)
        setSuccessMessage('Accessory category updated successfully')
      } else {
        await accessoryAPI.create(categoryForm)
        setSuccessMessage('Accessory category created successfully')
      }
      setCategoryModalOpen(false)
      await fetchCategories()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save accessory category')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleProductSaved = async (message) => {
    setSuccessMessage(message)
    setError('')
    if (selectedCategory) {
      await fetchProducts(selectedCategory)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return

    setError('')
    setSuccessMessage('')
    try {
      if (deleteTarget.type === 'category') {
        await accessoryAPI.delete(getRecordId(deleteTarget.item))
        setSuccessMessage('Accessory category deleted successfully')
        await fetchCategories()
      } else {
        await accessoryProductAPI.delete(getRecordId(deleteTarget.item))
        setSuccessMessage('Accessory product deleted successfully')
        if (selectedCategory) await fetchProducts(selectedCategory)
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Delete failed')
    } finally {
      setDeleteTarget(null)
    }
  }

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    if (!term) return products
    return products.filter((product) =>
      product.name?.toLowerCase().includes(term) ||
      product.brand?.toLowerCase().includes(term) ||
      product.description?.toLowerCase().includes(term)
    )
  }, [products, searchTerm])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Accessories Management</h1>
          <p className="text-sm text-gray-500">
            Manage accessory categories and their separate product catalogue.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => openCategoryModal()}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all hover:bg-secondary-fixed active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Category
          </button>
          <button
            type="button"
            onClick={() => {
              setEditingProduct(null)
              setProductModalOpen(true)
            }}
            disabled={!selectedCategory}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all hover:bg-deep-emerald/90 active:scale-95 shadow-sm disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">add_shopping_cart</span>
            Add Product
          </button>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-4 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-lg text-deep-emerald">Accessories Categories</h2>
              <p className="text-xs text-on-surface-variant">{categories.length} categories</p>
            </div>
            <button type="button" onClick={fetchCategories} title="Refresh categories" className="p-2 rounded border border-outline-variant text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low">
              <span className="material-symbols-outlined text-sm">refresh</span>
            </button>
          </div>

          {categoriesLoading ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">progress_activity</span>
              <p className="text-sm text-on-surface-variant mt-2">Loading categories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="p-10 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">category</span>
              <p className="text-sm text-on-surface-variant">No accessory categories found.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/50">
              {categories.map((category) => {
                const categoryId = getRecordId(category)
                const active = selectedCategoryId === categoryId
                return (
                  <div key={categoryId} className={`p-4 transition-colors ${active ? 'bg-emerald-50' : 'bg-white hover:bg-surface-container-low'}`}>
                    <button type="button" onClick={() => setSelectedCategoryId(categoryId)} className="w-full text-left">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-deep-emerald">{category.name}</h3>
                          <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">{category.description || 'No description'}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-label-caps border ${category.isActive !== false ? 'bg-primary-fixed-dim/20 text-on-primary-fixed-variant border-primary-fixed-dim/30' : 'bg-surface-container/50 text-on-surface-variant border-outline-variant/20'}`}>
                          {category.isActive !== false ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </button>

                    <div className="flex justify-end gap-2 mt-3">
                      <button type="button" onClick={() => openCategoryModal(category)} className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-white rounded" title="Edit category">
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button type="button" onClick={() => setDeleteTarget({ type: 'category', item: category })} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-white rounded" title="Delete category">
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        <section className="lg:col-span-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-outline-variant flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="font-headline-md text-lg text-deep-emerald">
                {selectedCategory ? `${selectedCategory.name} Products` : 'Accessories Products'}
              </h2>
              <p className="text-xs text-on-surface-variant">
                {filteredProducts.length} products in this category
              </p>
            </div>
            <div className="relative w-full md:w-80">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-lg">search</span>
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search products..." className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm rounded transition-all" />
            </div>
          </div>

          {productsLoading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">progress_activity</span>
              <p className="text-sm text-on-surface-variant mt-2">Loading accessory products...</p>
            </div>
          ) : !selectedCategory ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">category</span>
              <p className="text-sm text-on-surface-variant">Select or create a category to manage products.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">inventory_2</span>
              <p className="text-sm text-on-surface-variant">
                {searchTerm ? 'No products match your search.' : 'No products in this category yet.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Product</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Brand</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Price</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Stock</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 text-sm">
                  {filteredProducts.map((product) => (
                    <tr key={getRecordId(product)} className="table-row-hover bg-surface-white group">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">
                            <img src={resolveImageUrl(getAccessoryImage(product, 'https://placehold.co/80x80?text=No+Image'))} alt={product.name} className="w-full h-full object-cover" onError={(event) => { event.currentTarget.src = 'https://placehold.co/80x80?text=No+Image' }} />
                          </div>
                          <div>
                            <p className="font-semibold text-deep-emerald">{product.name}</p>
                            <p className="text-xs text-on-surface-variant mt-0.5">{product.description || '-'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-on-surface-variant">{product.brand || '-'}</td>
                      <td className="py-4 px-4 text-right font-semibold">Rs. {Number(product.price || 0).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-4">{product.stockQuantity ?? product.stock ?? 0}</td>
                      <td className="py-4 px-4">{statusBadge(product.status || (product.isActive === false ? 'inactive' : 'active'))}</td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button type="button" onClick={() => { setEditingProduct(product); setProductModalOpen(true) }} className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded" title="Edit product">
                            <span className="material-symbols-outlined text-sm">edit</span>
                          </button>
                          <button type="button" onClick={() => setDeleteTarget({ type: 'product', item: product })} className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded" title="Delete product">
                            <span className="material-symbols-outlined text-sm">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {categoryModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setCategoryModalOpen(false)}>
          <div className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button type="button" onClick={() => setCategoryModalOpen(false)} className="text-on-surface-variant hover:text-deep-emerald">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Category Name *</label>
                <input value={categoryForm.name} onChange={(event) => setCategoryForm((prev) => ({ ...prev, name: event.target.value }))} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm" placeholder="Watch, Lipstick, Handbag, Perfume" />
              </div>
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">Description</label>
                <textarea rows={3} value={categoryForm.description} onChange={(event) => setCategoryForm((prev) => ({ ...prev, description: event.target.value }))} className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm resize-y" />
              </div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={categoryForm.isActive} onChange={(event) => setCategoryForm((prev) => ({ ...prev, isActive: event.target.checked }))} className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald" />
                <span className="text-on-surface">Active</span>
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => setCategoryModalOpen(false)} className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low">Cancel</button>
                <button type="submit" disabled={savingCategory} className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 flex items-center gap-2 disabled:opacity-50">
                  {savingCategory && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <AccessoryProductModal
        isOpen={productModalOpen}
        onClose={() => {
          setProductModalOpen(false)
          setEditingProduct(null)
        }}
        category={selectedCategory}
        product={editingProduct}
        onSaved={handleProductSaved}
      />

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setDeleteTarget(null)}>
          <div className="bg-surface-white rounded-lg shadow-xl p-6 max-w-md w-full" onClick={(event) => event.stopPropagation()}>
            <h3 className="font-headline-md text-headline-md text-deep-emerald mb-4">Confirm Delete</h3>
            <p className="text-on-surface-variant mb-6">
              Delete this {deleteTarget.type}? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setDeleteTarget(null)} className="px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low">Cancel</button>
              <button type="button" onClick={handleDeleteConfirm} className="px-4 py-2 bg-error text-surface-white font-label-caps text-label-caps rounded hover:bg-error/90">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
