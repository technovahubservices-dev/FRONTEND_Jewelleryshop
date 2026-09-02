import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function SideNavBar({ isOpen, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth()

  const navItems = [
    { name: 'Products', icon: 'fa-regular fa-gem', path: '/admin/products' },
    { name: 'Categories', icon: 'fa-solid fa-layer-group', path: '/admin/categories' },
    { name: 'Quotations', icon: 'fa-solid fa-file-invoice', path: '/admin/quotations' },
    { name: 'Content Management', icon: 'fa-regular fa-file-lines', path: '/admin/content' },
    { name: 'Settings', icon: 'fa-solid fa-gear', path: '/admin/settings' },
  ]

  const footerItems = [
    { name: 'Sign Out', icon: 'fa-solid fa-arrow-right-from-bracket', action: 'logout' },
  ]

  return (
    <aside className={`bg-white border-r border-gray-200 flex flex-col h-screen z-30 transition-transform duration-300 ease-in-out fixed left-0 top-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 w-64`}>
      <div className="h-20 flex items-center px-6 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-deep-emerald flex items-center justify-center text-white">
            <i className="fa-solid fa-gem text-xs"></i>
          </div>
          <div className="flex flex-col">
            <span className="font-playfair font-bold text-deep-emerald text-xl leading-none">
              Admin
            </span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mt-1">
              Management Portal
            </span>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md group transition-colors ${
                isActive
                  ? 'bg-deep-emerald text-white'
                  : 'text-gray-600 hover:bg-emerald-50 hover:text-deep-emerald'
              }`}
            >
              <i className={`${item.icon} w-5 text-center text-sm ${isActive ? 'opacity-90' : 'opacity-70 group-hover:opacity-100 group-hover:text-regal-gold'}`}></i>
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t border-gray-100 flex flex-col gap-1">
        {footerItems.map((item) => (
          <button
            key={item.name}
            onClick={item.action === 'logout' ? logout : undefined}
            className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full ${
              item.action === 'logout'
                ? 'text-gray-500 hover:text-deep-emerald'
                : 'text-gray-500 hover:text-deep-emerald'
            }`}
          >
            <i className={`${item.icon} w-5 text-center text-sm`}></i>
            <span className="text-sm font-medium">{item.name}</span>
          </button>
        ))}
      </div>
    </aside>
  )
}
