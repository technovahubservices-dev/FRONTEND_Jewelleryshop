import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { dashboardAPI } from '../../services/api'
import { resolveImageUrl } from '../../utils/apiUrl'

const KPI_CARD_BASE = 'bg-surface-white p-5 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-28 relative overflow-hidden group'
const KPI_TITLE = 'font-label-caps text-label-caps text-outline z-10'
const KPI_VALUE = 'font-headline-md text-headline-md text-deep-emerald z-10 mt-auto'

const DATE_FILTERS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'week', label: 'Last 7 Days' },
  { value: 'last_30_days', label: 'Last 30 Days' },
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'custom', label: 'Custom Range' },
]

const CHART_COLORS = {
  revenue: '#D4AF37',
  orders: '#013220',
}

const CHART_LEGEND = ['#013220', '#D4AF37', '#735c00', '#e3e2e0']

const MiniBarChart = ({ data, color = '#D4AF37' }) => {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const height = 60
  return (
    <div className="flex items-end gap-1 h-[60px] w-full">
      {data.map((d, i) => {
        const h = (d.value / max) * height
        return (
          <div
            key={i}
            className="flex-1 rounded-sm transition-all duration-300 hover:opacity-80"
            style={{ height: `${h}px`, backgroundColor: color }}
            title={`${d.label}: ${d.value}`}
          />
        )
      })}
    </div>
  )
}

