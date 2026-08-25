import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { productAPI, orderAPI, rawMaterialAPI, productionAPI } from '../../services/api'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [rawMaterials, setRawMaterials] = useState([])
  const [productions, setProductions] = useState([])
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
      const [productsRes, ordersRes, materialsRes, productionsRes] = await Promise.all([
        productAPI.getAll(),
        orderAPI.getAll(),
        rawMaterialAPI.getAll(),
        productionAPI.getAll(),
      ])

      if (productsRes.data.success) {
        setProducts(productsRes.data.data || [])
      }
      if (ordersRes.data.success) {
        setOrders(ordersRes.data.data || [])
      }
      if (materialsRes.data.success) {
        setRawMaterials(materialsRes.data.data || [])
      }
      if (productionsRes.data.success) {
        setProductions(productionsRes.data.data || [])
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const totalRevenue = useMemo(() => {
    return orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
  }, [orders])

  const activeOrders = useMemo(() => {
    return orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length
  }, [orders])

  const totalCustomers = useMemo(() => {
    const uniqueUsers = new Set()
    orders.forEach(order => {
      if (order.user) {
        uniqueUsers.add(order.user._id || order.user.email)
      }
    })
    return uniqueUsers.size
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
      .filter(p => p.stock !== undefined && p.stock < 10)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
  }, [products])

  const recentOrders = useMemo(() => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
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
        {/* 1. KPI Cards */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Total Revenue</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">₹{totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
          </div>
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Active Orders</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">{activeOrders}</h3>
            </div>
          </div>
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Total Customers</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">{totalCustomers}</h3>
            </div>
          </div>
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Top Category</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald truncate">{topCategory}</h3>
            </div>
          </div>
        </div>

        {/* 2. Sales Analytics Chart */}
        <div className="md:col-span-8 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
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
              <p className="font-body-md text-body-md text-on-surface-variant">No order data available for the selected period.</p>
            </div>
          ) : (
            <div className="flex-1 w-full relative pb-8">
              <svg className="w-full h-64" preserveAspectRatio="none" viewBox={`0 0 ${chartData.length * 30} 100`}>
                <defs>
                  <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>

                {/* Grid lines */}
                {[0, 25, 50, 75, 100].map((y) => (
                  <line key={y} x1="0" y1={y} x2={chartData.length * 30} y2={y} stroke="#e3e2e0" strokeWidth="0.5" />
                ))}

                {/* Area fill */}
                <path
                  d={`M0,100 ${chartData.map((d, i) => {
                    const x = i * 30 + 15
                    const y = 100 - (d.revenue / maxChartValue) * 80
                    return `L${x},${y}`
                  }).join(' ')} L${(chartData.length - 1) * 30 + 15},100 Z`}
                  fill="url(#chart-gradient)"
                />

                {/* Line */}
                <path
                  d={`M${chartData.map((d, i) => {
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

                {/* Data points */}
                {chartData.map((d, i) => {
                  const x = i * 30 + 15
                  const y = 100 - (d.revenue / maxChartValue) * 80
                  return (
                    <circle key={i} cx={x} cy={y} r="2" fill="#013220" />
                  )
                })}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between mt-2 px-2">
                {chartData.filter((_, i) => chartPeriod === 'week' ? i % 2 === 0 : i % 5 === 0).map((d, i) => (
                  <span key={i} className="text-[10px] text-outline font-label-caps">{d.date}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Low Stock Alerts */}
        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald flex items-center gap-2">
              <span className="material-symbols-outlined text-regal-gold text-xl" data-icon="warning">warning</span>
              Low Stock Alerts
            </h3>
          </div>

          {lowStockProducts.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="font-body-md text-sm text-on-surface-variant">All products are well-stocked.</p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4 overflow-y-auto pr-2">
              {lowStockProducts.map((product) => (
                <li key={product._id} className="flex items-start gap-4 p-3 rounded hover:bg-soft-cream transition-colors">
                  <div className="w-12 h-12 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                    <img
                      className="w-full h-full object-cover"
                      alt={product.name}
                      src={product.primaryImage || product.images?.[0] || 'https://placehold.co/48x48'}
                      onError={(e) => { e.target.src = 'https://placehold.co/48x48' }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-1 truncate">{product.name}</p>
                    <span className="font-label-caps text-[10px] text-error font-bold tracking-wide">
                      {product.stock === 0 ? 'Out of Stock' : `${product.stock} Units Left`}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Link to="/admin/products" className="mt-auto w-full py-3 mt-4 border border-outline-variant text-deep-emerald font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded text-center">
            View Inventory
          </Link>
        </div>

        {/* 4. Recent Orders Table */}
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
