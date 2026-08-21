export default function Account() {
  return (
    <div className="flex-grow flex w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter">
      {/* Sidebar Navigation (Not the global SideNavBar, but contextual page nav) */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-2 border-b border-outline-variant">My Account</h2>
          <nav className="flex flex-col gap-2 font-body-md text-body-md">
            <a className="flex items-center gap-3 px-4 py-3 bg-surface-white text-deep-emerald font-bold rounded border border-outline-variant shadow-sm transition-all" href="#">
              <span className="material-symbols-outlined text-regal-gold">person</span>
              Profile Overview
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all" href="#">
              <span className="material-symbols-outlined">shopping_basket</span>
              My Orders
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all" href="#">
              <span className="material-symbols-outlined">favorite</span>
              Wishlist
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all" href="#">
              <span className="material-symbols-outlined">location_on</span>
              Addresses
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all" href="#">
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </a>
            <a className="flex items-center gap-3 px-4 py-3 text-error hover:bg-error-container hover:text-error rounded transition-all mt-8" href="#">
              <span className="material-symbols-outlined">logout</span>
              Sign Out
            </a>
          </nav>
        </div>
      </aside>
      {/* Main Content Canvas */}
      <main className="flex-1 flex flex-col gap-12">
        <header className="mb-4">
          <h1 className="font-display-lg text-display-lg text-deep-emerald">Welcome Back, Eleanor.</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your personal details, view orders, and track your loyalty status.</p>
        </header>
        {/* Loyalty / Tier Section */}
        <section className="bg-surface-white p-8 border border-regal-gold/30 rounded shadow-sm flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-soft-cream to-surface-white opacity-50 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-soft-cream border border-regal-gold flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-4xl text-regal-gold">diamond</span>
            </div>
            <div>
              <h3 className="font-headline-md text-headline-md text-deep-emerald">CaratLane Insider Tier: <span className="text-regal-gold">Gold</span></h3>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">You are 2,450 points away from Platinum status.</p>
            </div>
          </div>
          <div className="relative z-10 text-center md:text-right">
            <p className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest mb-1">Current Balance</p>
            <p className="font-display-lg text-headline-lg text-deep-emerald">12,550 <span className="text-body-md text-on-surface-variant">pts</span></p>
            <button className="mt-2 text-sm text-regal-gold underline hover:text-deep-emerald transition-colors">View Rewards</button>
          </div>
        </section>
        {/* Split Layout: Profile & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Details */}
          <section className="bg-surface-white p-8 border border-outline-variant rounded shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-headline-md text-headline-md text-deep-emerald">Personal Information</h3>
              <button className="text-on-surface-variant hover:text-deep-emerald transition-colors"><span className="material-symbols-outlined">edit</span></button>
            </div>
            <div className="space-y-6 font-body-md text-body-md">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Full Name</p>
                <p className="text-on-surface font-medium">Eleanor Vance</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Email Address</p>
                <p className="text-on-surface font-medium">eleanor.vance@example.com</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Phone Number</p>
                <p className="text-on-surface font-medium">+1 (555) 019-8234</p>
              </div>
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Default Shipping Address</p>
                <p className="text-on-surface font-medium">123 Luxury Lane, Suite 400<br/>New York, NY 10022</p>
              </div>
            </div>
          </section>
          {/* Recent Activity / Wishlist Glimpse */}
          <section className="flex flex-col gap-8">
            <div className="bg-surface-white p-8 border border-outline-variant rounded shadow-sm flex-1">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-md text-headline-md text-deep-emerald">Recent Wishlist</h3>
                <a className="font-label-caps text-label-caps text-regal-gold hover:text-deep-emerald uppercase transition-colors" href="#">View All</a>
              </div>
              <div className="flex gap-4">
                <div className="w-1/2 flex flex-col gap-2 group cursor-pointer">
                  <div className="aspect-square bg-surface-container-low overflow-hidden rounded relative border border-transparent group-hover:border-outline-variant transition-colors">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="A macro studio shot of a delicate rose gold diamond pendant necklace on a pristine white marble surface. Bright, high-key lighting creates a minimalist, luxury aesthetic highlighting the precise craftsmanship and sparkle. Soft cream tones in the ambient reflection." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBCDmetEDQHB81gBPTDjbNtWwHIVF9Z5wybQxKUNgzi26LBtijAGXJ3KJegZiUiH9EE_bygf70lBDTkDNBcVhgP3xMgqOqCBHXwUh2jULEsv4SWO9gmlTKJ8yulUl-W_dGauMze66MsgPyb9Z89heYNm0beDghFP2W6smz8s-ixXuFFRMQcsWPGiW6jZirxNJO-giMjktRtFmShdkgrBVewYU7kL7iehBz8zg5xEIIuAwApgyGVVo0"/>
                  </div>
                  <p className="font-body-md text-sm text-on-surface line-clamp-1 group-hover:text-regal-gold transition-colors">Rose Gold Diamond Pendant</p>
                </div>
                <div className="w-1/2 flex flex-col gap-2 group cursor-pointer">
                  <div className="aspect-square bg-surface-container-low overflow-hidden rounded relative border border-transparent group-hover:border-outline-variant transition-colors">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="A close-up photograph of an elegant platinum eternity ring set with brilliant-cut diamonds, resting delicately on a piece of soft cream textured silk. The lighting is diffused and sophisticated, creating a serene, high-end jewelry boutique atmosphere with a focus on meticulous detail." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtjLKga0BKU_GNChoCVP7iq3-6PKR2W5mjQIHRUXDxnIENONq7RJ3_puTkDsNDS0deZvDlb2vMn-swxBcmIiVoDgSZzcbU3ldkX9200K818OF07NqZA5SrFDr1q3_fZ8vwNmZqs10eKHe9sxjOvoCCGh7uuiIxPjdP7e-BdODL-pk8vQSICTsWcmSBpnx-wOEDH_j-6jEG-kwcmHy8-6SMd2ZEXRyCEvMS-p3yE8N-RJ0hGtPHzTk"/>
                  </div>
                  <p className="font-body-md text-sm text-on-surface line-clamp-1 group-hover:text-regal-gold transition-colors">Platinum Eternity Ring</p>
                </div>
              </div>
            </div>
          </section>
        </div>
        {/* Recent Orders */}
        <section className="bg-surface-white p-8 border border-outline-variant rounded shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Recent Orders</h3>
            <a className="font-label-caps text-label-caps text-regal-gold hover:text-deep-emerald uppercase transition-colors" href="#">Order History</a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left font-body-md text-body-md border-collapse">
              <thead>
                <tr className="border-b border-outline-variant text-on-surface-variant font-label-caps text-label-caps uppercase tracking-wider">
                  <th className="pb-4 font-semibold w-1/3">Item</th>
                  <th className="pb-4 font-semibold px-4">Order Date</th>
                  <th className="pb-4 font-semibold px-4">Total</th>
                  <th className="pb-4 font-semibold text-right pl-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50">
                {/* Order Row 1 */}
                <tr className="group hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-surface-container-low rounded flex-shrink-0 overflow-hidden border border-outline-variant/30">
                        <img className="w-full h-full object-cover" data-alt="A top-down studio shot of a classic pair of diamond stud earrings in 18k yellow gold, presented elegantly inside an open, dark emerald green velvet ring box. The background is a clean soft cream surface. Bright, crisp lighting emphasizes the stones' clarity and the luxury brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDtdfgTuic5kFnoKAOwO9opZhaMnyXHROHqSMlNqJ5wp5bHMQSPC-MZ9aaT1N7HgeNf5MvH8fdPONLBMgTSzPhB-VF17xq6tXsfTMeuEAPBtlE5f4_AZJ7gEt69rUMkk4x1-OtQEPBJ3h09CpcF3eLajmxk92NoNYiNw8Y9ZEx12ZMSfvbOEe-xzVPfEyY6UM0Le6xHbW_Bpob8UZUYOYEjmX7RiVpffPkrFuYVYtY-o2ksYuyDy6w"/>
                      </div>
                      <div>
                        <p className="font-medium text-deep-emerald group-hover:text-regal-gold transition-colors">Classic Diamond Studs</p>
                        <p className="text-sm text-on-surface-variant mt-1">Order #CL-8924A</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-on-surface">Oct 12, 2024</td>
                  <td className="py-6 px-4 text-on-surface">$1,250.00</td>
                  <td className="py-6 pl-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-tint/10 text-surface-tint text-sm font-medium border border-surface-tint/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-surface-tint"></span> Delivered
                    </span>
                  </td>
                </tr>
                {/* Order Row 2 */}
                <tr className="group hover:bg-surface-container-lowest transition-colors">
                  <td className="py-6 pr-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-surface-container-low rounded flex-shrink-0 overflow-hidden border border-outline-variant/30">
                        <img className="w-full h-full object-cover" data-alt="A minimalist photograph of a delicate gold chain bracelet featuring a single small sapphire charm, draped softly over a white marble plinth against a light gray background. The lighting is soft and directional, creating subtle shadows that enhance the texture and luxury feel of the minimal jewelry piece." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBUpn2yMZNk5LvyuORkhZSNLuTVwzLDSNngeueFc_lyw8ehxI4I_kGtfwU1QWVcIP5QVLwoqzxrNhFZQfU40t9X63g_3GGQw9LArMCSHPyllWTClC-V4aJNp6pJfy-_F1TXLnvl8a-vhKFgPdfT80yN2AsZn41d9yDh2qfqHBvzgPtzLqJnSQl8x69_xL_vvKzI4NQ4mGbjWzOBIT9pcsmy75NZR2NfxQJ8Be_iaqRc1fp-WsZPW7M"/>
                      </div>
                      <div>
                        <p className="font-medium text-deep-emerald group-hover:text-regal-gold transition-colors">Sapphire Chain Bracelet</p>
                        <p className="text-sm text-on-surface-variant mt-1">Order #CL-8891B</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-6 px-4 text-on-surface">Sep 28, 2024</td>
                  <td className="py-6 px-4 text-on-surface">$850.00</td>
                  <td className="py-6 pl-4 text-right">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-outline-variant/20 text-on-surface-variant text-sm font-medium border border-outline-variant/30">
                      <span className="material-symbols-outlined text-[14px]">local_shipping</span> In Transit
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
