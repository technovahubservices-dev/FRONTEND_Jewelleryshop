import { useState } from 'react'
import * as XLSX from 'xlsx'
import { parseNumber } from '../../../utils/formatters'

const DEFAULT_GST = 18

export default function ExcelImportPanel({ onImport, excelPreview, excelError, isUploading, onUpload, onRemovePreviewItem, onUpdatePreviewItem }) {
  const [localError, setLocalError] = useState('')

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setLocalError('')
    onUpload(file)
    e.target.value = ''
  }

  const handleImport = () => {
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
      metalRate: parseNumber(item.metalRate) || 0,
      makingCharges: parseNumber(item.makingCharges) || 0,
      wastage: parseNumber(item.wastage) || 0,
      stoneCharges: parseNumber(item.stoneCharges) || 0,
      quantity: parseNumber(item.quantity) || 1,
      discount: parseNumber(item.discount) || 0,
      gst: parseNumber(item.gst) || DEFAULT_GST,
      price: parseNumber(item.price) || 0,
    }))
    onImport(importedItems)
  }

  const handleRemove = (index) => {
    onRemovePreviewItem(index)
  }

  const handleUpdate = (index, field, value) => {
    onUpdatePreviewItem(index, field, value)
  }

  return (
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
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        {isUploading && <span className="text-sm text-on-surface-variant">Parsing file...</span>}
      </div>
      {(excelError || localError) && <p className="text-sm text-error mt-2">{excelError || localError}</p>}

      {excelPreview.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-charcoal-text">Preview ({excelPreview.length} items)</h3>
            <button onClick={handleImport} className="inline-flex items-center gap-2 px-4 py-2 bg-deep-emerald text-surface-white text-xs font-label-caps uppercase tracking-wider rounded hover:bg-primary-container transition-colors">
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
                        onChange={(e) => handleUpdate(index, 'name', e.target.value)}
                        className="w-full bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdate(index, 'quantity', e.target.value)}
                        className="w-20 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.price}
                        onChange={(e) => handleUpdate(index, 'price', e.target.value)}
                        className="w-28 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.metal}
                        onChange={(e) => handleUpdate(index, 'metal', e.target.value)}
                        className="w-24 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.purity}
                        onChange={(e) => handleUpdate(index, 'purity', e.target.value)}
                        className="w-20 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={item.gst}
                        onChange={(e) => handleUpdate(index, 'gst', e.target.value)}
                        className="w-16 bg-transparent border-b border-outline-variant px-0 py-1 text-sm focus:outline-none focus:border-deep-emerald"
                      />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => handleRemove(index)}
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
  )
}
