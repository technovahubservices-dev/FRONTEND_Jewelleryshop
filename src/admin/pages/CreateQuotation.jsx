import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { productAPI, quotationAPI } from '../../services/api'
import {
  parseNumber,
  calculateLineItem,
  hasAnyDiscount,
} from '../../utils/formatters'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'
import html2canvas from 'html2canvas'
import QuotationItemTable from './components/QuotationItemTable'
import QuotationSummary from './components/QuotationSummary'
import QuotationPreviewModal from './components/QuotationPreviewModal'
import ExcelImportPanel from './components/ExcelImportPanel'

const DEFAULT_GST = 18

const normalizeProduct = (raw) => {
  if (!raw) return null

  const get = (keys, fallback = '') => {
    for (const key of keys) {
      if (
        raw[key] !== undefined &&
        raw[key] !== null &&
        raw[key] !== ''
      ) {
        return raw[key]
      }
    }

    return fallback
  }

  return {
    _id: get(['_id', 'id']) || undefined,
    id: get(['_id', 'id']) || undefined,
    name: get(['name', 'Product Name']) || '',
    sku: get(['sku', 'SKU']) || '',
    SKU: get(['sku', 'SKU']) || '',
    metal: get(['metal', 'Metal']) || '',
    purity: get(['purity', 'Purity']) || '',
    weight: get(['weight', 'Weight']) || '',
    diamondWeight: get(['diamondWeight']) || '0',
    diamondShape: get(['diamondShape']) || 'N/A',
    price: Number(get(['price', 'Price']) || 0),
    discountPrice: Number(get(['discountPrice']) || 0),
    category: get(['category', 'Category']) || '',
  }
}

const normalizeQuotationItem = (item) => ({
  id: item?.id || item?._id || undefined,
  productId:
    item?.productId ||
    item?.product?._id ||
    item?.product?.id ||
    '',
  productName:
    item?.productName ||
    item?.product?.name ||
    item?.name ||
    '',
  sku:
    item?.sku ||
    item?.product?.sku ||
    '',
  qty: parseNumber(item?.qty ?? item?.quantity) || 1,
  price: parseNumber(item?.price) || 0,
  gst:
    item?.gst !== undefined && item?.gst !== null
      ? parseNumber(item.gst)
      : DEFAULT_GST,
  discount: parseNumber(item?.discount) || 0,
})

