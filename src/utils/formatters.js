export const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const formatDateLong = (dateString) => {
  if (!dateString) return ''
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-'
  return `₹ ${Number(amount).toLocaleString('en-IN')}`
}

export const parseNumber = (value) => {
  if (typeof value === 'number') return value
  if (typeof value !== 'string') return 0
  const cleaned = value.replace(/[^0-9.\-]/g, '')
  const num = parseFloat(cleaned)
  return Number.isFinite(num) ? num : 0
}

export const calculateLineItem = (item) => {
  const qty = parseNumber(item.qty ?? item.quantity) || 0
  const price = parseNumber(item.price) || 0
  const discountAmount = parseNumber(item.discount) || 0
  const gstPercent = parseNumber(item.gst) || 0

  const basePriceTotal = qty * price
  const taxableValue = Math.max(0, basePriceTotal - discountAmount)
  const gstAmount = taxableValue * (gstPercent / 100)
  const lineTotal = taxableValue + gstAmount

  return {
    qty,
    price,
    discountAmount,
    gstPercent,
    basePriceTotal,
    taxableValue,
    gstAmount,
    lineTotal,
  }
}

export const hasAnyDiscount = (items) =>
  items.some((item) => (parseNumber(item.discount) || 0) > 0)