const DonutChart = ({ data, colors = CHART_LEGEND }) => {
  if (!data || data.length === 0) return null
  const safeData = data.map(d => ({
    label: d.label || d.name || 'Unknown',
    value: Number(d.value) || 0,
  }))
  const total = safeData.reduce((sum, d) => sum + d.value, 0)
  let cumulative = 0
  const segments = safeData.map((d, i) => {
    const start = cumulative
    cumulative += d.value
    return { ...d, start, end: cumulative, color: colors[i % colors.length] }
  })

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const segmentsWithDash = segments.map((seg) => {
    const dash = total > 0 ? (seg.value / total) * circumference : 0
    const offset = total > 0 ? (seg.start / total) * circumference : 0
    return { ...seg, dash, offset }
  })

  return (
    <div className="flex items-center gap-4 flex-wrap">
      <div className="relative flex-shrink-0">
        <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
          {segmentsWithDash.map((seg, i) => (
            seg.value > 0 ? (
              <circle
                key={i}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="16"
                strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
                strokeDashoffset={-seg.offset}
                title={`${seg.label}: ${formatCurrency(seg.value)} (${((seg.value / (total || 1)) * 100).toFixed(1)}%)`}
              />
            ) : null
          ))}
        </svg>
        {total > 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-label-caps text-[10px] text-on-surface-variant">Total</span>
            <span className="font-headline-md text-deep-emerald">{formatCurrency(total)}</span>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 text-xs min-w-[140px]">
        {safeData.map((d, i) => {
          const pct = total > 0 ? ((d.value / total) * 100).toFixed(1) : '0.0'
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
              <span className="text-on-surface-variant max-w-[140px] truncate" title={d.label}>{d.label}</span>
              <span className="text-deep-emerald font-medium">{d.value}</span>
              <span className="text-on-surface-variant font-medium">({pct}%)</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const statusDisplayMap = {
  pending_payment: 'Pending Payment',
  new: 'New',
  confirmed: 'Confirmed',
  payment_received: 'Payment Received',
  processing: 'Processing',
  manufacturing: 'Manufacturing',
  quality_check: 'Quality Check',
  packed: 'Packed',
  shipped: 'Shipped',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
}

const statusBadge = (status) => {
  const configs = {
    pending_payment: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
    new: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
    confirmed: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
    payment_received: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', dot: 'bg-regal-gold' },
    processing: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', dot: 'bg-regal-gold' },
    manufacturing: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', dot: 'bg-regal-gold' },
    quality_check: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', dot: 'bg-regal-gold' },
    packed: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
    shipped: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
    out_for_delivery: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
    delivered: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
    cancelled: { bg: 'bg-error-container/20', text: 'text-error', dot: 'bg-error' },
  }
  const cfg = configs[status] || configs.new
  const label = statusDisplayMap[status] || (status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown')
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} border border-outline-variant/20`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
      {label}
    </span>
  )
}

const paymentBadge = (status) => {
  const configs = {
    pending: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant' },
    paid: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant' },
    failed: { bg: 'bg-error-container/20', text: 'text-error' },
    refunded: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant' },
    partially_refunded: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant' },
  }
  const cfg = configs[status] || configs.pending
  const label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} border border-outline-variant/20`}>
      {label}
    </span>
  )
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '-'
  return `₹ ${Number(amount).toLocaleString('en-IN')}`
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const [dateFilter, setDateFilter] = useState('week')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAnalytics = async () => {
    setLoading(true)
    setError('')
    try {
      const params = { period: dateFilter }
      if (dateFilter === 'custom') {
        if (customStart) params.startDate = customStart
        if (customEnd) params.endDate = customEnd
      }
      const response = await dashboardAPI.getAnalytics(params)
      if (response.data.success) {
        setData(response.data.data)
      } else {
        setError(response.data.message || 'Failed to fetch dashboard data')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateFilter])

  const handleDateFilterChange = (value) => {
    setDateFilter(value)
    if (value !== 'custom') {
      setCustomStart('')
      setCustomEnd('')
    }
  }

  const handleApplyCustom = () => {
    fetchAnalytics()
  }

  const handleRetry = () => {
    fetchAnalytics()
  }

  const kpis = data?.kpis
  const chartData = data?.chartData || []
  const topProducts = data?.topProducts || []
  const topCategories = data?.topCategories || []
  const recentOrders = data?.recentOrders || []
  const lowStockProducts = data?.lowStockProducts || []

  const maxChartValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.revenue), 1)
  }, [chartData])

  const ordersChartData = useMemo(() => {
    return chartData.map(d => ({
      label: d.date,
      value: d.count,
    }))
  }, [chartData])

  const categoryChartData = useMemo(() => {
    return (topCategories || []).map(c => ({
      label: c.name || c.slug || 'Unknown',
      value: Number(c.revenue) || 0,
    }))
  }, [topCategories])

  const showCustomInputs = dateFilter === 'custom'

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined animate-spin text-5xl text-on-surface-variant block mb-4">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-5xl text-error block mb-4">
            error_outline
          </span>
          <p className="font-body-md text-body-md text-error mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="font-body-md text-body-md text-on-surface-variant">No dashboard data available.</p>
      </div>
    )
  }

  const primaryKpis = [
    { label: 'Total Sales', value: formatCurrency(kpis?.totalSales) },
    { label: 'Total Orders', value: kpis?.totalOrders ?? 0 },
    { label: 'Total Customers', value: kpis?.totalCustomers ?? 0 },
    { label: 'Total Products', value: kpis?.totalProducts ?? 0 },
    { label: 'Low Stock Items', value: kpis?.lowStockItems ?? 0 },
  ]

  const secondaryKpis = [
    { label: 'Pending Orders', value: kpis?.pendingOrders ?? 0 },
    { label: 'Pending Payments', value: kpis?.pendingPayments ?? 0 },
    { label: 'Active Orders', value: kpis?.activeOrders ?? 0 },
    { label: 'Delivered Orders', value: kpis?.deliveredOrders ?? 0 },
    { label: 'Cancelled Orders', value: kpis?.cancelledOrders ?? 0 },
    { label: 'In Progress', value: kpis?.inProgressOrders ?? 0 },
  ]

  return (
    <>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Dashboard Overview</h2>
          <p className="font-body-md text-body-md text-outline">
            Welcome back. Here is your summary for {DATE_FILTERS.find(f => f.value === dateFilter)?.label || 'this period'}.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface bg-surface-white"
            value={dateFilter}
            onChange={(e) => handleDateFilterChange(e.target.value)}
          >
            {DATE_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
          {showCustomInputs && (
            <>
              <input
                type="date"
                className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface bg-surface-white"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
              />
              <input
                type="date"
                className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md text-on-surface bg-surface-white"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
              />
              <button
                onClick={handleApplyCustom}
                className="px-4 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-xs rounded hover:bg-deep-emerald/90 transition-colors"
              >
                Apply
              </button>
            </>
          )}
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-xs rounded hover:bg-surface-container-low transition-colors"
            title="Refresh"
          >
            <span className="material-symbols-outlined text-sm">refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
        <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {primaryKpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD_BASE}>
              <p className={KPI_TITLE}>{kpi.label}</p>
              <h3 className={KPI_VALUE}>{kpi.value}</h3>
            </div>
          ))}
        </div>

        <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {secondaryKpis.map((kpi) => (
            <div key={kpi.label} className={KPI_CARD_BASE}>
              <p className={KPI_TITLE}>{kpi.label}</p>
              <h3 className={KPI_VALUE}>{kpi.value}</h3>
            </div>
          ))}
        </div>

        <div className="md:col-span-6 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Revenue Trends</h3>
            <span className="text-label-caps font-label-caps text-outline text-xs">
              {DATE_FILTERS.find(f => f.value === dateFilter)?.label}
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No sales data available.</p>
            </div>
          ) : (
            <div className="flex-1 w-full relative pb-6">
              <svg className="w-full h-56" preserveAspectRatio="none" viewBox={`0 0 ${chartData.length * 40} 100`}>
                <defs>
                  <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2={chartData.length * 40} y2={y} stroke="#e3e2e0" strokeWidth="0.5" />
                ))}
                <path
                  d={`M0,100 ${chartData.map((d, i) => {
                    const x = i * 40 + 20
                    const y = 100 - (d.revenue / maxChartValue) * 80
                    return `L${x},${y}`
                  }).join(' ')} L${(chartData.length - 1) * 40 + 20},100 Z`}
                  fill="url(#chart-gradient)"
                />
                <path
                  d={`${chartData.map((d, i) => {
                    const x = i * 40 + 20
                    const y = 100 - (d.revenue / maxChartValue) * 80
                    return `${i === 0 ? 'M' : 'L'}${x},${y}`
                  }).join(' ')}`}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {chartData.map((d, i) => {
                  const x = i * 40 + 20
                  const y = 100 - (d.revenue / maxChartValue) * 80
                  return <circle key={i} cx={x} cy={y} r="2" fill="#013220" />
                })}
              </svg>
              <div className="flex justify-between mt-2 px-2">
                {chartData.filter((_, i) => i % 2 === 0).map((d, i) => (
                  <span key={i} className="text-[10px] text-outline font-label-caps">{d.date}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="md:col-span-6 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Orders Trend</h3>
            <span className="text-label-caps font-label-caps text-outline text-xs">
              {DATE_FILTERS.find(f => f.value === dateFilter)?.label}
            </span>
          </div>
          {ordersChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No order data available.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-end w-full">
              <MiniBarChart data={ordersChartData} color="#013220" />
            </div>
          )}
        </div>

        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[320px] flex flex-col">
          <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald mb-4">Category-wise Sales</h3>
          {categoryChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No sales data available.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <DonutChart data={categoryChartData} />
            </div>
          )}
        </div>

        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[320px] flex flex-col">
          <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald mb-4">Top Selling Jewellery</h3>
          {topProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No sales data available.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 overflow-y-auto pr-2">
              {topProducts.map((product, idx) => (
                <li key={product._id || idx} className="flex items-center gap-3 p-2 rounded hover:bg-soft-cream transition-colors">
                  <div className="w-10 h-10 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                    <img
                      className="w-full h-full object-cover"
                      alt={product.name}
                      src={resolveImageUrl(product.image)}
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-0.5 truncate">{product.name}</p>
                    <span className="font-label-caps text-[10px] text-outline">
                      SKU: {product.sku || 'N/A'} · Qty: {product.quantity || 0} · {formatCurrency(product.revenue)}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-regal-gold">#{idx + 1}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="md:col-span-12 bg-surface-white rounded-lg border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">
              Dashboard Alerts
            </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">warning</span>
                Low Stock Products ({kpis?.lowStockItems ?? 0})
              </h4>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-on-surface-variant">All products are well-stocked.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lowStockProducts.map((product) => (
                    <li key={product._id} className="flex items-center gap-3 p-2 rounded bg-soft-cream/50">
                      <div className="w-8 h-8 bg-surface-container rounded overflow-hidden shrink-0">
                        <img
                          className="w-full h-full object-cover"
                          alt={product.name}
                          src={resolveImageUrl(product.primaryImage || product.images?.[0]?.url || '')}
                          onError={(e) => { e.target.src = 'https://placehold.co/48x48' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-deep-emerald font-medium truncate">{product.name}</p>
                        <span className="text-[10px] text-error font-bold">
                          {product.stock === 0 ? 'Out of Stock' : `${product.stock} left (min: ${product.minimumStock || 5})`}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-sm">payments</span>
                Pending Payments ({kpis?.pendingPayments ?? 0})
              </h4>
              {recentOrders.filter(o => o.paymentStatus === 'pending').length === 0 ? (
                <p className="text-sm text-on-surface-variant">No pending payments.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentOrders.filter(o => o.paymentStatus === 'pending').slice(0, 5).map((order) => (
                    <li key={order._id} className="flex items-center justify-between p-2 rounded bg-soft-cream/50">
                      <div>
                        <p className="text-xs text-deep-emerald font-medium">#{order.orderNumber || order._id?.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {order.user?.name || order.user?.email || order.shippingAddress?.fullName || 'Guest'}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-deep-emerald">{formatCurrency(order.totalPrice)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-sm">local_shipping</span>
                Pending Shipments ({kpis?.pendingOrders ?? 0})
              </h4>
              {recentOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length === 0 ? (
                <p className="text-sm text-on-surface-variant">No orders pending shipment.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentOrders.filter(o => !['delivered', 'cancelled'].includes(o.status)).slice(0, 5).map((order) => (
                    <li key={order._id} className="flex items-center justify-between p-2 rounded bg-soft-cream/50">
                      <div>
                        <p className="text-xs text-deep-emerald font-medium">#{order.orderNumber || order._id?.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant">
                          {order.user?.name || order.user?.email || order.shippingAddress?.fullName || 'Guest'}
                        </p>
                      </div>
                      {statusBadge(order.status)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="md:col-span-12 bg-surface-white rounded-lg border border-outline-variant/30 overflow-hidden mt-4">
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/50 backdrop-blur">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Recent Orders</h3>
            <Link to="/admin/orders" className="font-label-caps text-label-caps text-outline hover:text-deep-emerald flex items-center gap-1 group transition-colors">
              View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">
                shopping_bag
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">No orders yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant/20 bg-soft-cream/50">
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Order ID</th>
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Customer</th>
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Date</th>
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider text-right">Amount</th>
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-sm text-on-surface">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-outline-variant/10 hover:bg-soft-cream/30 transition-colors">
                      <td className="py-4 px-6 font-medium text-deep-emerald">
                        #{order.orderNumber || order._id?.toString().slice(-6).toUpperCase()}
                      </td>
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                          {(order.user?.name || order.shippingAddress?.fullName || order.user?.email || '?').charAt(0)}
                        </div>
                        {order.user?.name || order.shippingAddress?.fullName || order.user?.email || 'Guest'}
                      </td>
                      <td className="py-4 px-6 text-outline">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="py-4 px-6 text-right font-medium text-deep-emerald">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="py-4 px-6">
                        {statusBadge(order.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