export default function CreateQuotation() {
  const navigate = useNavigate()
  const location = useLocation()

  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  const [productError, setProductError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  const [editingQuotation] = useState(
    location.state?.quotation || null
  )

  const initialCustomer =
    location.state?.quotation?.customer || {
      name: '',
      phone: '',
      email: '',
      address: '',
    }

  const initialItems = (
    location.state?.quotation?.items || []
  ).map(normalizeQuotationItem)

  const initialNotes =
    location.state?.quotation?.notes || ''

  const initialStatus =
    location.state?.quotation?.status || 'draft'

  const initialDate = location.state?.quotation?.date
    ? location.state.quotation.date.split('T')[0]
    : new Date().toISOString().split('T')[0]

  const initialValidUntil =
    location.state?.quotation?.validUntil
      ? location.state.quotation.validUntil.split('T')[0]
      : ''

  const initialQuotationNumber =
    location.state?.quotation?.quotationNumber || ''

  const [customer, setCustomer] = useState(initialCustomer)
  const [quotationNumber, setQuotationNumber] = useState(
    initialQuotationNumber
  )
  const [date] = useState(initialDate)
  const [validUntil, setValidUntil] =
    useState(initialValidUntil)
  const [items, setItems] = useState(initialItems)
  const [notes, setNotes] = useState(initialNotes)
  const [status, setStatus] = useState(initialStatus)
  const [skuErrors, setSkuErrors] = useState({})

  const [excelPreview, setExcelPreview] = useState([])
  const [excelError, setExcelError] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  /*
   * Load products only from backend.
   * No mock/fake products and no hardcoded prices.
   */
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true)
      setProductError('')

      try {
        const response = await productAPI.getAll({
          limit: 100,
        })

        const responseData = response?.data

        const rawProducts = Array.isArray(responseData?.data)
          ? responseData.data
          : Array.isArray(responseData)
            ? responseData
            : []

        const normalizedProducts = rawProducts
          .map((product) => {
            const transformed =
              typeof productAPI.transform === 'function'
                ? productAPI.transform(product)
                : product

            return normalizeProduct(transformed)
          })
          .filter(Boolean)

        setProducts(normalizedProducts)

        if (normalizedProducts.length === 0) {
          setProductError(
            'No products found in the backend.'
          )
        }
      } catch (error) {
        console.error(
          'Failed to load products:',
          error
        )

        setProducts([])
        setProductError(
          'Unable to load products from the backend.'
        )
      } finally {
        setLoadingProducts(false)
      }
    }

    fetchProducts()
  }, [])

  /*
   * Default quotation validity = 30 days.
   */
  useEffect(() => {
    if (!validUntil) {
      const futureDate = new Date()

      futureDate.setDate(
        futureDate.getDate() + 30
      )

      setValidUntil(
        futureDate.toISOString().split('T')[0]
      )
    }
  }, [validUntil])

  /*
   * Resolve existing quotation product information
   * from backend-loaded products when necessary.
   */
  useEffect(() => {
    if (
      products.length === 0 ||
      items.length === 0
    ) {
      return
    }

    let changed = false

    const updatedItems = items.map((item) => {
      if (!item.productId) {
        return item
      }

      const selected = products.find(
        (product) =>
          (product._id || product.id) ===
          item.productId
      )

      if (!selected) {
        return item
      }

      const nextItem = {
        ...item,
        productName:
          item.productName ||
          selected.name ||
          '',
        sku:
          item.sku ||
          selected.sku ||
          selected.SKU ||
          '',
      }

      /*
       * Do not overwrite a saved quotation price.
       * Only use backend product price when the
       * quotation does not already contain a price.
       */
      if (
        !Number.isFinite(Number(item.price)) ||
        Number(item.price) <= 0
      ) {
        nextItem.price =
  Number(selected.discountPrice) > 0
    ? Number(selected.discountPrice)
    : Number(selected.price) || 0
      }

      if (
        nextItem.productName !== item.productName ||
        nextItem.sku !== item.sku ||
        nextItem.price !== item.price
      ) {
        changed = true
      }

      return nextItem
    })

    if (changed) {
      setItems(updatedItems)
    }
  }, [products, items])

  const addItem = () => {
    setItems((previousItems) => [
      ...previousItems,
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
    setItems((previousItems) =>
      previousItems.filter(
        (_, itemIndex) => itemIndex !== index
      )
    )
  }

  const updateItem = (
    index,
    field,
    value
  ) => {
    setItems((previousItems) => {
      const updated = [...previousItems]

      updated[index] = {
        ...updated[index],
        [field]: value,
      }

      /*
       * Product selection.
       * Name, SKU and price always come from backend product data.
       */
      if (field === 'productId') {
        const selected = products.find(
          (product) =>
            (product._id || product.id) === value
        )

        if (selected) {
          updated[index] = {
            ...updated[index],
            productId:
              selected._id ||
              selected.id ||
              '',
            productName:
              selected.name || '',
            sku:
              selected.sku ||
              selected.SKU ||
              '',
            price:
  Number(selected.discountPrice) > 0
    ? Number(selected.discountPrice)
    : Number(selected.price) || 0,
            discount: 0,
            gst: DEFAULT_GST,
          }
        }
      }

      /*
       * SKU typed manually.
       * Try to match already-loaded backend products.
       */
      if (field === 'sku') {
        const trimmed =
          String(value || '').trim()

        if (trimmed) {
          const matched = products.find(
            (product) =>
              String(
                product.sku ||
                  product.SKU ||
                  ''
              ).toLowerCase() ===
              trimmed.toLowerCase()
          )

          if (matched) {
            updated[index] = {
              ...updated[index],
              productId:
                matched._id ||
                matched.id ||
                '',
              productName:
                matched.name || '',
              sku:
                matched.sku ||
                matched.SKU ||
                trimmed,
              price:
                Number(matched.price) || 0,
              discount: 0,
              gst: DEFAULT_GST,
            }
          }
        }
      }

      /*
       * Discount is percentage.
       * GST is percentage.
       */
      const numericFields = [
        'qty',
        'price',
        'gst',
        'discount',
      ]

      if (numericFields.includes(field)) {
        const numberValue = Number(value)

        updated[index][field] =
          Number.isFinite(numberValue)
            ? numberValue
            : 0
      }

      return updated
    })
  }

  /*
   * Backend SKU lookup.
   * This guarantees that the price is fetched
   * from the real Product document.
   */
  const handleSkuLookup = async (
    index,
    sku
  ) => {
    const trimmed =
      String(sku || '').trim()

    if (!trimmed) {
      setSkuErrors((previous) => {
        const copy = { ...previous }
        delete copy[index]
        return copy
      })

      return
    }

    const matchedLocal = products.find(
      (product) =>
        String(
          product.sku ||
            product.SKU ||
            ''
        ).toLowerCase() ===
        trimmed.toLowerCase()
    )

    if (matchedLocal) {
      setItems((previousItems) => {
        const updated = [...previousItems]

        updated[index] = {
          ...updated[index],
          productId:
            matchedLocal._id ||
            matchedLocal.id ||
            '',
          productName:
            matchedLocal.name || '',
          sku:
            matchedLocal.sku ||
            matchedLocal.SKU ||
            trimmed,
          price:
            Number(matchedLocal.price) || 0,
          discount: 0,
          gst: DEFAULT_GST,
        }

        return updated
      })

      setSkuErrors((previous) => {
        const copy = { ...previous }
        delete copy[index]
        return copy
      })

      return
    }

    try {
      const response =
        await productAPI.getBySku(trimmed)

      if (
        response.data?.success &&
        response.data?.data
      ) {
        const transformed =
          typeof productAPI.transform ===
          'function'
            ? productAPI.transform(
                response.data.data
              )
            : response.data.data

        const product =
          normalizeProduct(transformed)

        if (!product) {
          throw new Error(
            'Invalid product response'
          )
        }

        setItems((previousItems) => {
          const updated = [...previousItems]

          updated[index] = {
            ...updated[index],
            productId:
              product._id ||
              product.id ||
              '',
            productName:
              product.name || '',
            sku:
              product.sku ||
              product.SKU ||
              trimmed,
            price:
              Number(product.price) || 0,
            discount: 0,
            gst: DEFAULT_GST,
          }

          return updated
        })

        setSkuErrors((previous) => {
          const copy = { ...previous }
          delete copy[index]
          return copy
        })
      } else {
        throw new Error(
          'Product not found'
        )
      }
    } catch (error) {
      console.error(
        'SKU lookup failed:',
        error
      )

      setItems((previousItems) => {
        const updated = [...previousItems]

        updated[index] = {
          ...updated[index],
          productId: '',
          productName: '',
          sku: trimmed,
          price: 0,
        }

        return updated
      })

      setSkuErrors((previous) => ({
        ...previous,
        [index]:
          'SKU not found. Please check the SKU and try again.',
      }))
    }
  }

  /*
   * Excel upload.
   * Excel may contain price values, but those are treated
   * as imported quotation values, not fake product data.
   */
  const handleExcelUpload = async (
    file
  ) => {
    if (!file) return

    setIsUploading(true)
    setExcelError('')
    setExcelPreview([])

    try {
      const data =
        await readExcelFile(file)

      setExcelPreview(data)
    } catch (error) {
      console.error(
        'Excel parsing failed:',
        error
      )

      setExcelError(
        'Failed to parse Excel file. Please check the format.'
      )
    } finally {
      setIsUploading(false)
    }
  }

  const readExcelFile = (file) => {
    return new Promise(
      (resolve, reject) => {
        const reader =
          new FileReader()

        reader.onload = (
          event
        ) => {
          try {
            const binaryString =
              event.target.result

            const workbook =
              XLSX.read(
                binaryString,
                { type: 'binary' }
              )

            const sheetName =
              workbook.SheetNames[0]

            const worksheet =
              workbook.Sheets[
                sheetName
              ]

            const rawData =
              XLSX.utils.sheet_to_json(
                worksheet,
                { defval: '' }
              )

            if (
              !rawData ||
              rawData.length === 0
            ) {
              reject(
                new Error(
                  'Empty file'
                )
              )

              return
            }

            const columnMap = {
              'Product Name': 'name',
              Product: 'name',
              Item: 'name',
              Quantity: 'quantity',
              Qty: 'quantity',
              Price: 'price',
              Rate: 'price',
              'Unit Price': 'price',
              HSN: 'hsn',
              'HSN Code': 'hsn',
              SKU: 'sku',
              Metal: 'metal',
              Purity: 'purity',
              'Gross Weight':
                'grossWeight',
              'Net Weight':
                'netWeight',
              'Stone Weight':
                'stoneWeight',
              'Stone Type':
                'stoneType',
              'Metal Rate':
                'metalRate',
              'Making Charges':
                'makingCharges',
              Wastage: 'wastage',
              'Stone Charges':
                'stoneCharges',
              Discount: 'discount',
              'Discount %':
                'discount',
              GST: 'gst',
              'GST %': 'gst',
              'GST Percentage':
                'gst',
            }

            const normalizeKey = (
              key
            ) => {
              const trimmed =
                String(
                  key || ''
                ).trim()

              return (
                columnMap[trimmed] ||
                columnMap[
                  trimmed.toUpperCase()
                ] ||
                trimmed
                  .toLowerCase()
                  .replace(
                    /\s+/g,
                    ''
                  )
              )
            }

            const mappedItems =
              rawData.map(
                (
                  row,
                  index
                ) => {
                  const item = {
                    _row:
                      index + 2,
                  }

                  Object.keys(
                    row
                  ).forEach(
                    (key) => {
                      const normalized =
                        normalizeKey(
                          key
                        )

                      item[
                        normalized
                      ] =
                        row[key]
                    }
                  )

                  item.quantity =
                    parseNumber(
                      item.quantity
                    ) || 1

                  item.price =
                    parseNumber(
                      item.price
                    ) || 0

                  item.discount =
                    parseNumber(
                      item.discount
                    ) || 0

                  item.gst =
                    parseNumber(
                      item.gst
                    ) || DEFAULT_GST

                  item.sku =
                    String(
                      item.sku ||
                        ''
                    )

                  item.name =
                    String(
                      item.name ||
                        `Item ${
                          index + 1
                        }`
                    )

                  return item
                }
              )

            resolve(
              mappedItems
            )
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = () =>
          reject(
            new Error(
              'File read error'
            )
          )

        reader.readAsBinaryString(
          file
        )
      }
    )
  }

  const importExcelToQuotation = (
    importedItems
  ) => {
    if (
      !importedItems ||
      importedItems.length === 0
    ) {
      return
    }

    const normalizedItems =
      importedItems.map(
        (item) =>
          normalizeQuotationItem(
            item
          )
      )

    setItems(
      normalizedItems
    )

    setExcelPreview([])
    setExcelError('')
  }

  const removeExcelPreviewItem = (
    index
  ) => {
    setExcelPreview(
      (previous) =>
        previous.filter(
          (_, itemIndex) =>
            itemIndex !== index
        )
    )
  }

  const updateExcelPreviewItem = (
    index,
    field,
    value
  ) => {
    setExcelPreview(
      (previous) => {
        const updated = [
          ...previous,
        ]

        updated[index] = {
          ...updated[index],
          [field]: value,
        }

        return updated
      }
    )
  }

  /*
   * Frontend calculation uses the same
   * calculateLineItem() function everywhere.
   *
   * Discount = percentage.
   * GST = percentage.
   */
  const calculations =
    items.reduce(
      (accumulator, item) => {
        const {
          qty,
          basePriceTotal,
          discountAmount,
          gstAmount,
          lineTotal,
        } =
          calculateLineItem(
            item
          )

        accumulator.totalQuantity +=
          qty

        accumulator.totalGrossAmount +=
          basePriceTotal

        accumulator.totalDiscount +=
          discountAmount

        accumulator.totalGst +=
          gstAmount

        accumulator.grandTotal +=
          lineTotal

        return accumulator
      },
      {
        totalQuantity: 0,
        totalGrossAmount: 0,
        totalDiscount: 0,
        totalGst: 0,
        grandTotal: 0,
      }
    )

  /*
   * Save quotation to backend.
   */
  const handleSave = async (
    saveStatus
  ) => {
    if (!customer.name.trim()) {
      alert(
        'Please enter customer name.'
      )
      return
    }

    if (!validUntil) {
      alert(
        'Please select valid until date.'
      )
      return
    }

    if (items.length === 0) {
      alert(
        'Please add at least one product.'
      )
      return
    }

    const invalidItem =
      items.find(
        (item) =>
          !item.productName ||
          !item.sku ||
          Number(item.price) <= 0 ||
          Number(item.qty) <= 0
      )

    if (invalidItem) {
      alert(
        'Please select a valid product/SKU for every quotation item.'
      )
      return
    }

    setSaving(true)

    const quotationData = {
      customer: {
        name:
          customer.name.trim(),
        phone:
          customer.phone?.trim() || '',
        email:
          customer.email?.trim() || '',
        address:
          customer.address?.trim() || '',
      },

      validUntil,

      items: items.map(
        (item) => ({
          product:
            item.productId || null,
          productName:
            item.productName || '',
          sku:
            item.sku || '',
          qty:
            parseNumber(
              item.qty ??
                item.quantity
            ) || 0,
          price:
            parseNumber(
              item.price
            ) || 0,
          discount:
            parseNumber(
              item.discount
            ) || 0,
          gst:
            parseNumber(
              item.gst
            ) || DEFAULT_GST,
        })
      ),

      notes: notes || '',
      status: saveStatus,
    }

    if (
      editingQuotation?._id
    ) {
      quotationData.quotationNumber =
        editingQuotation.quotationNumber
    }

    try {
      let response

      if (
        editingQuotation?._id
      ) {
        response =
          await quotationAPI.update(
            editingQuotation._id,
            quotationData
          )
      } else {
        response =
          await quotationAPI.create(
            quotationData
          )
      }

      if (
        response?.data?.success
      ) {
        const savedQuotation =
          response.data.data

        setStatus(
          savedQuotation.status ||
            saveStatus
        )

        setQuotationNumber(
          savedQuotation.quotationNumber ||
            quotationNumber
        )

        navigate(
          '/admin/quotations',
          {
            state: {
              quotation:
                savedQuotation,
              action:
                editingQuotation
                  ? 'update'
                  : 'create',
            },
          }
        )
      } else {
        alert(
          response?.data?.message ||
            'Failed to save quotation'
        )
      }
    } catch (error) {
      console.error(
        'Quotation save failed:',
        error
      )

      alert(
        error.response?.data
          ?.message ||
          'Failed to save quotation'
      )
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

  /*
   * Download exactly the same A4 preview.
   */
  const generatePDF = async () => {
    const element =
      document.getElementById(
        'quotation-preview'
      )

    if (!element) {
      alert(
        'Quotation preview not found.'
      )
      return
    }

    try {
      const canvas =
        await html2canvas(
          element,
          {
            scale: 2,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor:
              '#ffffff',
            width:
              element.scrollWidth,
            height:
              element.scrollHeight,
            windowWidth:
              element.scrollWidth,
            windowHeight:
              element.scrollHeight,
          }
        )

      const imgData =
        canvas.toDataURL(
          'image/png'
        )

      const pdf =
        new jsPDF({
          orientation:
            'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true,
        })

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        210,
        297,
        undefined,
        'FAST'
      )

      const fileNumber =
        quotationNumber ||
        'Quotation'

      pdf.save(
        `${fileNumber}.pdf`
      )
    } catch (error) {
      console.error(
        'Failed to generate quotation PDF:',
        error
      )

      alert(
        'Failed to generate PDF. Please try again.'
      )
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">
            {editingQuotation
              ? 'Edit Quotation'
              : 'Create Quotation'}
          </h1>

          <p className="text-sm text-gray-500">
            {editingQuotation
              ? 'Update quotation details below.'
              : 'Fill in the details below to create a new quotation.'}
          </p>
        </div>
      </div>

      {productError && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg">
          {productError}
        </div>
      )}

      {loadingProducts && (
        <div className="bg-white border border-gray-100 rounded-lg px-4 py-3 text-sm text-gray-600">
          Loading products from backend...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">
                person
              </span>

              Customer Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  htmlFor="customerName"
                >
                  Customer Name
                </label>

                <input
                  id="customerName"
                  type="text"
                  required
                  value={customer.name}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      name: event.target
                        .value,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  htmlFor="phone"
                >
                  Phone
                </label>

                <input
                  id="phone"
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      phone: event.target
                        .value,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  htmlFor="email"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  required
                  value={customer.email}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      email: event.target
                        .value,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors"
                  placeholder="customer@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                  htmlFor="address"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  rows="3"
                  value={customer.address}
                  onChange={(event) =>
                    setCustomer({
                      ...customer,
                      address:
                        event.target
                          .value,
                    })
                  }
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors resize-y"
                  placeholder="Enter full address"
                />
              </div>
            </div>
          </div>

          {/* Excel Upload */}
          <ExcelImportPanel
            excelPreview={
              excelPreview
            }
            excelError={
              excelError
            }
            isUploading={
              isUploading
            }
            onUpload={
              handleExcelUpload
            }
            onImport={
              importExcelToQuotation
            }
            onRemovePreviewItem={
              removeExcelPreviewItem
            }
            onUpdatePreviewItem={
              updateExcelPreviewItem
            }
          />

          {/* Products */}
          <QuotationItemTable
            items={items}
            products={products}
            skuErrors={skuErrors}
            onAddItem={addItem}
            onRemoveItem={
              removeItem
            }
            onUpdateItem={
              updateItem
            }
            onSkuLookup={
              handleSkuLookup
            }
          />
        </div>

        {/* Summary */}
        <QuotationSummary
          calculations={
            calculations
          }
          quotationNumber={
            quotationNumber
          }
          date={date}
          validUntil={
            validUntil
          }
          notes={notes}
          saving={saving}
          itemCount={
            items.length
          }
          onSave={(
            saveStatus
          ) =>
            handleSave(
              saveStatus
            )
          }
          onPreview={
            handlePreview
          }
          onUpdateValidUntil={
            setValidUntil
          }
          onUpdateNotes={
            setNotes
          }
        />
      </div>

      {/* Quotation Preview */}
      <QuotationPreviewModal
        open={showPreview}
        onClose={() =>
          setShowPreview(false)
        }
        quotationNumber={
          quotationNumber
        }
        date={date}
        validUntil={
          validUntil
        }
        customer={
          customer
        }
        notes={notes}
        items={items}
        calculations={
          calculations
        }
        hasDiscount={hasAnyDiscount(
          items
        )}
        onGeneratePDF={
          generatePDF
        }
        onPrint={
          handlePrint
        }
      />

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }

          body * {
            visibility: hidden !important;
          }

          #quotation-preview,
          #quotation-preview * {
            visibility: visible !important;
          }

          #quotation-preview {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 10mm !important;
            background: #ffffff !important;
            box-sizing: border-box !important;
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