import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import AnnouncementBar from '../../pages/AnnouncementBar'
import logo from '../../assets/icons/logo.jpeg'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  return (
    <header className="w-full flex flex-col relative z-50">
      <AnnouncementBar />

      {/* Main Container: grid system forces true absolute centering */}
      <div className="w-full bg-white shadow-sm py-4 px-6 grid grid-cols-3 items-center">
        
        {/* Left Side: Empty spacer block to maintain perfect balance */}
        <div className="hidden md:block"></div>

        {/* Center Side: Logo, Text, and Navigation Links perfectly grouped together */}
        <div className="flex items-center justify-center gap-8 col-span-3 md:col-span-1">
          <Link className="flex items-center gap-3 text-display-lg font-display-lg tracking-tighter text-deep-emerald hover:opacity-80 transition-opacity shrink-0" to="/">
            <img src={logo} alt="JKR" className="w-13 h-12 object-contain" />
            <span>JKR</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6 shrink-0">
            <NavLink to="/shop" className={({ isActive }) => `text-primary border-b-2 scale-95 duration-200 ease-in-out ${isActive ? 'border-regal-gold' : 'border-transparent'}`}>Necklace</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Bangles</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Earrings</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Premium Bride</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Accessories</NavLink>
            <NavLink to="/contact" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Contact us</NavLink>
          </nav>
        </div>

        {/* Right Side: Utility Icons aligned to the right edge */}
        <div className="hidden md:flex items-center justify-end space-x-6 text-primary shrink-0">
          <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out" onClick={() => navigate('/search')} title="Search">
            <span className="material-symbols-outlined text-[24px]">search</span>
          </button>
          <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out" onClick={() => navigate('/shop')} title="Shop">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
          </button>
          <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out" onClick={() => navigate('/account/wishlist')} title="Wishlist">
            <span className="material-symbols-outlined text-[24px]">favorite</span>
          </button>
          {isAuthenticated ? (
            <button
              onClick={logout}
              className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out"
              title="Sign Out"
            >
              <span className="material-symbols-outlined text-[24px]">logout</span>
            </button>
          ) : (
            <Link to="/login" className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out">
              <span className="material-symbols-outlined text-[24px]">person</span>
            </Link>
          )}
          <Link to="/cart" className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out relative">
            <span className="material-symbols-outlined text-[24px]">shopping_bag</span>
            <span className="absolute -top-1 -right-1 bg-regal-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{totalItems > 0 ? totalItems : 0}</span>
          </Link>
        </div>
      </div>

      {/* Mobile view header remains untouched */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant flex items-center justify-between p-4 shadow-sm">
        <button onClick={() => navigate('/shop')}><span className="material-symbols-outlined">menu</span></button>
        <Link className="flex items-center gap-2 font-display-lg text-[24px] text-deep-emerald tracking-tighter" to="/">
          <img src={logo} alt="JKR" className="w-6 h-6 object-contain" />
          <span>JKR</span>
        </Link>
        <Link to="/cart"><span className="material-symbols-outlined">shopping_bag</span></Link>
      </header>
    </header>
  )
}
