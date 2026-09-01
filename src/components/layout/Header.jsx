import { Link, NavLink, useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import AnnouncementBar from '../../pages/AnnouncementBar'
import logo from '../../assets/icons/logo.jpeg'

const CATEGORY_LINKS = [
  { label: 'Necklace', slug: 'Necklace' },
  { label: 'Bangles', slug: 'Bangles' },
  { label: 'Earrings', slug: 'Earrings' },
  { label: 'Premium Bride', slug: 'Premium Bride' },
  { label: 'Accessories', slug: 'Accessories' },
]

export default function Header() {
  const { isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const activeCategory = (location.pathname === '/shop' || location.pathname.startsWith('/shop/'))
    ? (searchParams.get('category') || '')
    : ''

  const categoryLinkClass = (slug) => {
    const isActive = activeCategory && activeCategory.toLowerCase() === slug.toLowerCase()
    return `scale-95 duration-200 ease-in-out border-b-2 transition-colors duration-300 ${
      isActive
        ? 'text-primary border-regal-gold'
        : 'text-on-surface-variant hover:text-primary border-transparent'
    }`
  }

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
            {CATEGORY_LINKS.map((cat) => (
              <NavLink
                key={cat.slug}
                to={`/shop?category=${encodeURIComponent(cat.slug)}`}
                className={categoryLinkClass(cat.slug)}
              >
                {cat.label}
              </NavLink>
            ))}
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

      {/* Mobile view header remains untouched */}
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant flex items-center justify-between p-4 shadow-sm">
        <button onClick={() => navigate('/shop')}><span className="material-symbols-outlined">menu</span></button>
        <Link className="flex items-center gap-2 font-display-lg text-[24px] text-deep-emerald tracking-tighter" to="/">
          <img src={logo} alt="JKR" className="w-6 h-6 object-contain" />
          <span>JKR</span>
        </Link>
        <Link to="/account"><span className="material-symbols-outlined">person</span></Link>
      </header>
    </header>
  )
}
