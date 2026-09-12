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
  if (amount === null || amount === undefined || amount === '') {
    return '-'
  }

  const number = Number(amount)

  if (!Number.isFinite(number)) {
    return '-'
  }

  return `₹ ${number.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
  })}`
}

export const parseNumber = (value) => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value !== 'string') {
    return 0
  }

  const cleaned = value.replace(/[^0-9.\-]/g, '')
  const number = parseFloat(cleaned)

  return Number.isFinite(number) ? number : 0
}

export const calculateLineItem = (item = {}) => {
  const qty = parseNumber(item.qty ?? item.quantity)
  const price = parseNumber(item.price)
  const discountPercent = parseNumber(item.discount)
  const gstPercent = parseNumber(item.gst)

  const basePriceTotal = qty * price

  const discountAmount =
    basePriceTotal * (discountPercent / 100)

  const taxableValue = Math.max(
    0,
    basePriceTotal - discountAmount
  )

  const gstAmount =
    taxableValue * (gstPercent / 100)

  const lineTotal =
    taxableValue + gstAmount

  return {
    qty,
    price,
    discountPercent,
    discountAmount,
    gstPercent,
    basePriceTotal,
    taxableValue,
    gstAmount,
    lineTotal,
  }
}

export const hasAnyDiscount = (items = []) =>
  items.some(
    (item) => parseNumber(item.discount) > 0
  )