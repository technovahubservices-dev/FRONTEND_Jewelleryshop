import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Header() {
  const { isAuthenticated, logout } = useAuth()

  return (
    <>
      <header className="bg-surface shadow-sm docked full-width top-0 sticky z-40 border-b border-outline-variant">
        <div className="flex flex-col w-full max-w-container-max mx-auto px-margin-desktop">
          <div className="flex items-center justify-between h-20">
            <div className="flex-1"></div>
            <Link className="text-display-lg font-display-lg tracking-tighter text-deep-emerald hover:opacity-80 transition-opacity" to="/">
              CARATLANE
            </Link>
            <div className="flex-1 flex justify-end items-center space-x-6 text-primary">
              <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out">
                <span className="material-symbols-outlined text-[24px]">search</span>
              </button>
              <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out">
                <span className="material-symbols-outlined text-[24px]">storefront</span>
              </button>
              <button className="hover:text-regal-gold transition-colors scale-95 duration-200 ease-in-out">
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
                <span className="absolute -top-1 -right-1 bg-regal-gold text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">2</span>
              </Link>
            </div>
          </div>
          <nav className="hidden md:flex justify-center space-x-8 pb-4">
            <NavLink to="/shop" className={({ isActive }) => `text-primary border-b-2 pb-1 scale-95 duration-200 ease-in-out ${isActive ? 'border-regal-gold' : 'border-transparent'}`}>Jewellery</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out pb-1 border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Diamond</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out pb-1 border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Earrings</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out pb-1 border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Rings</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out pb-1 border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Necklaces</NavLink>
            <NavLink to="/shop" className={({ isActive }) => `text-on-surface-variant hover:text-primary transition-colors duration-300 scale-95 duration-200 ease-in-out pb-1 border-b-2 ${isActive ? 'border-regal-gold text-primary' : 'border-transparent'}`}>Collections</NavLink>
          </nav>
        </div>
      </header>
      <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-outline-variant flex items-center justify-between p-4 shadow-sm">
        <button><span className="material-symbols-outlined">menu</span></button>
        <Link className="font-display-lg text-[24px] text-deep-emerald tracking-tighter" to="/">CARATLANE</Link>
        <Link to="/cart"><span className="material-symbols-outlined">shopping_bag</span></Link>
      </header>
    </>
  );
}
