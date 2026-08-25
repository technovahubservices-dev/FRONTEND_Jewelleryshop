import { useState, useEffect } from 'react'
import { inventoryAPI, productAPI } from '../../services/api'

const MOVEMENT_TYPES = [
  { value: 'opening_stock', label: 'Opening Stock', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'purchase', label: 'Purchase', color: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'production', label: 'Production', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'sale', label: 'Sale', color: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'return', label: 'Return', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'adjustment', label: 'Adjustment', color: 'bg-gray-100 text-gray-800 border-gray-200' },
]

export default function Inventory() {
  const [metrics, setMetrics] = useState(null)
  const [movements, setMovements] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    product: '',
    movementType: 'purchase',
    quantity: '',
    referenceId: '',
    referenceType: 'purchase',
    notes: '',
  })

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchInitialData = async () => {
    setLoading(true)
    setError('')
    try {
      const [metricsRes, movementsRes, productsRes] = await Promise.all([
        inventoryAPI.getMetrics(),
        inventoryAPI.getMovements({ limit: 100 }),
        productAPI.getAll(),
      ])

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data)
      }
      if (movementsRes.data.success) {
        setMovements(movementsRes.data.data || [])
      }
      if (productsRes.data.success) {
        setProducts(productsRes.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch inventory data')
    } finally {
      setLoading(false)
    }
  }

  const filteredMovements = movements.filter(movement => {
    if (!searchTerm.trim()) return true
    const term = searchTerm.toLowerCase()
    const productName = movement.product?.name || ''
    const productSku = movement.product?.sku || ''
    const referenceId = movement.referenceId || ''
    return (
      productName.toLowerCase().includes(term) ||
      productSku.toLowerCase().includes(term) ||
      referenceId.toLowerCase().includes(term)
    )
  }).filter(movement => {
    if (typeFilter === 'all') return true
    return movement.movementType === typeFilter
  })

  const handleAddMovement = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const payload = {
        product: formData.product,
        movementType: formData.movementType,
        quantity: parseInt(formData.quantity, 10),
        referenceId: formData.referenceId || undefined,
        referenceType: formData.referenceType || null,
        notes: formData.notes || undefined,
      }

      const response = await inventoryAPI.createMovement(payload)
      if (response.data.success) {
        setSuccessMessage('Stock movement recorded successfully')
        setShowAddModal(false)
        setFormData({
          product: '',
          movementType: 'purchase',
          quantity: '',
          referenceId: '',
          referenceType: 'purchase',
          notes: '',
        })
        fetchInitialData()
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record stock movement')
    } finally {
      setSubmitting(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '-'
    return `₹ ${Number(price).toLocaleString('en-IN')}`
  }

  const getMovementBadge = (type) => {
    const config = MOVEMENT_TYPES.find(t => t.value === type) || MOVEMENT_TYPES[5]
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps border ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getMetricCard = (title, value, subtitle, icon, color) => (
    <div className="bg-surface-white p-5 rounded-lg border border-outline-variant shadow-sm flex flex-col justify-between h-28 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
      </div>
      <p className="font-label-caps text-label-caps text-outline z-10">{title}</p>
      <div>
        <p className={`font-headline-md text-headline-md ${color} z-10`}>{value}</p>
        {subtitle && <p className="text-xs text-on-surface-variant mt-1 z-10">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <main className="flex-1 min-w-0 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="w-full space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Inventory Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Track stock levels, movements, and inventory value.</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-deep-emerald/90 active:scale-95 shadow-sm"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Record Movement
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

        {metrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {getMetricCard('Total Products', metrics.totalProducts, 'Active SKUs', 'inventory_2', 'text-deep-emerald')}
            {getMetricCard('In Stock', metrics.inStock, 'Available', 'check_circle', 'text-deep-emerald')}
            {getMetricCard('Low Stock', metrics.lowStock, 'Below 10 units', 'warning', 'text-regal-gold')}
            {getMetricCard('Out of Stock', metrics.outOfStock, 'Needs restock', 'cancel', 'text-error')}
            {getMetricCard('Reserved Stock', metrics.reservedStock, 'Allocated', 'lock', 'text-on-surface-variant')}
            {getMetricCard('Inventory Value', formatPrice(metrics.inventoryValue), 'At cost price', 'currency_rupee', 'text-deep-emerald')}
          </div>
        )}

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          <div className="p-4 border-b border-outline-variant flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative w-full lg:w-96">
              <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
                search
              </span>
              <input
                className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
                placeholder="Search by product name, SKU, or reference..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="relative min-w-[160px]">
                <select
                  className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">All Movements</option>
                  {MOVEMENT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined animate-spin text-4xl text-on-surface-variant">
                progress_activity
              </span>
              <p className="font-body-md text-sm text-on-surface-variant mt-2">
                Loading inventory data...
              </p>
            </div>
          ) : filteredMovements.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">
                inventory_2
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                No stock movements found.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant">
                    <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Product</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">SKU</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Type</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Quantity</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Previous Stock</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">New Stock</th>
                    <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Reference</th>
                    <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                  {filteredMovements.map((movement) => (
                    <tr key={movement._id} className="table-row-hover bg-surface-white group">
                      <td className="py-4 pl-6 pr-4 text-on-surface whitespace-nowrap">
                        {formatDate(movement.createdAt)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">
                            {movement.product?.primaryImage || (movement.product?.images && movement.product.images[0]) ? (
                            <img
                              className="w-full h-full object-cover"
                              alt={movement.product.name}
                              src={movement.product.primaryImage || (movement.product.images && movement.product.images[0])}
                              onError={(e) => { e.target.src = 'https://placehold.co/40x40'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-outline-variant/20">
                              <span className="material-symbols-outlined text-xs text-on-surface-variant">inventory_2</span>
                            </div>
                          )}
                          </div>
                          <span className="truncate max-w-[200px]" title={movement.product?.name}>
                            {movement.product?.name || 'Unknown Product'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-on-surface font-mono text-xs">
                        {movement.product?.sku || '-'}
                      </td>
                      <td className="py-4 px-4">
                        {getMovementBadge(movement.movementType)}
                      </td>
                      <td className={`py-4 px-4 text-center font-semibold ${movement.quantity > 0 ? 'text-deep-emerald' : 'text-error'}`}>
                        {movement.quantity > 0 ? '+' : '-'}{movement.quantity}
                      </td>
                      <td className="py-4 px-4 text-center">{movement.previousStock}</td>
                      <td className="py-4 px-4 text-center font-semibold text-deep-emerald">{movement.newStock}</td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant">
                        {movement.referenceId || '-'}
                      </td>
                      <td className="py-4 px-4 text-xs text-on-surface-variant max-w-[200px] truncate">
                        {movement.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <h2 className="font-headline-md text-headline-md text-deep-emerald">
                Record Stock Movement
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-on-surface-variant hover:text-deep-emerald transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddMovement} className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                  Product *
                </label>
                <select
                  value={formData.product}
                  onChange={(e) => setFormData({ ...formData, product: e.target.value })}
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
                    Movement Type *
                  </label>
                  <select
                    value={formData.movementType}
                    onChange={(e) => setFormData({ ...formData, movementType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                  >
                    {MOVEMENT_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Quantity *
                  </label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Reference ID
                  </label>
                  <input
                    type="text"
                    value={formData.referenceId}
                    onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="e.g., PO-001, PROD-001"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Reference Type
                  </label>
                  <select
                    value={formData.referenceType}
                    onChange={(e) => setFormData({ ...formData, referenceType: e.target.value })}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md appearance-none"
                  >
                    <option value="purchase">Purchase</option>
                    <option value="production">Production</option>
                    <option value="order">Order</option>
                    <option value="return">Return</option>
                    <option value="adjustment">Adjustment</option>
                  </select>
                </div>
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
                  placeholder="Optional notes about this movement"
                ></textarea>
              </div>
            </form>

            <div className="flex justify-end gap-3 p-6 border-t border-outline-variant">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                disabled={submitting}
                className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMovement}
                disabled={submitting}
                className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Saving...
                  </>
                ) : (
                  'Save Movement'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
