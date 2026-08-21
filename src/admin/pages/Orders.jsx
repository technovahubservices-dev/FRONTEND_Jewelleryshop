export default function Orders() {
  const orders = [
    {
      id: 'ORD-9082',
      customer: 'Ananya Sharma',
      initials: 'AS',
      date: 'Oct 24, 2023',
      amount: '₹1,45,000',
      status: 'Delivered',
      statusColor: 'bg-primary-fixed/20 text-on-primary-fixed-variant',
      dotColor: 'bg-on-primary-fixed-variant',
    },
    {
      id: 'ORD-9081',
      customer: 'Rahul Kapoor',
      initials: 'RK',
      date: 'Oct 24, 2023',
      amount: '₹85,500',
      status: 'In Transit',
      statusColor: 'bg-secondary-container/30 text-on-secondary-fixed-variant',
      dotColor: 'bg-regal-gold',
    },
    {
      id: 'ORD-9080',
      customer: 'Meera Nair',
      initials: 'MN',
      date: 'Oct 23, 2023',
      amount: '₹2,10,000',
      status: 'Pending',
      statusColor: 'bg-surface-variant text-outline',
      dotColor: 'bg-outline',
      icon: 'local_shipping',
    },
    {
      id: 'ORD-9079',
      customer: 'Vikram Patel',
      initials: 'VP',
      date: 'Oct 23, 2023',
      amount: '₹45,000',
      status: 'Delivered',
      statusColor: 'bg-primary-fixed/20 text-on-primary-fixed-variant',
      dotColor: 'bg-on-primary-fixed-variant',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Orders</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage customer orders, track shipments, and view order history.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            Create Manual Order
          </button>
        </div>

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">search</span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search by Order ID or Customer..."
              type="text"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[140px]">
              <select className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all">
                <option disabled selected value="">Status</option>
                <option value="all">All Statuses</option>
                <option value="delivered">Delivered</option>
                <option value="transit">In Transit</option>
                <option value="pending">Pending</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>
            <div className="relative min-w-[140px]">
              <input className="w-full bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all" placeholder="Date Range" type="text" />
            </div>
          </div>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-4 pl-6 pr-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Order ID</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Customer</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Date</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Amount</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Status</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {orders.map((order) => (
                  <tr key={order.id} className="table-row-hover bg-surface-white group">
                    <td className="py-4 pl-6 pr-4 font-medium text-deep-emerald">{order.id}</td>
                    <td className="py-4 px-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">{order.initials}</div>
                      {order.customer}
                    </td>
                    <td className="py-4 px-4 text-on-surface">{order.date}</td>
                    <td className="py-4 px-4 text-right font-semibold text-deep-emerald">{order.amount}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold ${order.statusColor} border ${order.statusColor}`}>
                        {order.icon ? (
                          <span className="material-symbols-outlined text-[14px] mr-1.5">{order.icon}</span>
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full ${order.dotColor} mr-1.5`}></span>
                        )}
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors" title="View Order">
                        <span className="material-symbols-outlined">visibility</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant flex items-center justify-between">
            <span className="text-xs font-body-md text-on-surface-variant">Showing 1 to 4 of 248 orders</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-outline hover:text-deep-emerald disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-deep-emerald text-surface-white font-label-caps text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">3</button>
              <span className="text-on-surface-variant px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">25</button>
              <button className="p-1.5 text-on-surface-variant hover:text-deep-emerald transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
