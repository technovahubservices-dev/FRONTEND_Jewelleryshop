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
  const [accessoriesOpen, setAccessoriesOpen] = useState(false)

  const accessorySubcategories = [
    'Engagement Rings',
    'Wedding Bands',
    'Cocktail Rings',
    'Promise Rings',
    'Diamond Necklaces',
    'Gold Chains',
    'Pendant Sets',
    'Diamond Earrings',
    'Gold Earrings',
    'Hoop Earrings',
    'Stud Earrings',
    'Bracelets',
    'Bangles',
    'Cuffs',
    'Chain Bracelets',
  ]

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
    `relative whitespace-nowrap py-2 text-sm tracking-wide transition-colors duration-300 ${
      isActive
        ? 'text-primary after:absolute after:left-0 after:right-0 after:bottom-0 after:h-[1px] after:bg-regal-gold'
        : 'text-on-surface-variant hover:text-primary'
    }`

  return (
    <header className="w-full flex flex-col relative z-50">
      <AnnouncementBar />

      {/* Desktop Header */}
      <div className="hidden md:block w-full bg-white border-b border-outline-variant">
        <div className="w-full px-6 lg:px-10 xl:px-16">

          {/* Top row */}
          <div className="relative min-h-[82px] flex items-center justify-between">

            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 transition-opacity hover:opacity-80"
            >
              <img
                src={logo}
                alt="JKR"
                className="w-16 h-16 lg:w-[68px] lg:h-[68px] object-contain"
              />
            </Link>

            {/* Center navigation */}
            <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-7 lg:gap-9 xl:gap-10">
              <NavLink to="/shop?category=Necklaces" className={navClass}>
                Necklace
              </NavLink>

              <NavLink to="/shop?category=Bangles" className={navClass}>
                Bangles
              </NavLink>

              <NavLink to="/shop?category=Earrings" className={navClass}>
                Earrings
              </NavLink>

              <NavLink to="/shop?bridal=true" className={navClass}>
                Premium Bride
              </NavLink>

              <div className="relative group">
                <button
                  type="button"
                  className="relative whitespace-nowrap py-2 text-sm tracking-wide text-on-surface-variant hover:text-primary transition-colors duration-300"
                >
                  Accessories
                </button>

                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-3 hidden group-hover:block bg-white shadow-lg border border-outline-variant min-w-[230px] py-2 z-50">
                  {accessorySubcategories.map((subcategory) => (
                    <NavLink
                      key={subcategory}
                      to={`/shop?subcategory=${encodeURIComponent(subcategory)}`}
                      className="block px-5 py-2.5 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low transition-colors"
                    >
                      {subcategory}
                    </NavLink>
                  ))}
                </div>
              </div>

              <NavLink to="/about" className={navClass}>
                About
              </NavLink>

              <NavLink to="/contact" className={navClass}>
                Contact us
              </NavLink>
            </nav>

            {/* Utility icons */}
            <div className="ml-auto flex items-center gap-5 lg:gap-6 text-primary">
              <button
                className="hover:text-regal-gold transition-colors"
                onClick={() => navigate('/search')}
                title="Search"
              >
                <span className="material-symbols-outlined text-[22px]">
                  search
                </span>
              </button>

              <button
                className="relative hover:text-regal-gold transition-colors"
                onClick={() => navigate('/wishlist')}
                title="Wishlist"
              >
                <span className="material-symbols-outlined text-[22px]">
                  favorite
                </span>

                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </button>

              <button
                className="relative hover:text-regal-gold transition-colors"
                onClick={() => navigate('/cart')}
                title="Cart"
              >
                <span className="material-symbols-outlined text-[22px]">
                  shopping_cart
                </span>

                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </button>

              <button
                className="hover:text-regal-gold transition-colors"
                onClick={() => navigate('/shop')}
                title="Shop"
              >
                <span className="material-symbols-outlined text-[22px]">
                  storefront
                </span>
              </button>

              {isAuthenticated ? (
                <Link
                  to="/account"
                  title="My Account"
                  className="hover:text-regal-gold transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    person
                  </span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  title="Login"
                  className="hover:text-regal-gold transition-colors"
                >
                  <span className="material-symbols-outlined text-[22px]">
                    person
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant shadow-sm">
        <div className="h-[64px] px-4 flex items-center justify-between">

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Menu"
            className="w-10 h-10 flex items-center justify-start"
          >
            <span className="material-symbols-outlined">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>

          <Link
            className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2 text-[24px] font-display-lg text-deep-emerald tracking-tighter"
            to="/"
          >
            <img
              src={logo}
              alt="JKR"
              className="w-8 h-8 object-contain"
            />
            <span>JKR</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/wishlist')}
              className="relative"
              title="Wishlist"
            >
              <span className="material-symbols-outlined">
                favorite
              </span>

              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {wishlistCount > 99 ? '99+' : wishlistCount}
                </span>
              )}
            </button>

            <button
              className="relative"
              onClick={() => navigate('/cart')}
              title="Cart"
            >
              <span className="material-symbols-outlined">
                shopping_cart
              </span>

              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-surface-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </button>

            <Link to="/account" title="My Account">
              <span className="material-symbols-outlined">
                person
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Drawer */}
      <nav
        className={`fixed top-0 left-0 h-full w-[82%] max-w-sm bg-surface shadow-xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col pt-20 px-6 pb-8 overflow-y-auto h-full">

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
                    <span className="material-symbols-outlined">
                      {accessoriesOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>

                  {accessoriesOpen && (
                    <div className="pl-4 pb-2 space-y-1">
                      {accessorySubcategories.map((subcategory) => (
                        <NavLink
                          key={subcategory}
                          to={`/shop?subcategory=${encodeURIComponent(subcategory)}`}
                          onClick={closeMobileMenu}
                          className="block py-2 px-2 text-sm text-on-surface-variant hover:text-deep-emerald"
                        >
                          {subcategory}
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
