export default function Footer() {
  return (
    <footer className="bg-soft-cream w-full py-20 px-margin-desktop border-t border-outline-variant mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">
        <div className="md:col-span-4 mb-10 md:mb-0">
          <div className="text-headline-lg font-headline-lg text-deep-emerald mb-6">CARATLANE</div>
          <p className="text-on-surface-variant text-sm mb-6 max-w-sm">Crafting timeless elegance for the modern connoisseur. Experience quiet luxury in every detail.</p>
          <div className="flex space-x-4 text-deep-emerald opacity-80 hover:opacity-100 transition-opacity">
            <a aria-label="Instagram" href="#"><span className="material-symbols-outlined">photo_camera</span></a>
            <a aria-label="Facebook" href="#"><span className="material-symbols-outlined">thumb_up</span></a>
            <a aria-label="Twitter" href="#"><span className="material-symbols-outlined">alternate_email</span></a>
          </div>
        </div>
        <div className="md:col-span-2 md:col-start-6">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Explore</h3>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><a className="hover:text-primary transition-colors" href="#">Jewellery</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Diamond</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Collections</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Store Finder</a></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Customer Care</h3>
          <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
            <li><a className="hover:text-primary transition-colors" href="#">Support</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Shipping</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Returns</a></li>
            <li><a className="hover:text-primary transition-colors" href="#">Track Order</a></li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">Newsletter</h3>
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
          <div className="flex border-b border-deep-emerald pb-2">
            <input className="bg-transparent border-none focus:ring-0 w-full font-body-md px-0 py-1 placeholder:text-outline-variant" placeholder="Enter your email" type="email"/>
            <button className="text-deep-emerald hover:text-regal-gold transition-colors font-label-caps uppercase tracking-widest text-xs">Subscribe</button>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto mt-16 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant">
        <p>© 2024 CaratLane. All Rights Reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <a className="hover:text-deep-emerald" href="#">Privacy Policy</a>
          <a className="hover:text-deep-emerald" href="#">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
