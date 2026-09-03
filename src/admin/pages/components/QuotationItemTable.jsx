import { useState, useEffect } from 'react'
import { productAPI } from '../../../services/api'

const DEFAULT_GST = 18

export default function QuotationItemTable({ items, products, onAddItem, onRemoveItem, onUpdateItem }) {
  const [localProducts, setLocalProducts] = useState(products)

  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  const handleProductChange = (index, value) => {
    onUpdateItem(index, 'productId', value)

    const selected = localProducts.find((p) => (p._id || p.id) === value)
    if (selected) {
      onUpdateItem(index, 'name', selected.name || '')
      onUpdateItem(index, 'sku', selected.SKU || selected.sku || '')
      onUpdateItem(index, 'price', Number(selected.price) || 0)
      onUpdateItem(index, 'discount', 0)
      onUpdateItem(index, 'gst', DEFAULT_GST)
    }
  }

  const handleSkuChange = (index, value) => {
    onUpdateItem(index, 'sku', value)

    const trimmed = String(value || '').trim()
    if (trimmed) {
      const matched = localProducts.find((p) => (p.SKU || p.sku || '').toLowerCase() === trimmed.toLowerCase())
      if (matched && matched._id && matched._id !== items[index]?.productId) {
        onUpdateItem(index, 'productId', matched._id || matched.id || '')
        onUpdateItem(index, 'name', matched.name || '')
        onUpdateItem(index, 'price', Number(matched.price) || 0)
        onUpdateItem(index, 'discount', 0)
        onUpdateItem(index, 'gst', DEFAULT_GST)
      }
    }
  }

  const handleFieldChange = (index, field, value) => {
    const numericFields = ['quantity', 'discount', 'gst', 'price']
    if (numericFields.includes(field)) {
      value = Number(value) || 0
    }
    onUpdateItem(index, field, value)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-headline-md text-headline-md text-deep-emerald flex items-center gap-2">
          <span className="material-symbols-outlined">shopping_bag</span>
          Products
        </h2>
        <button onClick={onAddItem} className="inline-flex items-center gap-2 px-4 py-2 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-[16px]">add</span>
          Add Product
        </button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-outline-variant rounded-lg">
          <span className="material-symbols-outlined text-4xl text-outline mb-2">add_circle</span>
          <p className="text-sm text-on-surface-variant">No products added yet. Click "Add Product" to start.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div key={index} className="border border-outline-variant/30 rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-charcoal-text">Product {index + 1}</h3>
                <button onClick={() => onRemoveItem(index)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors" title="Remove">
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Product Name</label>
                  <select value={item.productId} onChange={(e) => handleProductChange(index, e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors">
                    <option value="">Select product</option>
                    {localProducts.map((p) => (
                      <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">SKU</label>
                  <input type="text" value={item.sku} onChange={(e) => handleSkuChange(index, e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Qty</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleFieldChange(index, 'quantity', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Price (₹)</label>
                  <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => handleFieldChange(index, 'price', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Discount (₹) <span className="text-outline-variant normal-case">(optional)</span></label>
                  <input type="number" min="0" step="0.01" value={item.discount} onChange={(e) => handleFieldChange(index, 'discount', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                </div>
                <div>
                  <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">GST (%)</label>
                  <input type="number" min="0" max="100" value={item.gst} onChange={(e) => handleFieldChange(index, 'gst', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="18" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}