import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, quotationAPI } from '../../services/api'
import { parseNumber, calculateLineItem, hasAnyDiscount } from '../../utils/formatters'
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

const normalizeQuotationItem = (item) => ({
  id: item?.id || item?._id || undefined,
  productId: item?.productId || '',
  productName: item?.productName || item?.name || '',
  sku: item?.sku || '',
  qty: parseNumber(item?.qty ?? item?.quantity) || 1,
  price: parseNumber(item?.price) || 0,
  gst: parseNumber(item?.gst) || DEFAULT_GST,
  discount: parseNumber(item?.discount) || 0,
})

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
  const [editingQuotation, setEditingQuotation] = useState(location.state?.quotation || null)

  const initialCustomer = location.state?.quotation?.customer || { name: '', phone: '', email: '', address: '' }
  const initialItems = (location.state?.quotation?.items || []).map(normalizeQuotationItem)
  const initialNotes = location.state?.quotation?.notes || ''
  const initialStatus = location.state?.quotation?.status || 'draft'
  const initialDate = location.state?.quotation?.date ? location.state.quotation.date.split('T')[0] : new Date().toISOString().split('T')[0]
  const initialValidUntil = location.state?.quotation?.validUntil ? location.state.quotation.validUntil.split('T')[0] : ''
  const initialQuotationNumber = location.state?.quotation?.quotationNumber || `QT-2026-${String(Math.floor(Math.random() * 900) + 100)}`

  const [customer, setCustomer] = useState(initialCustomer)
  const [quotationNumber] = useState(initialQuotationNumber)
  const [date] = useState(initialDate)
  const [validUntil, setValidUntil] = useState(initialValidUntil)
  const [items, setItems] = useState(initialItems)
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState(initialStatus)

  const [excelPreview, setExcelPreview] = useState([])
  const [excelError, setExcelError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

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

  useEffect(() => {
    if (products.length === 0 || items.length === 0) return
    let changed = false
    const updated = items.map((item) => {
      if (item.productId && (!item.productName || !item.sku)) {
        const selected = products.find((p) => (p._id || p.id) === item.productId)
        if (selected) {
          changed = true
          return {
            ...item,
            productName: selected.name || item.productName,
            sku: selected.SKU || selected.sku || item.sku,
            price: Number(selected.price) || item.price,
          }
        }
      }
      return item
    })
    if (changed) {
      setItems(updated)
    }
  }, [products, items])

  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        productId: '',
        productName: '',
        sku: '',
        qty: 1,
        price: 0,
        gst: DEFAULT_GST,
        discount: 0,
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
        updated[index].productName = selected.name || ''
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
          updated[index].productName = matched.name || ''
          updated[index].price = Number(matched.price) || 0
          updated[index].discount = 0
          updated[index].gst = DEFAULT_GST
        }
      }
    }

    const numericFields = ['qty', 'price', 'gst', 'discount']
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

  const importExcelToQuotation = (importedItems) => {
    if (!importedItems || importedItems.length === 0) return
    const normalizedItems = importedItems.map((item) =>
      normalizeQuotationItem(item)
    )
    setItems(normalizedItems)
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
      const { qty, basePriceTotal, discountAmount, gstAmount, lineTotal } = calculateLineItem(item)

      acc.totalQuantity += qty
      acc.totalGrossAmount += basePriceTotal
      acc.totalDiscount += discountAmount
      acc.totalGst += gstAmount
      acc.grandTotal += lineTotal
      return acc
    },
    { totalQuantity: 0, totalGrossAmount: 0, totalDiscount: 0, totalGst: 0, grandTotal: 0 }
  )

  const handleSave = async (saveStatus) => {
    setSaving(true)
      const quotationData = {
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
        },
        validUntil,
        items: items.map((item) => ({
          productName: item.productName || '',
          sku: item.sku || '',
          qty: parseNumber(item.qty ?? item.quantity) || 0,
          price: parseNumber(item.price) || 0,
          gst: parseNumber(item.gst) || 0,
          discount: parseNumber(item.discount) || 0,
        })),
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

      {/* Quotation Preview Modal */}
      <QuotationPreviewModal
        open={showPreview}
        onClose={() => setShowPreview(false)}
        quotationNumber={quotationNumber}
        date={date}
        validUntil={validUntil}
        customer={customer}
        notes={notes}
        items={items}
        calculations={calculations}
        hasDiscount={hasAnyDiscount(items)}
        onGeneratePDF={generatePDF}
        onPrint={handlePrint}
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
