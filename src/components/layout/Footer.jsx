import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  };

  if (subscribed) {
    return (
      <footer className="bg-soft-cream w-full py-20 px-margin-desktop border-t border-outline-variant mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">
          <div className="md:col-span-4 mb-10 md:mb-0">
            <div className="text-headline-lg font-headline-lg text-deep-emerald mb-6">CARATLANE</div>
            <p className="text-on-surface-variant text-sm mb-6 max-w-sm">Crafting timeless elegance for the modern connoisseur. Experience quiet luxury in every detail.</p>
            <div className="flex space-x-4 text-deep-emerald opacity-80 hover:opacity-100 transition-opacity">
              <Link aria-label="Instagram" to="/shop"><span className="material-symbols-outlined">photo_camera</span></Link>
              <Link aria-label="Facebook" to="/shop"><span className="material-symbols-outlined">thumb_up</span></Link>
              <Link aria-label="Twitter" to="/shop"><span className="material-symbols-outlined">alternate_email</span></Link>
            </div>
          </div>
          <div className="md:col-span-2 md:col-start-6">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Explore</h3>
            <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" to="/shop">Jewellery</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/shop">Diamond</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/shop">Collections</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/shop">Store Finder</Link></li>
            </ul>
          </div>
          <div className="md:col-span-2">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Customer Care</h3>
            <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" to="/account">Support</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/account">Shipping</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/account">Returns</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/account">Track Order</Link></li>
            </ul>
          </div>
          <div className="md:col-span-3">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Newsletter</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form onSubmit={handleSubscribe} className="flex border-b border-deep-emerald pb-2">
              <input
                className="bg-transparent border-none focus:ring-0 w-full font-body-md px-0 py-1 placeholder:text-outline-variant"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="text-deep-emerald hover:text-regal-gold transition-colors font-label-caps uppercase tracking-widest text-xs">Subscribe</button>
            </form>
          </div>
        </div>
        <div className="max-w-container-max mx-auto mt-16 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant">
          <p>&copy; 2024 CaratLane. All Rights Reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link className="hover:text-deep-emerald" to="/account">Privacy Policy</Link>
            <Link className="hover:text-deep-emerald" to="/account">Terms of Service</Link>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="bg-soft-cream w-full py-20 px-margin-desktop border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">
        <div className="md:col-span-4 mb-10 md:mb-0">
          <div className="text-headline-lg font-headline-lg text-deep-emerald mb-6">CARATLANE</div>
          <p className="text-on-surface-variant text-sm mb-6 max-w-sm">Crafting timeless elegance for the modern connoisseur. Experience quiet luxury in every detail.</p>
          <div className="flex space-x-4 text-deep-emerald opacity-80 hover:opacity-100 transition-opacity">
            <Link aria-label="Instagram" to="/shop"><span className="material-symbols-outlined">photo_camera</span></Link>
            <Link aria-label="Facebook" to="/shop"><span className="material-symbols-outlined">thumb_up</span></Link>
            <Link aria-label="Twitter" to="/shop"><span className="material-symbols-outlined">alternate_email</span></Link>
          </div>
        </div>
        <div className="md:col-span-2 md:col-start-6">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Explore</h3>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" to="/shop">Jewellery</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/shop">Diamond</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/shop">Collections</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/shop">Store Finder</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Customer Care</h3>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><Link className="hover:text-primary transition-colors" to="/account">Support</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/account">Shipping</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/account">Returns</Link></li>
            <li><Link className="hover:text-primary transition-colors" to="/account">Track Order</Link></li>
          </ul>
        </div>
          <div className="md:col-span-3">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Newsletter</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <form onSubmit={handleSubscribe} className="flex border-b border-deep-emerald pb-2">
              <input
                className="bg-transparent border-none focus:ring-0 w-full font-body-md px-0 py-1 placeholder:text-outline-variant"
                placeholder="Enter your email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit" className="text-deep-emerald hover:text-regal-gold transition-colors font-label-caps uppercase tracking-widest text-xs">Subscribe</button>
            </form>
          </div>
      </div>
      <div className="max-w-container-max mx-auto mt-16 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant">
        <p>&copy; 2024 CaratLane. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link className="hover:text-deep-emerald" to="/account">Privacy Policy</Link>
          <Link className="hover:text-deep-emerald" to="/account">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
