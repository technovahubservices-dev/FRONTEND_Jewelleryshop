import { useState, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, quotationAPI } from '../../services/api'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import logo from '../../assets/icons/logo.jpeg'
import QuotationItemTable from './components/QuotationItemTable'
import QuotationSummary from './components/QuotationSummary'
import QuotationPreviewModal from './components/QuotationPreviewModal'
import ExcelImportPanel from './components/ExcelImportPanel'

const DEFAULT_GST = 18

const DEFAULT_METAL_RATES = {
  Gold: 8500,
  Silver: 850,
  Platinum: 4200,
  'Rose Gold': 8700,
  'White Gold': 8600,
}

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

// Normalise an item coming from the backend, from Excel, or from local edits
// so that the preview/summary panels never crash on missing fields.
const normaliseItemForUI = (raw, index = 0) => {
  if (!raw || typeof raw !== 'object') return null
  return {
    product: raw.product || null,
    productId: raw.productId || (raw.product && (raw.product._id || raw.product.id)) || '',
    name: String(raw.name || `Item ${index + 1}`),
    sku: String(raw.sku || ''),
    hsn: String(raw.hsn || ''),
    metal: String(raw.metal || ''),
    purity: String(raw.purity || ''),
    grossWeight: String(raw.grossWeight || ''),
    netWeight: String(raw.netWeight || ''),
    stoneWeight: String(raw.stoneWeight || ''),
    stoneType: String(raw.stoneType || ''),
    metalRate: safeNum(raw.metalRate, 0),
    makingCharges: safeNum(raw.makingCharges, 0),
    wastage: safeNum(raw.wastage, 0),
    stoneCharges: safeNum(raw.stoneCharges, 0),
    quantity: Math.max(1, safeNum(raw.quantity, 1)),
    discount: safeNum(raw.discount, 0),
    gst: safeNum(raw.gst, 18),
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
    metal: get(['metal', 'Metal']) || '',
    purity: get(['purity', 'Purity']) || '',
    weight: get(['weight', 'Weight']) || '',
    diamondWeight: get(['diamondWeight', 'diamondWeight']) || '0',
    diamondShape: get(['diamondShape', 'diamondShape']) || 'N/A',
    price: Number(get(['price', 'Price']) || 0),
    category: get(['category', 'Category']) || '',
  }
}

const MOCK_PRODUCTS = [
  { _id: 'p1', name: 'Elegant Gold Pendant', sku: 'SKU001', metal: 'Gold', purity: '22K', weight: '3.2', diamondWeight: '0.15', diamondShape: 'Round', price: 25000, category: 'Necklaces' },
  { _id: 'p2', name: 'Diamond Stud Earrings', sku: 'SKU002', metal: 'Gold', purity: '18K', weight: '1.8', diamondWeight: '0.40', diamondShape: 'Round', price: 45000, category: 'Earrings' },
  { _id: 'p3', name: 'Temple Jewellery Set', sku: 'SKU003', metal: 'Gold', purity: '22K', weight: '12.5', diamondWeight: '0', diamondShape: 'N/A', price: 89000, category: 'Bangles' },
  { _id: 'p4', name: 'Kundan Necklace', sku: 'SKU004', metal: 'Gold', purity: '22K', weight: '18.0', diamondWeight: '2.5', diamondShape: 'Pear', price: 125000, category: 'Necklaces' },
  { _id: 'p5', name: 'Silver Jhumkas', sku: 'SKU005', metal: 'Silver', purity: 'Sterling Silver', weight: '4.5', diamondWeight: '0', diamondShape: 'N/A', price: 8500, category: 'Earrings' },
]

