
import { useState, useEffect } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import AnnouncementBar from '../../pages/AnnouncementBar'
import { categoryAPI } from '../../services/api'
import logo from '../../assets/icons/logo.jpeg'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const { itemCount } = useCart()
  const { count: wishlistCount } = useWishlist()
  const navigate = useNavigate()

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [accessoriesOpen, setAccessoriesOpen] = useState(false)
  const [accessories, setAccessories] = useState([])

  useEffect(() => {
    const fetchAccessories = async () => {
      try {
        const response = await categoryAPI.getAll()
        if (response.data?.success) {
          setAccessories((response.data.data || []).filter((category) => category.isActive))
        }
      } catch (error) {
        console.error('Failed to fetch accessories:', error)
      }
    }
    fetchAccessories()
  }, [])

  const mobileNavLinks = [
    { name: 'Shop', to: '/shop' },
    { name: 'Necklace', to: '/shop?category=Necklaces' },
    { name: 'Bangles', to: '/shop?category=Bangles' },
    { name: 'Earrings', to: '/shop?category=Earrings' },
    { name: 'Premium Bride', to: '/shop?bridal=true' },
    { name: 'Accessories', to: '/shop' },
    { name: 'About', to: '/about' },
    { name: 'Contact us', to: '/contact' },
  ]

  const closeMobileMenu = () => {
    setMobileMenuOpen(false)
    setAccessoriesOpen(false)
  }

  const navClass = ({ isActive }) =>
    `relative whitespace-nowrap py-1.5 text-[12px] lg:text-[13px] tracking-[0.10em] font-normal transition-colors duration-300 ${
      isActive
        ? 'text-primary'
        : 'text-on-surface-variant hover:text-primary'
    }`

  return (
    <header className="w-full relative z-50">
      <AnnouncementBar />

      {/* =====================================================
          DESKTOP HEADER
      ===================================================== */}
      <div className="hidden md:block sticky top-0 z-50 w-full bg-white border-t border-b border-outline-variant">
        <div className="w-full px-6 lg:px-10 xl:px-16">
          <div className="relative min-h-[82px] flex items-center justify-between gap-6">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 transition-opacity hover:opacity-80"
            >
              <img
                src={logo}
                alt="JKR"
                className="w-16 h-16 lg:w-[68px] lg:h-[68px] object-cover rounded-full border-2 border-regal-gold shadow-[0_2px_0_rgba(184,134,11,0.55),0_5px_10px_rgba(184,134,11,0.30)]"
              />
            </Link>

            {/* Center Navigation */}
            <nav className="absolute left-[43%] -translate-x-1/2 flex items-center gap-6 lg:gap-7 xl:gap-9 px-5 lg:px-7 py-2 border border-outline-variant rounded-full bg-white shadow-[0_3px_0_rgba(0,0,0,0.10),0_6px_14px_rgba(0,0,0,0.07)]">
              <NavLink
                to="/home"
                className={navClass}
              >
                Home
              </NavLink>

              <NavLink
                to="/about"
                className={navClass}
              >
                About
              </NavLink>

              <NavLink
                to="/shop?category=Necklaces"
                className={navClass}
              >
                Necklace
              </NavLink>

              <NavLink
                to="/shop?category=Bangles"
                className={navClass}
              >
                Bangles
              </NavLink>

              <NavLink
                to="/shop?category=Earrings"
                className={navClass}
              >
                Earrings
              </NavLink>

              

              {/* Accessories */}
              <div className="relative group">
                <button
                  type="button"
                  className="relative whitespace-nowrap py-2 text-sm tracking-wide text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Accessories
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 hidden group-hover:block bg-white shadow-lg border border-outline-variant min-w-[230px] py-2 z-50">
                  {accessories.map((accessory) => (
                    <NavLink
                      key={accessory._id || accessory.id || accessory.name}
                      to={`/shop?subcategory=${encodeURIComponent(accessory.name)}`}
                      className="block px-5 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                    >
                      {accessory.name}
                    </NavLink>
                  ))}
                </div>
              </div>

              

              <NavLink
                to="/contact"
                className={navClass}
              >
                Contact us
              </NavLink>
            </nav>

            {/* =================================================
                DESKTOP UTILITY ICONS
            ================================================= */}
            <div className="ml-auto flex items-center gap-3 lg:gap-4 xl:gap-5 text-primary">

              {/* Search */}
              <button
                className="w-36 lg:w-44 xl:w-52 h-10 px-3 flex items-center justify-end rounded-full border border-outline-variant bg-white shadow-[inset_0_1px_2px_rgba(0,0,0,0.06),0_2px_0_rgba(0,0,0,0.12),0_5px_12px_rgba(0,0,0,0.10)] hover:border-primary hover:text-regal-gold hover:shadow-[inset_0_1px_2px_rgba(0,0,0,0.05),0_3px_0_rgba(0,0,0,0.14),0_7px_14px_rgba(0,0,0,0.12)] transition-all duration-200"
                onClick={() => navigate('/search')}
                title="Search"
              >
                <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                  search
                </span>
              </button>

              {/* Wishlist */}
              <button
                className="relative w-10 h-10 flex items-center justify-center hover:text-regal-gold transition-colors"
                onClick={() => navigate('/wishlist')}
                title="Wishlist"
              >
                <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                  favorite
                </span>

                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              {/* Cart */}
              <button
                className="relative w-10 h-10 flex items-center justify-center hover:text-regal-gold transition-colors"
                onClick={() => navigate('/cart')}
                title="Cart"
              >
                <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                  shopping_cart
                </span>

                {itemCount > 0 && (
                  <span className="absolute top-0 right-0 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              {/* Shop */}
              <button
                className="w-10 h-10 flex items-center justify-center hover:text-regal-gold transition-colors"
                onClick={() => navigate('/shop')}
                title="Shop"
              >
                <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                  storefront
                </span>
              </button>

              {/* Account / Login */}
              {isAuthenticated ? (
                <Link
                  to="/account"
                  title="My Account"
                  className="w-10 h-10 flex items-center justify-center hover:text-regal-gold transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                    person
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  title="Login"
                  className="w-10 h-10 flex items-center justify-center hover:text-regal-gold transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                    person
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE HEADER
      ===================================================== */}
      <div className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <div className="relative h-[64px] px-4 flex items-center justify-between">

          {/* Menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Menu"
            className="w-10 h-10 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[19px] font-normal leading-none">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          {/* Mobile Logo */}
          <Link
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[24px] font-display-lg text-deep-emerald tracking-tighter"
            to="/"
          >
            <img
              src={logo}
              alt="JKR"
              className="w-9 h-9 object-cover rounded-full border-2 border-regal-gold shadow-[0_2px_0_rgba(184,134,11,0.55),0_4px_8px_rgba(184,134,11,0.28)]"
            />
            <span>JKR</span>
          </Link>

          {/* Mobile Utility Icons */}
          <div className="flex items-center gap-3">

            {/* Wishlist */}
            <button
              onClick={() => navigate('/wishlist')}
              className="relative w-10 h-10 flex items-center justify-center"
              title="Wishlist"
            >
              <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                favorite
              </span>

              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            {/* Cart */}
            <button
              className="relative w-10 h-10 flex items-center justify-center"
              onClick={() => navigate('/cart')}
              title="Cart"
            >
              <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                shopping_cart
              </span>

              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            {/* Account */}
            <Link
              to="/account"
              title="My Account"
              className="w-10 h-10 flex items-center justify-center"
            >
              <span className="material-symbols-outlined text-[20px] font-normal leading-none">
                person
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* =====================================================
          MOBILE OVERLAY
      ===================================================== */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* =====================================================
          MOBILE DRAWER
      ===================================================== */}
      <nav
        className={`fixed top-0 left-0 h-full w-[82%] max-w-sm bg-surface shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col pt-6 px-6 pb-12 overflow-y-auto h-full">

          <div className="space-y-1">
            {mobileNavLinks.map((link) =>
              link.name === 'Accessories' ? (
                <div key={link.name}>

                  <button
                    type="button"
                    onClick={() => setAccessoriesOpen(!accessoriesOpen)}
                    className="w-full flex items-center justify-between py-3.5 px-2 text-base font-body-md text-on-surface-variant hover:text-deep-emerald"
                  >
                    <span>Accessories</span>

                    <span className="material-symbols-outlined text-[19px] font-normal leading-none">
                      {accessoriesOpen
                        ? 'expand_less'
                        : 'expand_more'}
                    </span>
                  </button>

                  {accessoriesOpen && (
                    <div className="pl-4 pb-2 space-y-1">
                      {accessories.map((accessory) => (
                        <NavLink
                          key={accessory._id || accessory.id || accessory.name}
                          to={`/shop?subcategory=${encodeURIComponent(accessory.name)}`}
                          onClick={closeMobileMenu}
                          className="block py-2 px-2 text-sm text-on-surface-variant hover:text-deep-emerald"
                        >
                          {accessory.name}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <NavLink
                  key={link.name}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block py-3.5 px-2 text-base font-body-md transition-colors duration-200 ${
                      isActive
                        ? 'text-deep-emerald border-l-2 border-regal-gold pl-4'
                        : 'text-on-surface-variant hover:text-deep-emerald'
                    }`
                  }
                >
                  {link.name}
                </NavLink>
              )
            )}
          </div>

          {/* Mobile Authentication */}
          <div className="border-t border-outline-variant pt-5 mt-6">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  logout()
                  closeMobileMenu()
                }}
                className="block w-full text-left py-3.5 px-2 text-base font-body-md text-on-surface-variant hover:text-deep-emerald"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="block py-3.5 px-2 text-base font-body-md text-on-surface-variant hover:text-deep-emerald"
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






