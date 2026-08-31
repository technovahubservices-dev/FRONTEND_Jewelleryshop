import { useRef } from 'react'

export const DualImageInput = ({ label, value, onChange, fileInputRef }) => {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-1">
        <label className="block font-label-caps text-xs text-on-surface-variant mb-1">{label}</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange({ type: 'url', value: e.target.value })}
            className="flex-1 px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
            placeholder="Enter image URL"
          />
          <input
            type="file"
            accept="image/*"
            onChange={async (e) => {
              const file = e.target.files[0]
              if (file) {
                const url = await fileInputRef.current.handleUpload(file)
                onChange({ type: 'url', value: url })
              }
            }}
            className="text-xs"
          />
        </div>
      </div>
      {(value || '') && value.trim() !== '' && (
        <div className="w-16 h-16 rounded overflow-hidden bg-surface-container-low border border-outline-variant/30 flex-shrink-0">
          <img
            src={value}
            alt="preview"
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}
    </div>
  )
}

export const Toast = ({ message, type, onClose }) => {
  if (!message) return null
  return (
    <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg font-body-md text-sm flex items-center gap-2 transition-all ${
      type === 'success' ? 'bg-primary-container text-primary-container-fg' : 'bg-error-container text-error-container-fg'
    }`}>
      <span className="material-symbols-outlined text-sm">
        {type === 'success' ? 'check_circle' : 'error'}
      </span>
      {message}
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  )
}

export const ListCardItem = ({ item, index, fields, onChange, onDelete, onToggle, toggleLabel = 'Active' }) => {
  return (
    <div className="p-4 bg-surface-white rounded-lg border border-outline-variant/50">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
        {fields.map((field) => (
          <div key={field.key} className={field.fullWidth ? 'md:col-span-6' : 'md:col-span-2'}>
            <label className="block font-label-caps text-xs text-on-surface-variant mb-1">{field.label}</label>
            {field.type === 'textarea' ? (
              <textarea
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                placeholder={field.placeholder || ''}
              />
            ) : field.type === 'number' ? (
              <input
                type="number"
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            ) : field.type === 'toggle' ? null : field.component ? (
              field.component(item[field.key], (val) => onChange(index, field.key, val))
            ) : (
              <input
                type={field.type || 'text'}
                value={item[field.key] || ''}
                onChange={(e) => onChange(index, field.key, e.target.value)}
                className="w-full px-3 py-2 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                placeholder={field.placeholder || ''}
              />
            )}
          </div>
        ))}

        <div className="md:col-span-6 flex items-end gap-4 pt-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`active-${index}`}
              checked={item.isActive !== undefined ? item.isActive : true}
              onChange={(e) => onToggle(index, e.target.checked)}
              className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
            />
            <label htmlFor={`active-${index}`} className="font-body-md text-sm text-on-surface cursor-pointer">
              {toggleLabel}
            </label>
          </div>
          <button
            type="button"
            onClick={() => onDelete(index)}
            className="p-2 text-error hover:bg-error/10 rounded transition-colors"
            title="Remove item"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}