export default function CreateQuotation() {
  const navigate = useNavigate()
  const location = useLocation()
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingQuotation, setEditingQuotation] = useState(null)
  const [hydratedFromState, setHydratedFromState] = useState(false)

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

  // When the route is reused for a different quotation, React reuses the
  // same component instance, so the useState initializers do not re-run.
  // This effect re-hydrates all local state from the incoming
  // `location.state.quotation` whenever the id changes, so editing a second
  // quotation never inherits the first one's items, customer, or notes.
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
      setHydratedFromState(false)
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
    setHydratedFromState(true)
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
        metal: '',
        purity: '',
        grossWeight: '',
        netWeight: '',
        stoneWeight: '',
        stoneType: '',
        metalRate: 0,
        makingCharges: 0,
        wastage: 0,
        stoneCharges: 0,
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
        updated[index].metal = selected.metal || selected.metalColor || ''
        updated[index].purity = selected.purity || ''
        updated[index].grossWeight = selected.weight || ''
        updated[index].netWeight = selected.weight || ''
        updated[index].stoneWeight = selected.diamondWeight || ''
        updated[index].stoneType = selected.diamondShape || ''
        updated[index].price = Number(selected.price) || 0
        const metalType = selected.metal || selected.metalColor || ''
        updated[index].metalRate = DEFAULT_METAL_RATES[metalType] || 0
        updated[index].makingCharges = 0
        updated[index].wastage = 0
        updated[index].stoneCharges = 0
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
          updated[index].metal = matched.metal || matched.metalColor || ''
          updated[index].purity = matched.purity || ''
          updated[index].grossWeight = matched.weight || ''
          updated[index].netWeight = matched.weight || ''
          updated[index].stoneWeight = matched.diamondWeight || ''
          updated[index].stoneType = matched.diamondShape || ''
          updated[index].price = Number(matched.price) || 0
          const metalType = matched.metal || matched.metalColor || ''
          updated[index].metalRate = DEFAULT_METAL_RATES[metalType] || 0
          updated[index].makingCharges = 0
          updated[index].wastage = 0
          updated[index].stoneCharges = 0
          updated[index].discount = 0
          updated[index].gst = DEFAULT_GST
        }
      }
    }

    const numericFields = ['metalRate', 'makingCharges', 'wastage', 'stoneCharges', 'quantity', 'discount', 'gst', 'price']
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
            'HSN': 'hsn',
            'HSN Code': 'hsn',
            'SKU': 'sku',
            'Metal': 'metal',
            'Purity': 'purity',
            'Gross Weight': 'grossWeight',
            'Net Weight': 'netWeight',
            'Stone Weight': 'stoneWeight',
            'Stone Type': 'stoneType',
            'Metal Rate': 'metalRate',
            'Making Charges': 'makingCharges',
            'Wastage': 'wastage',
            'Stone Charges': 'stoneCharges',
            'Discount': 'discount',
            'Discount %': 'discount',
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
            item.metalRate = parseNumber(item.metalRate) || 0
            item.makingCharges = parseNumber(item.makingCharges) || 0
            item.wastage = parseNumber(item.wastage) || 0
            item.stoneCharges = parseNumber(item.stoneCharges) || 0
            item.discount = parseNumber(item.discount) || 0
            item.gst = parseNumber(item.gst) || 18
            item.grossWeight = String(item.grossWeight || '')
            item.netWeight = String(item.netWeight || '')
            item.stoneWeight = String(item.stoneWeight || '')
            item.sku = String(item.sku || '')
            item.hsn = String(item.hsn || '')
            item.metal = String(item.metal || '')
            item.purity = String(item.purity || '')
            item.stoneType = String(item.stoneType || '')
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

  const calculations = items.reduce(
    (acc, item) => {
      const qty = item.quantity || 0
      const price = parseNumber(item.price) || 0
      const discountPercent = parseNumber(item.discount) || 0
      const gstPercent = parseNumber(item.gst) || 0

      const basePriceTotal = qty * price
      const discountAmount = basePriceTotal * (discountPercent / 100)
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

  // Build a fully-resolved quotation object from local state so the preview
  // modal always renders the current items, customer, and totals without
  // depending on a navigation-state cache from the parent list.
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

  const handlePrint = () => {
    window.print()
  }

  const generatePDF = async () => {
    const element = document.getElementById('quotation-preview')
    if (!element) return

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })

      const imgData = canvas.toDataURL('image/jpeg', 0.95)
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 10
      const imgWidth = pageWidth - margin * 2
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      pdf.addImage(imgData, 'JPEG', margin, margin, imgWidth, imgHeight)
      pdf.save(`Quotation-${quotationNumber}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    }
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

      {/* Quotation Preview Modal — receives a fully-resolved quotation
          derived from local state, not from props that could be stale. */}
      <QuotationPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quotation={previewQuotation}
      />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 10mm;
          }
          body * {
            visibility: hidden !important;
          }
          #quotation-preview, #quotation-preview * {
            visibility: visible !important;
          }
          #quotation-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #ffffff !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print-hide {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
