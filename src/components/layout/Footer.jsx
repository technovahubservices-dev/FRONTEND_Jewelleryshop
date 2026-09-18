import { Link } from 'react-router-dom'
import WhatsAppButton from '../WhatsAppButton'

export default function Footer() {
  return (
    <>
      <footer className="bg-soft-cream w-full border-t border-outline-variant mt-auto">
        <div className="w-full px-6 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-14 md:py-16 lg:py-20">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-10 lg:gap-x-14 xl:gap-x-20 gap-y-12">

            {/* Company Information */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col">
              <div className="text-headline-lg font-headline-lg text-deep-emerald mb-5">
                JKR
              </div>

              <p className="text-on-surface-variant text-sm leading-7 mb-7 max-w-sm">
                Crafting timeless elegance for the modern connoisseur.
                Experience quiet luxury in every detail.
              </p>

              <div className="flex items-center gap-5 text-deep-emerald opacity-80 hover:opacity-100 transition-opacity">
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
            <div className="lg:pt-1">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
                Explore
              </h3>

              <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
                <li>
                  <Link className="hover:text-primary transition-colors" to="/shop">
                    Jewellery
                  </Link>
                </li>

                <li>
                  <Link className="hover:text-primary transition-colors" to="/shop">
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Get In Touch */}
            <div className="lg:pt-1">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
                Get In Touch
              </h3>

              <div className="space-y-5 text-sm leading-6 text-on-surface-variant">
                <p>
                  <span className="font-semibold">WhatsApp (Messages Only):</span><br />
                  <a href="https://wa.me/918951218527" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">
                    +91 89512 18527
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Email:</span><br />
                  <a href="mailto:kruthikajewellery@gmail.com" className="hover:text-primary transition-colors break-words">
                    kruthikajewellery@gmail.com
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Business Hours:</span><br />
                  10 am - 7 pm (Mon-Sat)
                </p>
              </div>
            </div>

            {/* Quick Links */}
            <div className="lg:pt-1">
              <h3 className="font-label-caps text-label-caps uppercase tracking-widest text-deep-emerald mb-6">
                Quick Links
              </h3>

              <ul className="space-y-4 font-body-md text-body-md text-on-surface-variant">
                <li>
                  <Link className="hover:text-primary transition-colors" to="/account">
                    My Account
                  </Link>
                </li>

                <li>
                  <Link className="hover:text-primary transition-colors" to="/about">
                    About Us
                  </Link>
                </li>

                <li>
                  <Link className="hover:text-primary transition-colors" to="/contact">
                    Contact Us
                  </Link>
                </li>

                <li>
                  <Link className="hover:text-primary transition-colors" to="/contact">
                    Reviews
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="w-full mt-12 md:mt-16 pt-6 md:pt-8 border-t border-surface-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-sm text-on-surface-variant">
            <p>
              &copy; 2024 JKR. All Rights Reserved.
            </p>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <Link className="hover:text-deep-emerald transition-colors" to="/account">
                Privacy Policy
              </Link>

              <Link className="hover:text-deep-emerald transition-colors" to="/account">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </>
  )
}
