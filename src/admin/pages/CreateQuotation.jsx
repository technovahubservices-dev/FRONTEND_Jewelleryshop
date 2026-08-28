import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, quotationAPI } from '../../services/api'
import logo from '../../assets/icons/logo.jpeg'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

const DEFAULT_GST = 18

const DEFAULT_METAL_RATES = {
  Gold: 8500,
  Silver: 850,
  Platinum: 4200,
  'Rose Gold': 8700,
  'White Gold': 8600,
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
  const [editingQuotation, setEditingQuotation] = useState(location.state?.quotation || null)

  const initialCustomer = location.state?.quotation?.customer || { name: '', phone: '', email: '', address: '' }
  const initialItems = location.state?.quotation?.items || []
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
      if (item.productId && (!item.name || !item.sku)) {
        const selected = products.find((p) => (p._id || p.id) === item.productId)
        if (selected) {
          changed = true
          return {
            ...item,
            name: selected.name || item.name,
            sku: selected.SKU || selected.sku || item.sku,
            metal: selected.metal || selected.metalColor || item.metal,
            purity: selected.purity || item.purity,
            grossWeight: selected.weight || item.grossWeight,
            netWeight: selected.weight || item.netWeight,
            stoneWeight: selected.diamondWeight || item.stoneWeight,
            stoneType: selected.diamondShape || item.stoneType,
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
        const metalType = selected.metal || selected.metalColor || ''
        updated[index].metalRate = DEFAULT_METAL_RATES[metalType] || 0
        updated[index].makingCharges = 0
        updated[index].wastage = 0
        updated[index].stoneCharges = 0
        updated[index].discount = 0
        updated[index].gst = DEFAULT_GST
      }
    }

    const numericFields = ['metalRate', 'makingCharges', 'wastage', 'stoneCharges', 'quantity', 'discount', 'gst']
    if (numericFields.includes(field)) {
      updated[index][field] = Number(value) || 0
    }

    setItems(updated)
  }

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0]
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
      e.target.value = ''
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
            'GST': 'gst',
            'GST %': 'gst',
          }

          const normalizeKey = (key) => {
            const trimmed = String(key || '').trim()
            return columnMap[trimmed] || trimmed.toLowerCase().replace(/\s+/g, '')
          }

          const mappedItems = rawData.map((row, index) => {
            const item = { _row: index + 2 }
            Object.keys(row).forEach((key) => {
              const normalized = normalizeKey(key)
              item[normalized] = row[key]
            })

            item.quantity = Number(item.quantity) || 1
            item.price = Number(item.price) || 0
            item.metalRate = Number(item.metalRate) || 0
            item.makingCharges = Number(item.makingCharges) || 0
            item.wastage = Number(item.wastage) || 0
            item.stoneCharges = Number(item.stoneCharges) || 0
            item.discount = Number(item.discount) || 0
            item.gst = Number(item.gst) || 18
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
    const importedItems = excelPreview.map((item) => ({
      productId: '',
      name: item.name || '',
      sku: item.sku || '',
      hsn: item.hsn || '',
      metal: item.metal || '',
      purity: item.purity || '',
      grossWeight: item.grossWeight || '',
      netWeight: item.netWeight || '',
      stoneWeight: item.stoneWeight || '',
      stoneType: item.stoneType || '',
      metalRate: Number(item.metalRate) || 0,
      makingCharges: Number(item.makingCharges) || 0,
      wastage: Number(item.wastage) || 0,
      stoneCharges: Number(item.stoneCharges) || 0,
      quantity: Number(item.quantity) || 1,
      discount: Number(item.discount) || 0,
      gst: Number(item.gst) || 18,
    }))
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
      const metalRate = Number(item.metalRate) || 0
      const netWeight = Number(item.netWeight) || 0
      const makingCharges = Number(item.makingCharges) || 0
      const wastage = Number(item.wastage) || 0
      const stoneCharges = Number(item.stoneCharges) || 0
      const discount = Number(item.discount) || 0
      const gst = Number(item.gst) || 0

      const metalValue = metalRate * netWeight
      const subtotal = metalValue + makingCharges + wastage + stoneCharges
      const taxableAmount = Math.max(0, subtotal - discount)
      const gstAmount = taxableAmount * (gst / 100)
      const lineTotal = taxableAmount + gstAmount

      acc.subtotal += subtotal
      acc.metalValue += metalValue
      acc.makingCharges += makingCharges
      acc.wastage += wastage
      acc.stoneCharges += stoneCharges
      acc.discount += discount
      acc.gst += gstAmount
      acc.total += lineTotal
      return acc
    },
    { subtotal: 0, metalValue: 0, makingCharges: 0, wastage: 0, stoneCharges: 0, discount: 0, gst: 0, total: 0 }
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
        productId: item.productId || '',
        name: item.name,
        sku: item.sku,
        hsn: item.hsn,
        metal: item.metal,
        purity: item.purity,
        grossWeight: item.grossWeight,
        netWeight: item.netWeight,
        stoneWeight: item.stoneWeight,
        stoneType: item.stoneType,
        metalRate: Number(item.metalRate) || 0,
        makingCharges: Number(item.makingCharges) || 0,
        wastage: Number(item.wastage) || 0,
        stoneCharges: Number(item.stoneCharges) || 0,
        quantity: Number(item.quantity) || 1,
        discount: Number(item.discount) || 0,
        gst: Number(item.gst) || 0,
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

  const generatePDF = () => {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.getWidth()
    const margin = 15
    let y = 20

    doc.setFontSize(18)
    doc.setFont('helvetica', 'bold')
    doc.text('JKR Jewellery', margin, y)
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text('Crafting timeless elegance since 2017', margin, y)
    y += 10

    doc.setDrawColor(21, 59, 45)
    doc.setLineWidth(0.5)
    doc.line(margin, y, pageWidth - margin, y)
    y += 8

    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text('QUOTATION', pageWidth - margin, y, { align: 'right' })
    y += 6
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(`Quotation Number: ${quotationNumber}`, pageWidth - margin, y, { align: 'right' })
    y += 12

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.text('Quotation Details', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`Date: ${date}`, margin, y)
    doc.text(`Valid Until: ${validUntil}`, pageWidth / 2, y)
    y += 10

    doc.setFont('helvetica', 'bold')
    doc.text('Customer Details', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.text(`Name: ${customer.name || '-'}`, margin, y)
    doc.text(`Phone: ${customer.phone || '-'}`, pageWidth / 2, y)
    y += 6
    doc.text(`Email: ${customer.email || '-'}`, margin, y)
    y += 10

    if (customer.address) {
      doc.setFont('helvetica', 'bold')
      doc.text('Address', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const addressLines = doc.splitTextToSize(customer.address, pageWidth - 2 * margin)
      doc.text(addressLines, margin, y)
      y += addressLines.length * 6 + 8
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Products', margin, y)
    y += 4

    const tableColumn = ['Product', 'SKU', 'Metal', 'Purity', 'Qty', 'Price', 'Discount', 'GST', 'Total']
    const tableRows = items.map((item) => {
      const qty = item.quantity || 0
      const metalRate = Number(item.metalRate) || 0
      const netWeight = Number(item.netWeight) || 0
      const makingCharges = Number(item.makingCharges) || 0
      const wastage = Number(item.wastage) || 0
      const stoneCharges = Number(item.stoneCharges) || 0
      const discount = Number(item.discount) || 0
      const gst = Number(item.gst) || 0

      const metalValue = metalRate * netWeight
      const subtotal = metalValue + makingCharges + wastage + stoneCharges
      const taxableAmount = Math.max(0, subtotal - discount)
      const gstAmount = taxableAmount * (gst / 100)
      const lineTotal = taxableAmount + gstAmount
      return [
        item.name || '-',
        item.sku || '-',
        item.metal || '-',
        item.purity || '-',
        qty.toString(),
        `₹ ${subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        `₹ ${discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
        `${gst}%`,
        `₹ ${lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
      ]
    })

    autoTable(doc, {
      startY: y,
      head: [tableColumn],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [21, 59, 45], textColor: 255, fontSize: 9 },
      bodyStyles: { fontSize: 9 },
      margin: { left: margin, right: margin },
    })

    y = doc.lastAutoTable.finalY + 10

    doc.setFont('helvetica', 'bold')
    doc.text('Grand Total', margin, y)
    doc.setFont('helvetica', 'normal')
    doc.text(`₹ ${calculations.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, pageWidth - margin, y, { align: 'right' })
    y += 12

    if (notes) {
      doc.setFont('helvetica', 'bold')
      doc.text('Notes', margin, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const noteLines = doc.splitTextToSize(notes, pageWidth - 2 * margin)
      doc.text(noteLines, margin, y)
      y += noteLines.length * 6 + 8
    }

    doc.setFont('helvetica', 'bold')
    doc.text('Terms & Conditions', margin, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const terms = [
      '1. This quotation is valid for 30 days from the date of issue.',
      '2. Prices are subject to change based on market gold rates.',
      '3. GST is calculated as per current applicable rates.',
      '4. Making charges and wastage are approximate and may vary.',
      '5. Payment must be made in full before dispatch.',
    ]
    terms.forEach((term) => {
      const termLines = doc.splitTextToSize(term, pageWidth - 2 * margin)
      doc.text(termLines, margin, y)
      y += termLines.length * 6
    })

    y += 20
    doc.setDrawColor(150)
    doc.line(margin, y, margin + 70, y)
    doc.line(pageWidth - margin - 70, y, pageWidth - margin, y)
    y += 6
    doc.setFontSize(9)
    doc.text('Authorized Signature', margin + 35, y, { align: 'center' })
    doc.text('Customer Signature', pageWidth - margin - 35, y, { align: 'center' })

    doc.save(`Quotation-${quotationNumber}.pdf`)
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
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined">upload_file</span>
              Import from Excel
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Upload an <strong>.xlsx</strong> or <strong>.csv</strong> file with columns like Product Name, Quantity, Price, HSN, Metal, Purity, etc.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 items-start">
              <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded cursor-pointer hover:bg-primary-container transition-colors">
                <span className="material-symbols-outlined text-[16px]">file_upload</span>
                Choose Excel File
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </label>
              {isUploading && <span className="text-sm text-on-surface-variant">Parsing file...</span>}
            </div>
            {excelError && <p className="text-sm text-error mt-2">{excelError}</p>}

            {excelPreview.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-charcoal-text">Preview ({excelPreview.length} items)</h3>
                  <button onClick={importExcelToQuotation} className="inline-flex items-center gap-2 px-4 py-2 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded hover:bg-primary-container transition-colors">
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Import to Quotation
                  </button>
                </div>
                <div className="overflow-x-auto border border-outline-variant/30 rounded-lg">
                  <table className="w-full text-left border-collapse min-w-[800px]">
                    <thead>
                      <tr className="bg-surface-container-low border-b border-outline-variant">
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Row</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Product Name</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Qty</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Price</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Metal</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">Purity</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider">GST</th>
                        <th className="py-2 px-3 text-[11px] font-label-caps text-on-surface-variant uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                      {excelPreview.map((item, index) => (
                        <tr key={index} className="bg-surface-white">
                          <td className="py-2 px-3 text-xs text-on-surface-variant">{item._row}</td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateExcelPreviewItem(index, 'name', e.target.value)}
                              className="w-full bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateExcelPreviewItem(index, 'quantity', e.target.value)}
                              className="w-20 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => updateExcelPreviewItem(index, 'price', e.target.value)}
                              className="w-28 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.metal}
                              onChange={(e) => updateExcelPreviewItem(index, 'metal', e.target.value)}
                              className="w-24 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="text"
                              value={item.purity}
                              onChange={(e) => updateExcelPreviewItem(index, 'purity', e.target.value)}
                              className="w-20 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={item.gst}
                              onChange={(e) => updateExcelPreviewItem(index, 'gst', e.target.value)}
                              className="w-16 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                            />
                          </td>
                          <td className="py-2 px-3 text-right">
                            <button
                              onClick={() => removeExcelPreviewItem(index)}
                              className="p-1.5 text-on-surface-variant hover:text-error transition-colors"
                              title="Remove"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Products */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline-md text-headline-md text-deep-emerald flex items-center gap-2">
                <span className="material-symbols-outlined">shopping_bag</span>
                Products
              </h2>
              <button onClick={addItem} className="inline-flex items-center gap-2 px-4 py-2 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded hover:bg-primary-container transition-colors">
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
                      <button onClick={() => removeItem(index)} className="p-1.5 text-on-surface-variant hover:text-error transition-colors" title="Remove">
                        <span className="material-symbols-outlined text-[18px]">delete</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Product Name</label>
                        <select value={item.productId} onChange={(e) => updateItem(index, 'productId', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors">
                          <option value="">Select product</option>
                          {products.map((p) => (
                            <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">SKU</label>
                        <input type="text" value={item.sku} onChange={(e) => updateItem(index, 'sku', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Qty</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(index, 'quantity', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Metal Type</label>
                        <input type="text" value={item.metal} onChange={(e) => updateItem(index, 'metal', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Purity</label>
                        <input type="text" value={item.purity} onChange={(e) => updateItem(index, 'purity', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Gross Weight (g)</label>
                        <input type="number" min="0" step="0.01" value={item.grossWeight} onChange={(e) => updateItem(index, 'grossWeight', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Net Weight (g)</label>
                        <input type="number" min="0" step="0.01" value={item.netWeight} onChange={(e) => updateItem(index, 'netWeight', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Stone Weight (cts)</label>
                        <input type="number" min="0" step="0.01" value={item.stoneWeight} onChange={(e) => updateItem(index, 'stoneWeight', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Stone Type</label>
                        <input type="text" value={item.stoneType} onChange={(e) => updateItem(index, 'stoneType', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="Auto-filled" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Metal Rate (₹/g)</label>
                        <input type="number" min="0" step="0.01" value={item.metalRate} onChange={(e) => updateItem(index, 'metalRate', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Making Charges (₹)</label>
                        <input type="number" min="0" step="0.01" value={item.makingCharges} onChange={(e) => updateItem(index, 'makingCharges', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Wastage (₹)</label>
                        <input type="number" min="0" step="0.01" value={item.wastage} onChange={(e) => updateItem(index, 'wastage', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Stone Charges (₹)</label>
                        <input type="number" min="0" step="0.01" value={item.stoneCharges} onChange={(e) => updateItem(index, 'stoneCharges', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">Discount (₹)</label>
                        <input type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateItem(index, 'discount', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="0" />
                      </div>
                      <div>
                        <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2 text-[11px]">GST (%)</label>
                        <input type="number" min="0" max="100" value={item.gst} onChange={(e) => updateItem(index, 'gst', e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" placeholder="18" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Summary */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6">Quotation Details</h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Quotation Number</p>
                <p className="text-sm font-body-md text-charcoal-text font-medium">{quotationNumber}</p>
              </div>
              <div>
                <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Date</p>
                <p className="text-sm font-body-md text-charcoal-text">{date}</p>
              </div>
              <div>
                <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Valid Until</p>
                <input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors" />
              </div>
              <div>
                <p className="text-xs font-label-caps text-on-surface-variant uppercase tracking-wider mb-1">Notes</p>
                <textarea rows="4" value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-surface border border-outline-variant rounded-none px-3 py-2.5 text-sm font-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors resize-y" placeholder="Additional notes..."></textarea>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-4">Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Metal Value</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.metalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Making Charges</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.makingCharges.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Wastage</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.wastage.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Stone Charges</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.stoneCharges.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Subtotal</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Discount</span>
                <span className="text-charcoal-text font-medium">- ₹ {calculations.discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">GST</span>
                <span className="text-charcoal-text font-medium">₹ {calculations.gst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
              <div className="border-t border-outline-variant pt-3 flex justify-between items-center">
                <span className="text-sm font-semibold text-charcoal-text">Grand Total</span>
                <span className="text-lg font-bold text-deep-emerald">₹ {calculations.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button onClick={() => handleSave('draft')} disabled={saving || items.length === 0} className="w-full py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button onClick={handlePreview} disabled={items.length === 0} className="w-full py-3 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Preview
            </button>
            <button onClick={() => handleSave('sent')} disabled={saving || items.length === 0} className="w-full py-3 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
              {saving ? 'Saving...' : 'Save Quotation'}
            </button>
          </div>
        </div>
      </div>

      {/* Quotation Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto p-4 md:p-8">
          <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl my-8">
            <div className="p-8 md:p-12" id="quotation-preview">
              {/* Header */}
              <div className="flex items-start justify-between border-b-2 border-deep-emerald pb-6 mb-8">
                <div className="flex items-center gap-4">
                  <img src={logo} alt="JKR" className="w-16 h-16 object-contain" />
                  <div>
                    <h1 className="text-2xl font-playfair font-bold text-deep-emerald">JKR Jewellery</h1>
                    <p className="text-xs text-gray-500 mt-1">Crafting timeless elegance since 2017</p>
                  </div>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold text-deep-emerald">QUOTATION</h2>
                  <p className="text-sm text-gray-600 mt-1">{quotationNumber}</p>
                </div>
              </div>

              {/* Meta Info */}
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Quotation Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Date:</span>
                      <span className="text-gray-900 font-medium">{date}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Valid Until:</span>
                      <span className="text-gray-900 font-medium">{validUntil}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Name:</span>
                      <span className="text-gray-900 font-medium">{customer.name || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Phone:</span>
                      <span className="text-gray-900 font-medium">{customer.phone || '-'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 font-medium">{customer.email || '-'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address */}
              {customer.address && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Address</h3>
                  <p className="text-sm text-gray-700">{customer.address}</p>
                </div>
              )}

              {/* Products Table */}
              <div className="mb-8">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Products</h3>
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-deep-emerald text-white">
                      <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">Product</th>
                      <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">SKU</th>
                      <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">Metal</th>
                      <th className="py-2.5 px-3 text-left text-xs font-bold uppercase tracking-wider">Purity</th>
                      <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Qty</th>
                      <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Price</th>
                      <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Discount</th>
                      <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">GST</th>
                      <th className="py-2.5 px-3 text-right text-xs font-bold uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {items.map((item, index) => {
                      const qty = item.quantity || 0
                      const metalRate = Number(item.metalRate) || 0
                      const netWeight = Number(item.netWeight) || 0
                      const makingCharges = Number(item.makingCharges) || 0
                      const wastage = Number(item.wastage) || 0
                      const stoneCharges = Number(item.stoneCharges) || 0
                      const discount = Number(item.discount) || 0
                      const gst = Number(item.gst) || 0

                      const metalValue = metalRate * netWeight
                      const subtotal = metalValue + makingCharges + wastage + stoneCharges
                      const taxableAmount = Math.max(0, subtotal - discount)
                      const gstAmount = taxableAmount * (gst / 100)
                      const lineTotal = taxableAmount + gstAmount

                      return (
                        <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="py-3 px-3 text-sm text-gray-900 font-medium">{item.name || '-'}</td>
                          <td className="py-3 px-3 text-sm text-gray-600">{item.sku || '-'}</td>
                          <td className="py-3 px-3 text-sm text-gray-600">{item.metal || '-'}</td>
                          <td className="py-3 px-3 text-sm text-gray-600">{item.purity || '-'}</td>
                          <td className="py-3 px-3 text-sm text-gray-600 text-right">{qty}</td>
                          <td className="py-3 px-3 text-sm text-gray-600 text-right">₹ {subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-3 text-sm text-gray-600 text-right">₹ {discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                          <td className="py-3 px-3 text-sm text-gray-600 text-right">{gst}%</td>
                          <td className="py-3 px-3 text-sm text-deep-emerald font-semibold text-right">₹ {lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end mb-8">
                <div className="w-72">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span className="text-gray-900 font-medium">₹ {calculations.subtotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Discount</span>
                      <span className="text-gray-900 font-medium">- ₹ {calculations.discount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">GST</span>
                      <span className="text-gray-900 font-medium">₹ {calculations.gst.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="border-t-2 border-deep-emerald pt-2 flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Grand Total</span>
                      <span className="text-xl font-bold text-deep-emerald">₹ {calculations.total.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {notes && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Notes</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{notes}</p>
                </div>
              )}

              {/* Terms & Conditions */}
              <div className="mb-12">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Terms & Conditions</h3>
                <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
                  <li>This quotation is valid for 30 days from the date of issue.</li>
                  <li>Prices are subject to change based on market gold rates.</li>
                  <li>GST is calculated as per current applicable rates.</li>
                  <li>Making charges and wastage are approximate and may vary.</li>
                  <li>Payment must be made in full before dispatch.</li>
                </ul>
              </div>

              {/* Signature */}
              <div className="flex justify-between items-end mt-8 pt-8 border-t border-gray-200">
                <div className="text-center">
                  <div className="border-b border-gray-400 w-48 mb-2"></div>
                  <p className="text-xs text-gray-500">Authorized Signature</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-gray-400 w-48 mb-2"></div>
                  <p className="text-xs text-gray-500">Customer Signature</p>
                </div>
              </div>
            </div>

            {/* Print Actions */}
            <div className="sticky bottom-0 bg-gray-100 border-t border-gray-200 p-4 flex justify-end gap-3 print-hide">
              <button onClick={() => setShowPreview(false)} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors">
                Close
              </button>
              <button onClick={generatePDF} className="px-6 py-2.5 bg-deep-emerald text-surface-white text-sm font-semibold hover:bg-regal-gold transition-colors shadow-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">download</span>
                Download PDF
              </button>
              <button onClick={handlePrint} className="px-6 py-2.5 border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">print</span>
                Print
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #quotation-preview, #quotation-preview * {
            visibility: visible;
          }
          #quotation-preview {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20mm;
          }
          .print-hide {
            display: none !important;
          }
          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </div>
  )
}
