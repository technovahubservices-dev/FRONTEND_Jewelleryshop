import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, orderAPI } from '../../services/api'

const KPI_CARD_BASE = 'bg-surface-white p-5 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-28 relative overflow-hidden group'
const KPI_TITLE = 'font-label-caps text-label-caps text-outline z-10'
const KPI_VALUE = 'font-headline-md text-headline-md text-deep-emerald z-10 mt-auto'

const MiniBarChart = ({ data, color = '#D4AF37' }) => {
  if (!data || data.length === 0) return null
  const max = Math.max(...data.map(d => d.value), 1)
  const height = 60
  const barWidth = 100 / data.length
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

const DonutChart = ({ data, colors = ['#013220', '#D4AF37', '#735c00', '#e3e2e0'] }) => {
  if (!data || data.length === 0) return null
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1
  let cumulative = 0
  const segments = data.map((d, i) => {
    const start = cumulative
    const value = d.value
    cumulative += value
    return { ...d, start, end: cumulative, color: colors[i % colors.length] }
  })

  const radius = 40
  const circumference = 2 * Math.PI * radius
  const segmentsWithDash = segments.map((seg) => {
    const dash = ((seg.end - seg.start) / total) * circumference
    const offset = (seg.start / total) * circumference
    return { ...seg, dash, offset }
  })

  return (
    <div className="flex items-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120" className="transform -rotate-90">
        {segmentsWithDash.map((seg, i) => (
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
          />
        ))}
      </svg>
      <div className="flex flex-col gap-1 text-xs">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: colors[i % colors.length] }} />
            <span className="text-on-surface-variant truncate max-w-[80px]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [chartPeriod, setChartPeriod] = useState('week')

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    setError('')
    try {
      const [productsRes, ordersRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
      ])

      if (productsRes.data.success) {
        setProducts(productsRes.data.data || [])
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const totalSales = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  }, [orders])

  const totalOrders = orders.length

  const totalCustomers = useMemo(() => {
    const uniqueUsers = new Set()
    orders.forEach(order => {
      if (order.user) {
        uniqueUsers.add(order.user._id || order.user.email)
      }
    })
    return uniqueUsers.size
  }, [orders])

  const totalProducts = products.length

  const inventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + ((p.price || 0) * (p.stock || 0)), 0)
  }, [products])

  const lowStockItems = useMemo(() => {
    return products.filter(p => (p.stock || 0) < 10).length
  }, [products])

  const pendingOrders = useMemo(() => {
    return orders.filter(o => ['pending', 'new', 'confirmed', 'payment_received'].includes(o.status)).length
  }, [orders])

  const pendingPayments = useMemo(() => {
    return orders.filter(o => o.isPaid === false || ['pending', 'new', 'confirmed', 'payment_received'].includes(o.status)).length
  }, [orders])

  const topCategory = useMemo(() => {
    const categoryCount = {}
    products.forEach(p => {
      if (p.category) {
        categoryCount[p.category] = (categoryCount[p.category] || 0) + 1
      }
    })
    const sorted = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])
    return sorted.length > 0 ? sorted[0][0] : 'N/A'
  }, [products])

  const lowStockProducts = useMemo(() => {
    return products
      .filter(p => (p.stock || 0) < 10)
      .sort((a, b) => (a.stock || 0) - (b.stock || 0))
      .slice(0, 5)
  }, [products])

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [orders])

  const ordersWaitingPayment = useMemo(() => {
    return orders.filter(o => o.isPaid === false && o.status !== 'cancelled').slice(0, 5)
  }, [orders])

  const ordersPendingShipment = useMemo(() => {
    return orders.filter(o => ['pending', 'new', 'confirmed', 'payment_received', 'processing', 'manufacturing', 'quality_check', 'packed'].includes(o.status)).slice(0, 5)
  }, [orders])

  const chartData = useMemo(() => {
    const now = new Date()
    const days = chartPeriod === 'week' ? 7 : 30
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
        return orderDate === dateStr
      })

      const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)

      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        revenue: dayRevenue,
        count: dayOrders.length,
      })
    }

    return data
  }, [orders, chartPeriod])

  const maxChartValue = useMemo(() => {
    return Math.max(...chartData.map(d => d.revenue), 1)
  }, [chartData])

  const ordersChartData = useMemo(() => {
    const now = new Date()
    const days = chartPeriod === 'week' ? 7 : 30
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const count = orders.filter(order => {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0]
        return orderDate === dateStr
      }).length

      data.push({
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: count,
      })
    }

    return data
  }, [orders, chartPeriod])

  const categorySalesData = useMemo(() => {
    const categoryRevenue = {}
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const product = products.find(p => p._id === item.product || p._id === item.product?._id)
        const cat = product?.category || 'Other'
        categoryRevenue[cat] = (categoryRevenue[cat] || 0) + (item.price * item.quantity || 0)
      })
    })
    return Object.entries(categoryRevenue)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6)
  }, [orders, products])

  const topSellingProducts = useMemo(() => {
    const productSales = {}
    orders.forEach(order => {
      (order.items || []).forEach(item => {
        const pid = item.product || item.product?._id
        if (!pid) return
        if (!productSales[pid]) {
          productSales[pid] = {
            id: pid,
            name: item.name || 'Unknown',
            image: item.image || 'https://placehold.co/48x48',
            revenue: 0,
            quantity: 0,
          }
        }
        productSales[pid].revenue += (item.price * item.quantity || 0)
        productSales[pid].quantity += (item.quantity || 0)
      })
    })
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }, [orders])

  const statusBadge = (status) => {
    const configs = {
      pending: { bg: 'bg-surface-container/50', text: 'text-on-surface-variant', dot: 'bg-outline' },
      processing: { bg: 'bg-secondary-fixed/20', text: 'text-on-secondary-fixed-variant', dot: 'bg-regal-gold' },
      shipped: { bg: 'bg-primary-fixed-dim/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
      delivered: { bg: 'bg-primary-fixed/20', text: 'text-on-primary-fixed-variant', dot: 'bg-deep-emerald' },
      cancelled: { bg: 'bg-error-container/20', text: 'text-error', dot: 'bg-error' },
    }
    const cfg = configs[status] || configs.pending
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${cfg.bg} ${cfg.text} border border-outline-variant/20`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
        {status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown'}
      </span>
    )
  }

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

  return (
    <>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Dashboard Overview</h2>
        <p className="font-body-md text-body-md text-outline">Welcome back. Here is your summary for today.</p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Bento Grid Layout for Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
        {/* 1. Primary KPI Cards */}
        <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Total Sales', value: `₹${totalSales.toLocaleString('en-IN')}` },
            { label: 'Total Orders', value: totalOrders },
            { label: 'Total Customers', value: totalCustomers },
            { label: 'Total Products', value: totalProducts },
            { label: 'Inventory Value', value: `₹${inventoryValue.toLocaleString('en-IN')}` },
            { label: 'Low Stock Items', value: lowStockItems },
          ].map((kpi) => (
            <div key={kpi.label} className={KPI_CARD_BASE}>
              <p className={KPI_TITLE}>{kpi.label}</p>
              <h3 className={KPI_VALUE}>{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* 2. Secondary KPI Cards */}
        <div className="md:col-span-12 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Pending Orders', value: pendingOrders },
            { label: 'Pending Payments', value: pendingPayments },
            { label: 'Active Orders', value: orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length },
            { label: 'Top Category', value: topCategory, truncate: true },
          ].map((kpi) => (
            <div key={kpi.label} className={KPI_CARD_BASE}>
              <p className={KPI_TITLE}>{kpi.label}</p>
              <h3 className={`${KPI_VALUE} ${kpi.truncate ? 'truncate' : ''}`}>{kpi.value}</h3>
            </div>
          ))}
        </div>

        {/* 3. Revenue Trends Chart */}
        <div className="md:col-span-6 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Revenue Trends</h3>
            <select
              className="bg-transparent border-none text-label-caps font-label-caps text-outline focus:ring-0 cursor-pointer"
              value={chartPeriod}
              onChange={(e) => setChartPeriod(e.target.value)}
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>

          {chartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No revenue data available.</p>
            </div>
          ) : (
            <div className="flex-1 w-full relative pb-6">
              <svg className="w-full h-56" preserveAspectRatio="none" viewBox={`0 0 ${chartData.length * 30} 100`}>
                <defs>
                  <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2={chartData.length * 30} y2={y} stroke="#e3e2e0" strokeWidth="0.5" />
                ))}
                <path
                  d={`M0,100 ${chartData.map((d, i) => {
                    const x = i * 30 + 15
                    const y = 100 - (d.revenue / maxChartValue) * 80
                    return `L${x},${y}`
                  }).join(' ')} L${(chartData.length - 1) * 30 + 15},100 Z`}
                  fill="url(#chart-gradient)"
                />
                <path
                  d={`${chartData.map((d, i) => {
                    const x = i * 30 + 15
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
                  const x = i * 30 + 15
                  const y = 100 - (d.revenue / maxChartValue) * 80
                  return <circle key={i} cx={x} cy={y} r="2" fill="#013220" />
                })}
              </svg>
              <div className="flex justify-between mt-2 px-2">
                {chartData.filter((_, i) => chartPeriod === 'week' ? i % 2 === 0 : i % 5 === 0).map((d, i) => (
                  <span key={i} className="text-[10px] text-outline font-label-caps">{d.date}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Orders Trend Chart */}
        <div className="md:col-span-6 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[380px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Orders Trend</h3>
            <span className="text-label-caps font-label-caps text-outline">{chartPeriod === 'week' ? 'This Week' : 'This Month'}</span>
          </div>
          {ordersChartData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-body-md text-on-surface-variant">No order data available.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center">
              <MiniBarChart data={ordersChartData} color="#013220" />
            </div>
          )}
        </div>

        {/* 5. Category-wise Sales */}
        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[320px] flex flex-col">
          <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald mb-4">Category-wise Sales</h3>
          {categorySalesData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-sm text-on-surface-variant">No sales data available.</p>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <DonutChart data={categorySalesData} />
            </div>
          )}
        </div>

        {/* 6. Top Selling Jewellery */}
        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[320px] flex flex-col">
          <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald mb-4">Top Selling Jewellery</h3>
          {topSellingProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-sm text-on-surface-variant">No sales data available.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-3 overflow-y-auto pr-2">
              {topSellingProducts.map((product, idx) => (
                <li key={product.id} className="flex items-center gap-3 p-2 rounded hover:bg-soft-cream transition-colors">
                  <div className="w-10 h-10 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                    <img className="w-full h-full object-cover" alt={product.name} src={product.image} onError={(e) => { e.target.src = 'https://placehold.co/48x48' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-0.5 truncate">{product.name}</p>
                    <span className="font-label-caps text-[10px] text-outline">Qty: {product.quantity} · ₹{product.revenue.toLocaleString('en-IN')}</span>
                  </div>
                  <span className="text-xs font-bold text-regal-gold">#{idx + 1}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 8. Alerts Section */}
        <div className="md:col-span-12 bg-surface-white rounded-lg border border-outline-variant/30 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/20">
             <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">
               Dashboard Alerts
             </h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Low Stock */}
            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-error text-sm">warning</span>
                Low Stock Products ({lowStockItems})
              </h4>
              {lowStockProducts.length === 0 ? (
                <p className="text-sm text-on-surface-variant">All products are well-stocked.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {lowStockProducts.map((product) => (
                    <li key={product._id} className="flex items-center gap-3 p-2 rounded bg-soft-cream/50">
                      <div className="w-8 h-8 bg-surface-container rounded overflow-hidden shrink-0">
                        <img className="w-full h-full object-cover" alt={product.name} src={product.primaryImage || product.images?.[0] || 'https://placehold.co/48x48'} onError={(e) => { e.target.src = 'https://placehold.co/48x48' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-deep-emerald font-medium truncate">{product.name}</p>
                        <span className="text-[10px] text-error font-bold">{product.stock === 0 ? 'Out of Stock' : `${product.stock} left`}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pending Payments */}
            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-sm">payments</span>
                Orders Waiting for Payment ({ordersWaitingPayment.length})
              </h4>
              {ordersWaitingPayment.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No pending payments.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {ordersWaitingPayment.slice(0, 5).map((order) => (
                    <li key={order._id} className="flex items-center justify-between p-2 rounded bg-soft-cream/50">
                      <div>
                        <p className="text-xs text-deep-emerald font-medium">#{order._id.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant">{order.user?.name || order.user?.email || 'Guest'}</p>
                      </div>
                      <span className="text-xs font-semibold text-deep-emerald">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Pending Shipments */}
            <div>
              <h4 className="font-label-caps text-label-caps text-outline mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary-fixed-dim text-sm">local_shipping</span>
                Orders Pending Shipment ({ordersPendingShipment.length})
              </h4>
              {ordersPendingShipment.length === 0 ? (
                <p className="text-sm text-on-surface-variant">No orders pending shipment.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {ordersPendingShipment.slice(0, 5).map((order) => (
                    <li key={order._id} className="flex items-center justify-between p-2 rounded bg-soft-cream/50">
                      <div>
                        <p className="text-xs text-deep-emerald font-medium">#{order._id.toString().slice(-6).toUpperCase()}</p>
                        <p className="text-[10px] text-on-surface-variant">{order.user?.name || order.user?.email || 'Guest'}</p>
                      </div>
                      {statusBadge(order.status)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 9. Recent Orders Table */}
        <div className="md:col-span-12 bg-surface-white rounded-lg border border-outline-variant/30 overflow-hidden mt-4">
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/50 backdrop-blur">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Recent Orders</h3>
            <Link to="/admin/orders" className="font-label-caps text-label-caps text-outline hover:text-deep-emerald flex items-center gap-1 group transition-colors">
              View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <div className="p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2 block">shopping_bag</span>
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
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Amount</th>
                    <th className="py-4 px-6 font-label-caps text-label-caps text-outline font-medium tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-sm text-on-surface">
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-outline-variant/10 hover:bg-soft-cream/30 transition-colors">
                      <td className="py-4 px-6 font-medium">#{order._id.toString().slice(-6).toUpperCase()}</td>
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">
                          {order.user?.name?.charAt(0) || order.user?.email?.charAt(0) || '?'}
                        </div>
                        {order.user?.name || order.user?.email || 'Guest'}
                      </td>
                      <td className="py-4 px-6 text-outline">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                      </td>
                      <td className="py-4 px-6 font-medium">₹{(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                      <td className="py-4 px-6">{statusBadge(order.status)}</td>
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
