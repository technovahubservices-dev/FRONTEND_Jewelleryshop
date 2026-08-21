export default function Dashboard() {
  return (
    <>
      {/* Page Header */}
      <div className="mb-12">
        <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">Dashboard Overview</h2>
        <p className="font-body-md text-body-md text-outline">Welcome back. Here is your summary for today.</p>
      </div>
      {/* Bento Grid Layout for Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 auto-rows-min">
        {/* 1. KPI Cards (Spanning 12 cols total on md, 3 cols each) */}
        <div className="md:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* KPI 1 */}
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Total Revenue</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">₹12,50,000</h3>
              <span className="text-xs text-on-primary-container bg-primary-fixed/20 px-1.5 py-0.5 rounded font-bold">+14%</span>
            </div>
          </div>
          {/* KPI 2 */}
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Active Orders</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">48</h3>
              <span className="text-xs text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded">-2</span>
            </div>
          </div>
          {/* KPI 3 */}
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">New Customers</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">125</h3>
              <span className="text-xs text-on-primary-container bg-primary-fixed/20 px-1.5 py-0.5 rounded font-bold">+8%</span>
            </div>
          </div>
          {/* KPI 4 */}
          <div className="bg-surface-white p-6 rounded-lg border border-outline-variant/30 hover:border-regal-gold/50 transition-colors duration-300 flex flex-col justify-between h-32 relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-soft-cream rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
            <p className="font-label-caps text-label-caps text-outline z-10">Top Category</p>
            <div className="flex items-baseline gap-2 z-10 mt-auto">
              <h3 className="font-headline-md text-headline-md text-deep-emerald truncate">Diamond Rings</h3>
            </div>
          </div>
        </div>
        {/* 2. Sales Analytics Chart (Spanning 8 cols on md) */}
        <div className="md:col-span-8 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Revenue Trends</h3>
            <select className="bg-transparent border-none text-label-caps font-label-caps text-outline focus:ring-0 cursor-pointer">
              <option>This Week</option>
              <option>This Month</option>
              <option>This Year</option>
            </select>
          </div>
          {/* Placeholder for sophisticated line chart */}
          <div className="flex-1 w-full relative flex items-end justify-between px-4 pb-8 border-b border-l border-outline-variant/20 pt-8 mt-4" style={{ background: 'linear-gradient(to top, rgba(233, 226, 224, 0.1) 0%, transparent 100%)' }}>
            {/* Simulated Chart Grid Lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none border-t border-outline-variant/10">
              <div className="border-b border-outline-variant/10 h-1/4"></div>
              <div className="border-b border-outline-variant/10 h-1/4"></div>
              <div className="border-b border-outline-variant/10 h-1/4"></div>
            </div>
            {/* Simulated SVG Line (abstract representation) */}
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path className="drop-shadow-sm" d="M0,90 Q15,70 30,80 T60,40 T80,50 T100,20" fill="none" stroke="#D4AF37" strokeLinecap="round" strokeWidth="2"></path>
              {/* Area fill under line */}
              <path d="M0,90 Q15,70 30,80 T60,40 T80,50 T100,20 L100,100 L0,100 Z" fill="url(#chart-gradient)" opacity="0.2"></path>
              <defs>
                <linearGradient id="chart-gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="1"></stop>
                  <stop offset="100%" stopColor="#D4AF37" stopOpacity="0"></stop>
                </linearGradient>
              </defs>
              {/* Data points */}
              <circle cx="30" cy="80" fill="#013220" r="1.5"></circle>
              <circle cx="60" cy="40" fill="#013220" r="1.5"></circle>
              <circle cx="100" cy="20" fill="#013220" r="1.5"></circle>
            </svg>
            {/* X Axis Labels */}
            <span className="absolute -bottom-6 left-0 text-[10px] text-outline font-label-caps">Mon</span>
            <span className="absolute -bottom-6 left-1/4 text-[10px] text-outline font-label-caps">Wed</span>
            <span className="absolute -bottom-6 left-2/4 text-[10px] text-outline font-label-caps">Fri</span>
            <span className="absolute -bottom-6 right-0 text-[10px] text-outline font-label-caps">Sun</span>
          </div>
        </div>
        {/* 4. Low Stock Alerts (Spanning 4 cols on md) */}
        <div className="md:col-span-4 bg-surface-white p-6 rounded-lg border border-outline-variant/30 min-h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-outline-variant/20">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald flex items-center gap-2">
              <span className="material-symbols-outlined text-regal-gold text-xl" data-icon="warning">warning</span>
              Low Stock Alerts
            </h3>
          </div>
          <ul className="flex flex-col gap-4 overflow-y-auto pr-2">
            {/* Alert Item */}
            <li className="flex items-start gap-4 p-3 rounded hover:bg-soft-cream transition-colors">
              <div className="w-12 h-12 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                <img className="w-full h-full object-cover" data-alt="A macro photography shot of an exquisite Eternal Diamond Solitaire Ring resting on a stark white pedestal, studio lighting highlighting the flawless cut and brilliant facets of the diamond. The setting is minimalist and luxurious, focusing entirely on the sparkling gemstone against a pristine, high-key bright background. Professional jewelry photography style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAI1ISMNG4yEtKKKqfDg46R0lluQZWU6xm3fvGCIbCfdFbSSijtkcrsbIDkK5D2rVwPTMg2vSxECD6QQYQERYmZU1LvVy9UdeO5KFNTphpAYHScAK1fMJjVmHLouJP0rYLyLhz3GTvNCnAOAU3sJCf4pIF5T7dseUnC65TlBONwoeJFnpQR8zG_cPtINyWVVc23GcIg4sDGZoX13cI8gh9cleWJYC5e1dJIuG_ON5wg_SgyfzUXvtI" />
              </div>
              <div className="flex-1">
                <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-1">Eternal Diamond Solitaire Ring</p>
                <span className="font-label-caps text-[10px] text-error font-bold tracking-wide">2 Units Left</span>
              </div>
            </li>
            {/* Alert Item */}
            <li className="flex items-start gap-4 p-3 rounded hover:bg-soft-cream transition-colors">
              <div className="w-12 h-12 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                <img className="w-full h-full object-cover" data-alt="A delicate Rose Gold Tennis Bracelet meticulously arranged in a perfect curve on a soft, creamy silk fabric. Gentle, diffused daylight illuminates the tiny embedded diamonds, creating subtle sparkles. The overall aesthetic is soft, elegant, and ethereal, highlighting the craftsmanship and warm metallic tones of the jewelry." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkpZAkMHU_MYGs0E4Oqk08j6y4fpxL9YdJM4-JTRQhQaPyrr8a1ZLmZvDWbTwv-cbcpWxdV7k8V3F4aOf5maQ1ebLnuUwdloVBTPC41CavqgEY4-WUxtnoXZsZCwT8Z1NbJwwxBvts2-X_uE68-nH12gZsZyUpG7KgZQCguXRHsZAjXVke263o386XfPP8duyYJuPQvthBBVN_OSKyPrSOWamyFfqiHoaQKh-jl9FVXNlmfkjUcbU" />
              </div>
              <div className="flex-1">
                <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-1">Rose Gold Tennis Bracelet</p>
                <span className="font-label-caps text-[10px] text-error font-bold tracking-wide">1 Unit Left</span>
              </div>
            </li>
            {/* Alert Item */}
            <li className="flex items-start gap-4 p-3 rounded hover:bg-soft-cream transition-colors">
              <div className="w-12 h-12 bg-surface-container rounded overflow-hidden shrink-0 border border-outline-variant/20">
                <img className="w-full h-full object-cover" data-alt="A vintage-inspired Emerald Cut Sapphire Necklace displayed on an abstract marble bust. The deep blue of the sapphire contrasts sharply with the pale marble and soft cream background. Dramatic, directional lighting emphasizes the depth of the gemstone's color and the intricate detailing of the platinum setting. Opulent and sophisticated presentation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCZtZI58jyk1N9kkPx4TneuQfZtxyFVZRSeOcbcoudC_4H3M903ptj6v8LribpBpUMZgbN_eoWyjFkUVtBNz8tA1S0Me2pey2_8KK-AKCCF_P2F881aiBabCiI4AFkbYO9IX4_ANVj2QN-p-lMqTF1a_l6XbWeqYSRpz5yXtf5ePK_4-VFGCa637bThPkqMAo-3JfUd5PvHrbA05DOkkp-SVARoXEyFDMug5Gnyz-MFWmRtGyBVoSA" />
              </div>
              <div className="flex-1">
                <p className="font-body-md text-sm text-deep-emerald font-medium leading-tight mb-1">Sapphire Heirloom Necklace</p>
                <span className="font-label-caps text-[10px] text-error font-bold tracking-wide">Out of Stock</span>
              </div>
            </li>
          </ul>
          <button className="mt-auto w-full py-3 mt-4 border border-outline-variant text-deep-emerald font-label-caps text-label-caps hover:bg-surface-container-high transition-colors rounded">View Inventory</button>
        </div>
        {/* 3. Recent Orders Table (Spanning 12 cols) */}
        <div className="md:col-span-12 bg-surface-white rounded-lg border border-outline-variant/30 overflow-hidden mt-4">
          <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center bg-white/50 backdrop-blur">
            <h3 className="font-headline-md text-body-lg md:text-headline-md text-deep-emerald">Recent Orders</h3>
            <a className="font-label-caps text-label-caps text-outline hover:text-deep-emerald flex items-center gap-1 group transition-colors" href="#">
              View All <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform" data-icon="arrow_forward">arrow_forward</span>
            </a>
          </div>
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
                <tr className="border-b border-outline-variant/10 hover:bg-soft-cream/30 transition-colors">
                  <td className="py-4 px-6 font-medium">#ORD-9082</td>
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">AS</div>
                    Ananya Sharma
                  </td>
                  <td className="py-4 px-6 text-outline">Oct 24, 2023</td>
                  <td className="py-4 px-6 font-medium">₹1,45,000</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary-fixed/20 text-on-primary-fixed-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-primary-fixed-variant mr-1.5"></span> Delivered
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/10 hover:bg-soft-cream/30 transition-colors">
                  <td className="py-4 px-6 font-medium">#ORD-9081</td>
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">RK</div>
                    Rahul Kapoor
                  </td>
                  <td className="py-4 px-6 text-outline">Oct 24, 2023</td>
                  <td className="py-4 px-6 font-medium">₹85,500</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-secondary-container/30 text-on-secondary-fixed-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-regal-gold mr-1.5"></span> In Transit
                    </span>
                  </td>
                </tr>
                <tr className="border-b border-outline-variant/10 hover:bg-soft-cream/30 transition-colors">
                  <td className="py-4 px-6 font-medium">#ORD-9080</td>
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">MN</div>
                    Meera Nair
                  </td>
                  <td className="py-4 px-6 text-outline">Oct 23, 2023</td>
                  <td className="py-4 px-6 font-medium">₹2,10,000</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-surface-variant text-outline">
                      <span className="w-1.5 h-1.5 rounded-full bg-outline mr-1.5"></span> Pending
                    </span>
                  </td>
                </tr>
                <tr className="hover:bg-soft-cream/30 transition-colors">
                  <td className="py-4 px-6 font-medium">#ORD-9079</td>
                  <td className="py-4 px-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-container-high flex items-center justify-center text-xs font-bold text-deep-emerald">VP</div>
                    Vikram Patel
                  </td>
                  <td className="py-4 px-6 text-outline">Oct 23, 2023</td>
                  <td className="py-4 px-6 font-medium">₹45,000</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold bg-primary-fixed/20 text-on-primary-fixed-variant">
                      <span className="w-1.5 h-1.5 rounded-full bg-on-primary-fixed-variant mr-1.5"></span> Delivered
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
