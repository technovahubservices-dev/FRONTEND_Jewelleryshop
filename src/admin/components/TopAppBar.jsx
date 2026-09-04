import { useAuth } from '../../context/AuthContext'

export default function TopAppBar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
        </div>
        <input
          className="block w-full pl-10 pr-3 py-2 border-none bg-surface-container-low rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:bg-white transition-colors"
          placeholder="Search products, SKUs, or orders..."
          type="text"
        />
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-deep-emerald flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}
