export default function Cart() {
  return (
    <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-24">
      <div className="mb-12">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-4">Your Shopping Bag</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">2 Items</p>
      </div>
      <div className="flex flex-col lg:flex-row gap-gutter">
        {/* Cart Items */}
        <div className="w-full lg:w-2/3 space-y-8">
          {/* Item 1 */}
          <div className="bg-surface-white border border-outline-variant p-6 flex flex-col sm:flex-row gap-6 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full sm:w-48 h-48 bg-soft-cream flex-shrink-0">
              <img className="w-full h-full object-cover" data-alt="A macro studio shot of an elegant 18kt yellow gold diamond ring featuring a sparkling central solitaire on a clean, soft cream background, exuding quiet luxury and precision craftsmanship, soft even lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDGMogTfHhmwRmLqX71H1RPes29z9bAE8Ov3DkNS0fnyU0koeVT_c2h-xteoYYzdhKTTHDwrMWsS2CaK6rV_0Hm-ZDPnqKKTPU_-MVgrqS8M1Oc--dFLnWcm444FWld53kpAU3IMmzoc4JBhs2ke8U8YXGL5ySeZwvpsbMs-kZ8aAc8cHYvR0MM4Zp5V7XXyv5LDiEw54QdoYnwhJlbs4zVvXc5KwozwcFZA41j50K6Lghlf4r5PqY"/>
            </div>
            <div className="flex-col flex-grow flex justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-headline-md text-deep-emerald">The Eternal Diamond Solitaire Ring</h3>
                  <p className="font-headline-md text-headline-md text-deep-emerald">$1,250</p>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-1">SKU: JR-0982-18Y</p>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">18kt Yellow Gold, Size 6, SI Quality</p>
              </div>
              <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-4 gap-4">
                <div className="flex items-center border border-outline-variant px-3 py-1">
                  <button className="text-on-surface hover:text-deep-emerald p-1"><span className="material-symbols-outlined text-sm">remove</span></button>
                  <span className="mx-4 font-body-md text-body-md">1</span>
                  <button className="text-on-surface hover:text-deep-emerald p-1"><span className="material-symbols-outlined text-sm">add</span></button>
                </div>
                <div className="flex space-x-4">
                  <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-regal-gold transition-colors flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">favorite</span> Move to Wishlist
                  </button>
                  <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-error transition-colors flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">delete</span> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Item 2 */}
          <div className="bg-surface-white border border-outline-variant p-6 flex flex-col sm:flex-row gap-6 relative shadow-sm hover:shadow-md transition-shadow">
            <div className="w-full sm:w-48 h-48 bg-soft-cream flex-shrink-0">
              <img className="w-full h-full object-cover" data-alt="A highly detailed product photograph of a delicate rose gold diamond pendant necklace resting on a smooth white surface, capturing subtle reflections and a minimalist luxury aesthetic with gentle, bright lighting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuArbKwkrfPAkZyeWFDZS2yvZnXDS5_uQ_5PMF-4BIaK0mSS0KRfI6_74VZJIH8d8rSW43JRLR7COZNVtDOaULM0b7eodKp8rHQdnqJuCZNDFge4416x9da4OLrLRb3aeV6CwZS2eAahq7IdRMNuDCteyfr8mt9dg93qIdVVFTrR2sfS0jc9iHswBjcMjCBTB9llNoVGUK7sqeHR4lJdqSO88n_erKJbpHP4bngSOu0HGK1zTcvfM-w"/>
            </div>
            <div className="flex-col flex-grow flex justify-between">
              <div>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-headline-md text-headline-md text-deep-emerald">Rose Gold Diamond Pendant</h3>
                  <p className="font-headline-md text-headline-md text-deep-emerald">$850</p>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant mb-1">SKU: PN-0112-14R</p>
                <p className="font-body-md text-body-md text-on-surface-variant mb-4">14kt Rose Gold, VVS Quality</p>
              </div>
              <div className="flex flex-wrap items-center justify-between border-t border-outline-variant pt-4 gap-4">
                <div className="flex items-center border border-outline-variant px-3 py-1">
                  <button className="text-on-surface hover:text-deep-emerald p-1"><span className="material-symbols-outlined text-sm">remove</span></button>
                  <span className="mx-4 font-body-md text-body-md">1</span>
                  <button className="text-on-surface hover:text-deep-emerald p-1"><span className="material-symbols-outlined text-sm">add</span></button>
                </div>
                <div className="flex space-x-4">
                  <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-regal-gold transition-colors flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">favorite</span> Move to Wishlist
                  </button>
                  <button className="font-label-caps text-label-caps text-on-surface-variant hover:text-error transition-colors flex items-center">
                    <span className="material-symbols-outlined text-sm mr-1">delete</span> Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="w-full lg:w-1/3">
          <div className="bg-surface-white border border-outline-variant p-8 shadow-sm sticky top-32">
            <h2 className="font-headline-md text-headline-md text-deep-emerald border-b border-outline-variant pb-4 mb-6">Order Summary</h2>
            <div className="space-y-4 mb-6 font-body-md text-body-md">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Subtotal (2 Items)</span>
                <span className="text-on-surface">$2,100</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Making Charges</span>
                <span className="text-on-surface">$150</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Tax</span>
                <span className="text-on-surface">$120</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">Delivery</span>
                <span className="text-primary font-semibold">Free</span>
              </div>
            </div>
            {/* Coupon Input */}
            <div className="mb-6 border-t border-b border-outline-variant py-6">
              <div className="flex">
                <input className="w-full bg-soft-cream border-t border-l border-b border-outline-variant px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-deep-emerald focus:ring-0" placeholder="Enter Coupon Code" type="text"/>
                <button className="bg-surface-white border border-outline-variant px-6 font-label-caps text-label-caps text-deep-emerald hover:bg-surface-container-low transition-colors">APPLY</button>
              </div>
            </div>
            <div className="flex justify-between items-center mb-8">
              <span className="font-headline-md text-headline-md text-deep-emerald">Total</span>
              <span className="font-headline-md text-headline-md text-deep-emerald">$2,370</span>
            </div>
            <button className="w-full bg-deep-emerald text-white font-label-caps text-label-caps py-4 tracking-widest hover:bg-opacity-90 transition-opacity">
              PROCEED TO CHECKOUT
            </button>
            <div className="mt-6 flex items-center justify-center space-x-2 text-on-surface-variant text-sm">
              <span className="material-symbols-outlined text-lg">lock</span>
              <span>Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
