import { Link } from 'react-router-dom'
import WhatsAppButton from '../WhatsAppButton'

export default function Footer() {
return (
    <>
      <footer className="bg-soft-cream w-full py-20 px-margin-desktop border-t border-outline-variant mt-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter max-w-container-max mx-auto">

          {/* Company Information */}
          <div className="md:col-span-3 mb-10 md:mb-0">
            <div className="text-headline-lg font-headline-lg text-deep-emerald mb-6">
              JKR
            </div>

            <p className="text-on-surface-variant text-sm mb-6 max-w-sm">
              Crafting timeless elegance for the modern connoisseur.
              Experience quiet luxury in every detail.
            </p>


            <div className="flex space-x-4 text-deep-emerald opacity-80 hover:opacity-100 transition-opacity">
              <a href="mailto:kruthikajewellery@gmail.com" aria-label="Email" className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">mail</span>
              </a>
              <a href="https://www.instagram.com/kruthika_jewellery/" target="_blank" rel="noreferrer" aria-label="Instagram" className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">photo_camera</span>
              </a>
              <a href="https://www.facebook.com/kruthikajewellery" target="_blank" rel="noreferrer" aria-label="Facebook" className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">thumb_up</span>
              </a>
              <a href="https://www.youtube.com/@kruthikajewellery" target="_blank" rel="noreferrer" aria-label="YouTube" className="hover:text-primary transition-colors">
                <span className="material-symbols-outlined">play_circle</span>
              </a>
            </div>
          </div>

          {/* Explore */}
          <div className="md:col-span-2 md:col-start-5">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
              Explore
            </h3>

            <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  to="/shop"
                >
                  Jewellery
                </Link>
              </li>

              <li>
                <Link
                  className="hover:text-primary transition-colors"
                  to="/shop"
                >
                  Collections
                </Link>
              </li>
            </ul>
          </div>

          {/* Get In Touch */}
          <div className="md:col-span-3">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
              Get In Touch
            </h3>

            <div className="space-y-3 text-sm text-on-surface-variant">
              <p>
                <span className="font-semibold">WhatsApp (Messages Only):</span><br />
                <a href="https://wa.me/918951218527" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                  +91 89512 18527
                </a>
              </p>
              <p>
                <span className="font-semibold">Email:</span><br />
                <a href="mailto:kruthikajewellery@gmail.com" className="hover:text-primary transition-colors">
                  kruthikajewellery@gmail.com
                </a>
              </p>
              <p>
                <span className="font-semibold">Business Hours:</span><br />
                10 am - 7 pm (Mon-Sat)
              </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
              Quick Links
            </h3>

            <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
              <li><Link className="hover:text-primary transition-colors" to="/account">My Account</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/about">About Us</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/contact">Contact Us</Link></li>
              <li><Link className="hover:text-primary transition-colors" to="/contact">Reviews</Link></li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="max-w-container-max mx-auto mt-16 pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-center text-sm text-on-surface-variant">
          <p>&copy; 2024 JKR. All Rights Reserved.</p>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              className="hover:text-deep-emerald"
              to="/account"
            >
              Privacy Policy
            </Link>

            <Link
              className="hover:text-deep-emerald"
              to="/account"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
      </footer>

      {/* Fixed WhatsApp Button */}
      <WhatsAppButton />
    </>
  )
}





