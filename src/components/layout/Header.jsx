import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import AnnouncementBar from '../../pages/AnnouncementBar'
import logo from '../../assets/icons/logo.jpeg'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const mobileNavLinks = [
    { name: 'Shop', to: '/shop' },
    { name: 'Necklace', to: '/shop' },
    { name: 'Bangles', to: '/shop' },
    { name: 'Earrings', to: '/shop' },
    { name: 'Premium Bride', to: '/shop' },
    { name: 'Accessories', to: '/shop' },
    { name: 'Blog', to: '/blog' },
    { name: 'Contact us', to: '/contact' },
  ]

  const closeMobileMenu = () => setMobileMenuOpen(false)

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
            <img src={logo} alt="JKR" className="w-15 h-14 object-contain" />
            <span></span>
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
           <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out relative" onClick={() => navigate('/cart')} title="Cart">
            <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-[2px]">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
           <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out relative" onClick={() => navigate('/wishlist')} title="Wishlist">
            <span className="material-symbols-outlined text-[24px]">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px] px-[2px]">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
           </button>
          <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out" onClick={() => navigate('/shop')} title="Shop">
            <span className="material-symbols-outlined text-[24px]">storefront</span>
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
        </div>
      </div>

      {/* Mobile view header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant flex items-center justify-between p-4 shadow-sm">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          title="Menu"
        >
          <span className="material-symbols-outlined">
            {mobileMenuOpen ? 'close' : 'menu'}
          </span>
        </button>
        <Link className="flex items-center gap-2 font-display-lg text-[24px] text-deep-emerald tracking-tighter" to="/">
          <img src={logo} alt="JKR" className="w-6 h-6 object-contain" />
          <span>JKR</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/wishlist')} className="relative" title="Wishlist">
            <span className="material-symbols-outlined">favorite</span>
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] px-[1px]">
                {wishlistCount > 99 ? '99+' : wishlistCount}
              </span>
            )}
          </button>
          <button className="relative" onClick={() => navigate('/cart')} title="Cart">
            <span className="material-symbols-outlined">shopping_cart</span>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px] px-[1px]">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </button>
          <Link to="/account"><span className="material-symbols-outlined">person</span></Link>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile menu drawer */}
      <nav
        className={`fixed top-0 left-0 h-full w-4/5 max-w-xs bg-surface shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col pt-16 px-6 space-y-4">
          {mobileNavLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.to}
              onClick={closeMobileMenu}
              className={({ isActive }) =>
                `block py-3 px-2 text-lg font-body-md transition-colors duration-200 ${
                  isActive
                    ? 'text-deep-emerald border-l-2 border-regal-gold'
                    : 'text-on-surface-variant hover:text-deep-emerald'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          <div className="border-t border-outline-variant pt-4 mt-4">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  closeMobileMenu()
                }}
                className="block w-full text-left py-3 px-2 text-lg font-body-md text-on-surface-variant hover:text-deep-emerald transition-colors duration-200"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block py-3 px-2 text-lg font-body-md text-on-surface-variant hover:text-deep-emerald transition-colors duration-200"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
