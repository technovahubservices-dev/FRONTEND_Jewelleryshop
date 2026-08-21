import { Link, useLocation } from 'react-router-dom'

export default function SideNavBar() {
  const location = useLocation()

  const navItems = [
    { name: 'Dashboard', icon: 'dashboard', path: '/admin' },
    { name: 'Products', icon: 'diamond', path: '/admin/products' },
    { name: 'Categories', icon: 'category', path: '/admin/categories' },
    { name: 'Orders', icon: 'shopping_bag', path: '/admin/orders' },
    { name: 'Settings', icon: 'settings', path: '/admin/settings' },
  ]

  const footerItems = [
    { name: 'Support', icon: 'help_outline', path: '#' },
    { name: 'Sign Out', icon: 'logout', path: '#' },
  ]

  return (
    <aside className="bg-soft-cream dark:bg-primary-container text-deep-emerald dark:text-primary-fixed-dim border-r border-outline-variant dark:border-outline h-screen w-72 flex flex-col fixed left-0 top-0 z-20">
      <div className="px-6 py-8 flex items-center gap-4 border-b border-outline-variant dark:border-outline">
        <div className="w-10 h-10 rounded-full bg-deep-emerald flex items-center justify-center text-on-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
            diamond
          </span>
        </div>
        <div>
          <h1 className="font-display-lg text-display-lg text-deep-emerald dark:text-primary-fixed-dim tracking-tight text-[28px]">
             Admin
          </h1>
          <p className="font-label-caps text-label-caps text-on-surface-variant mt-1">Management Portal</p>
        </div>
      </div>
      <div className="flex flex-col h-full overflow-y-auto py-6">
        <ul className="flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path
            return (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-4 px-6 py-4 text-on-surface-variant dark:text-on-surface hover:bg-surface-container-high dark:hover:bg-surface-container transition-colors duration-200 group ${
                    isActive
                      ? 'text-on-primary bg-deep-emerald dark:bg-primary-fixed dark:text-on-primary-fixed font-bold  text-[#FFFCEE]  active-nav group relative'
                      : ''
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-regal-gold"></div>
                  )}
                  <span
                    className="material-symbols-outlined text-xl group-active:scale-95 transition-transform duration-150 ease-in-out"
                    style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                  >
                    {item.icon}
                  </span>
                  <span className="font-label-caps text-label-caps">{item.name}</span>
                </Link>
              </li>
            )
          })}
        </ul>
        <div className="mt-auto border-t border-outline-variant pt-4 pb-4">
          <ul className="space-y-2">
            {footerItems.map((item) => (
              <li key={item.name}>
                <a
                  href={item.path}
                  className="flex items-center gap-4 px-6 py-3 text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200 group"
                >
                  <span className="material-symbols-outlined text-xl group-active:scale-95 transition-transform duration-150 ease-in-out">
                    {item.icon}
                  </span>
                  <span className="font-label-caps text-label-caps">{item.name}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
