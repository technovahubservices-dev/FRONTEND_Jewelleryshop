import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, quotationAPI } from '../../services/api'
import * as XLSX from 'xlsx'
import QuotationItemTable from './components/QuotationItemTable'
import QuotationSummary from './components/QuotationSummary'
import QuotationPreviewModal from './components/QuotationPreviewModal'
import ExcelImportPanel from './components/ExcelImportPanel'

const DEFAULT_GST = 18

const parseNumber = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const cleaned = value.replace(/[^0-9.\-]/g, '')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : 0
}

const safeNum = (value, fallback = 0) => {
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

const normaliseItemForUI = (raw, index = 0) => {
  if (!raw || typeof raw !== 'object') return null
  return {
    product: raw.product || null,
    productId: raw.productId || (raw.product && (raw.product._id || raw.product.id)) || '',
    name: String(raw.name || `Item ${index + 1}`),
    sku: String(raw.sku || ''),
    quantity: Math.max(1, safeNum(raw.quantity, 1)),
    discount: safeNum(raw.discount, 0),
    gst: safeNum(raw.gst, DEFAULT_GST),
    price: safeNum(raw.price, 0),
  }
}

const normalizeProduct = (raw) => {
  if (!raw) return null
  const get = (keys, fallback = '') => {
    for (const k of keys) {
      if (raw[k] !== undefined && raw[k] !== null && raw[k] !== '') return raw[k]
    }
    return fallback
  }
  return {
    _id: get(['_id', 'id']) || undefined,
    name: get(['name', 'Product Name']) || 'Unnamed Product',
    sku: get(['sku', 'SKU']) || '',
    price: Number(get(['price', 'Price']) || 0),
    category: get(['category', 'Category']) || '',
  }
}

const MOCK_PRODUCTS = [
  { _id: 'p1', name: 'Elegant Gold Pendant', sku: 'SKU001', price: 25000, category: 'Necklaces' },
  { _id: 'p2', name: 'Diamond Stud Earrings', sku: 'SKU002', price: 45000, category: 'Earrings' },
  { _id: 'p3', name: 'Temple Jewellery Set', sku: 'SKU003', price: 89000, category: 'Bangles' },
  { _id: 'p4', name: 'Kundan Necklace', sku: 'SKU004', price: 125000, category: 'Necklaces' },
  { _id: 'p5', name: 'Silver Jhumkas', sku: 'SKU005', price: 8500, category: 'Earrings' },
]

export default function CreateQuotation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState(null)

  const [customer, setCustomer] = useState({ name: '', phone: '', email: '', address: '' })
  const [quotationNumber, setQuotationNumber] = useState(
    `QT-2026-${String(Math.floor(Math.random() * 900) + 100)}`
  )
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [validUntil, setValidUntil] = useState('')
  const [items, setItems] = useState([])
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState('draft')

  const [excelPreview, setExcelPreview] = useState([])
  const [excelError, setExcelError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    const incoming = location.state?.quotation || null
    if (!incoming) {
      setEditingQuotation(null)
      setCustomer({ name: '', phone: '', email: '', address: '' })
      setItems([])
      setNotes('')
      setStatus('draft')
      setQuotationNumber(`QT-2026-${String(Math.floor(Math.random() * 900) + 100)}`)
      setDate(new Date().toISOString().split('T')[0])
      setValidUntil('')
      return
    }
    const incomingId = incoming._id || incoming.id
    setEditingQuotation((current) => {
      if (current && (current._id || current.id) === incomingId) return current
      return incoming
    })
    setCustomer(incoming.customer || { name: '', phone: '', email: '', address: '' })
    setItems(Array.isArray(incoming.items) ? incoming.items.map((it, i) => normaliseItemForUI(it, i)).filter(Boolean) : [])
    setNotes(incoming.notes || '')
    setStatus(incoming.status || 'draft')
    setQuotationNumber(incoming.quotationNumber || `QT-2026-${String(Math.floor(Math.random() * 900) + 100)}`)
    setDate(incoming.date ? String(incoming.date).split('T')[0] : new Date().toISOString().split('T')[0])
    setValidUntil(incoming.validUntil ? String(incoming.validUntil).split('T')[0] : '')
  }, [location.state?.quotation?._id, location.state?.quotation?.id])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll({ limit: 100 })
        if (response.data.success && response.data.data.length > 0) {
          setProducts(response.data.data.map(productAPI.transform))
        } else {
          setProducts(MOCK_PRODUCTS)
        }
      } catch (err) {
        setProducts(MOCK_PRODUCTS)
      } finally {
        setLoadingProducts(false)
      }
    }
    fetchProducts()
  }, [])

  useEffect(() => {
    if (!validUntil) {
      const d = new Date()
      d.setDate(d.getDate() + 30)
      setValidUntil(d.toISOString().split('T')[0])
    }
  }, [validUntil])

  const addItem = () => {
    setItems([
      ...items,
      {
        productId: '',
        name: '',
        sku: '',
        quantity: 1,
        discount: 0,
        gst: DEFAULT_GST,
        price: 0,
      },
    ])
  }

  const removeItem = (index) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }

    if (field === 'productId') {
      const selected = products.find((p) => (p._id || p.id) === value)
      if (selected) {
        updated[index].name = selected.name || ''
        updated[index].sku = selected.SKU || selected.sku || ''
        updated[index].price = Number(selected.price) || 0
        updated[index].discount = 0
        updated[index].gst = DEFAULT_GST
      }
    }

    if (field === 'sku') {
      const trimmed = String(value || '').trim()
      if (trimmed) {
        const matched = products.find((p) => (p.SKU || p.sku || '').toLowerCase() === trimmed.toLowerCase())
        if (matched && matched._id && matched._id !== updated[index].productId) {
          updated[index].productId = matched._id || matched.id || ''
          updated[index].name = matched.name || ''
          updated[index].price = Number(matched.price) || 0
          updated[index].discount = 0
          updated[index].gst = DEFAULT_GST
        }
      }
    }

    const numericFields = ['quantity', 'discount', 'gst', 'price']
    if (numericFields.includes(field)) {
      updated[index][field] = Number(value) || 0
    }

    setItems(updated)
  }

  const handleExcelUpload = async (file) => {
    if (!file) return

    setIsUploading(true)
    setExcelError('')
    setExcelPreview([])

    try {
      const data = await readExcelFile(file)
      setExcelPreview(data)
    } catch (err) {
      setExcelError('Failed to parse Excel file. Please check the format.')
    } finally {
      setIsUploading(false)
    }
  }

  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const binaryString = event.target.result
          const workbook = XLSX.read(binaryString, { type: 'binary' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' })

          if (!rawData || rawData.length === 0) {
            reject(new Error('Empty file'))
            return
          }

          const columnMap = {
            'Product Name': 'name',
            'Product': 'name',
            'Item': 'name',
            'Quantity': 'quantity',
            'Qty': 'quantity',
            'Price': 'price',
            'Rate': 'price',
            'Unit Price': 'price',
            'SKU': 'sku',
            'Discount': 'discount',
            'GST': 'gst',
            'GST %': 'gst',
            'GST Percentage': 'gst',
          }

          const normalizeKey = (key) => {
            const trimmed = String(key || '').trim()
            return columnMap[trimmed] || columnMap[trimmed.toUpperCase()] || trimmed.toLowerCase().replace(/\s+/g, '')
          }

          const mappedItems = rawData.map((row, index) => {
            const item = { _row: index + 2 }
            Object.keys(row).forEach((key) => {
              const normalized = normalizeKey(key)
              item[normalized] = row[key]
            })

            item.quantity = parseNumber(item.quantity) || 1
            item.price = parseNumber(item.price) || 0
            item.discount = parseNumber(item.discount) || 0
            item.gst = parseNumber(item.gst) || DEFAULT_GST
            item.sku = String(item.sku || '')
            item.name = String(item.name || `Item ${index + 1}`)

            return item
          })

          resolve(mappedItems)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = () => reject(new Error('File read error'))
      reader.readAsBinaryString(file)
    })
  }

  const importExcelToQuotation = () => {
    if (excelPreview.length === 0) return
    const importedItems = excelPreview
      .map((item, idx) => normaliseItemForUI(item, idx))
      .filter(Boolean)
    setItems(importedItems)
    setExcelPreview([])
    setExcelError('')
  }

  const removeExcelPreviewItem = (index) => {
    setExcelPreview(excelPreview.filter((_, i) => i !== index))
  }

  const updateExcelPreviewItem = (index, field, value) => {
    const updated = [...excelPreview]
    updated[index] = { ...updated[index], [field]: value }
    setExcelPreview(updated)
  }

  // Discount is treated as a flat ₹ amount per line (not a percentage).
  // If every line has 0 discount, we hide the discount summary row and column.
  const calculations = items.reduce(
    (acc, item) => {
      const qty = item.quantity || 0
      const price = parseNumber(item.price) || 0
      const discountAmount = parseNumber(item.discount) || 0
      const gstPercent = parseNumber(item.gst) || 0

      const basePriceTotal = qty * price
      const taxableValue = Math.max(0, basePriceTotal - discountAmount)
      const gstAmount = taxableValue * (gstPercent / 100)
      const lineTotal = taxableValue + gstAmount

      acc.totalQuantity += qty
      acc.totalGrossAmount += basePriceTotal
      acc.totalDiscount += discountAmount
      acc.totalGst += gstAmount
      acc.grandTotal += lineTotal
      return acc
    },
    { totalQuantity: 0, totalGrossAmount: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 }
  )

  const hasAnyDiscount = items.some((it) => parseNumber(it.discount) > 0)

  const previewQuotation = useMemo(() => ({
    _id: editingQuotation?._id,
    quotationNumber,
    date,
    validUntil,
    customer: {
      name: customer.name || '-',
      phone: customer.phone || '',
      email: customer.email || '',
      address: customer.address || '',
    },
    items: items.map((it, i) => normaliseItemForUI(it, i)).filter(Boolean),
    notes,
    status,
    totalAmount: calculations.grandTotal,
  }), [customer, date, validUntil, items, notes, status, quotationNumber, editingQuotation, calculations.grandTotal])

  const handleSave = async (saveStatus) => {
    setSaving(true)
    const payloadItems = items
      .map((it, i) => normaliseItemForUI(it, i))
      .filter(Boolean)
    const quotationData = {
      customer: {
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
      },
      validUntil,
      items: payloadItems,
      notes,
      status: saveStatus,
    }

    if (editingQuotation?.quotationNumber) {
      quotationData.quotationNumber = editingQuotation.quotationNumber
    }

    try {
      let response
      if (editingQuotation?._id) {
        response = await quotationAPI.update(editingQuotation._id, quotationData)
      } else {
        response = await quotationAPI.create(quotationData)
      }

      if (response.data.success) {
        const savedQuotation = response.data.data
        setStatus(savedQuotation.status || saveStatus)
        if (savedQuotation.quotationNumber) {
          setQuotationNumber(savedQuotation.quotationNumber)
        }
        navigate('/admin/quotations', { state: { quotation: savedQuotation, action: editingQuotation ? 'update' : 'create' } })
      } else {
        alert(response.data.message || 'Failed to save quotation')
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save quotation')
    } finally {
      setSaving(false)
    }
  }

  const handlePreview = () => {
    setShowPreview(true)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">{editingQuotation ? 'Edit Quotation' : 'Create Quotation'}</h1>
          <p className="text-sm text-gray-500">{editingQuotation ? 'Update quotation details below.' : 'Fill in the details below to create a new quotation.'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">person</span>
              Customer Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="customerName">Customer Name</label>
                <input id="customerName" type="text" required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Enter customer name" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="phone">Phone</label>
                <input id="phone" type="tel" required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="email">Email</label>
                <input id="email" type="email" required value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="customer@example.com" />
              </div>
              <div className="md:col-span-2">
                <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="address">Address</label>
                <textarea id="address" rows="3" value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors resize-y" placeholder="Enter full address"></textarea>
              </div>
            </div>
          </div>

          {/* Excel Upload */}
          <ExcelImportPanel
            excelPreview={excelPreview}
            excelError={excelError}
            isUploading={isUploading}
            onUpload={handleExcelUpload}
            onImport={importExcelToQuotation}
            onRemovePreviewItem={removeExcelPreviewItem}
            onUpdatePreviewItem={updateExcelPreviewItem}
          />

          <QuotationItemTable
            items={items}
            products={products}
            onAddItem={addItem}
            onRemoveItem={removeItem}
            onUpdateItem={updateItem}
          />
        </div>

        {/* Right Summary */}
        <QuotationSummary
          calculations={calculations}
          showDiscount={hasAnyDiscount}
          quotationNumber={quotationNumber}
          date={date}
          validUntil={validUntil}
          notes={notes}
          saving={saving}
          itemCount={items.length}
          onSave={(status) => handleSave(status)}
          onPreview={handlePreview}
          onUpdateValidUntil={setValidUntil}
          onUpdateNotes={setNotes}
        />
      </div>

      <QuotationPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quotation={previewQuotation}
      />
    </div>
  )
}