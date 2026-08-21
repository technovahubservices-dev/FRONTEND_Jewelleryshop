export default function Checkout() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-10 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
      {/* Main Checkout Content (Left Side) */}
      <div className="lg:col-span-8 flex flex-col gap-10">
        {/* Progress Indicator */}
        <nav aria-label="Progress" className="mb-6">
          <ol className="flex items-center" role="list">
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-deep-emerald"></div>
              </div>
              <a className="relative flex h-8 w-8 items-center justify-center rounded-full bg-deep-emerald hover:bg-surface-tint" href="#">
                <span className="material-symbols-outlined text-white text-sm" data-icon="check" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>check</span>
              </a>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-deep-emerald whitespace-nowrap">LOGIN</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-outline-variant"></div>
              </div>
              <a aria-current="step" className="relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-deep-emerald bg-surface-white" href="#">
                <span className="font-label-caps text-label-caps text-deep-emerald">2</span>
              </a>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-deep-emerald whitespace-nowrap font-bold">ADDRESS</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-outline-variant"></div>
              </div>
              <a className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline" href="#">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">3</span>
              </a>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">SHIPPING</span>
            </li>
            <li className="relative pr-8 sm:pr-20">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="h-[1px] w-full bg-outline-variant"></div>
              </div>
              <a className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline" href="#">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">4</span>
              </a>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">PAYMENT</span>
            </li>
            <li className="relative">
              <a className="group relative flex h-8 w-8 items-center justify-center rounded-full border-2 border-outline-variant bg-surface-white hover:border-outline" href="#">
                <span className="font-label-caps text-label-caps text-outline-variant group-hover:text-outline">5</span>
              </a>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 font-label-caps text-label-caps text-outline-variant whitespace-nowrap">DONE</span>
            </li>
          </ol>
        </nav>
        {/* Address Form Container */}
        <section className="bg-surface-white rounded-lg p-6 md:p-10 border border-outline-variant shadow-[0_4px_30px_rgba(0,0,0,0.02)]">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-8 flex items-center gap-3">
            <span className="material-symbols-outlined" data-icon="location_on">location_on</span>
            Shipping Address
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="full-name">Full Name</label>
              <input autoComplete="name" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="full-name" name="full-name" placeholder="Enter your full name" type="text"/>
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="pincode">Pincode</label>
              <input autoComplete="postal-code" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="pincode" name="pincode" placeholder="e.g. 400001" type="text"/>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="address">Address (House No, Building, Street, Area)</label>
              <input autoComplete="street-address" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="address" name="address" type="text"/>
            </div>
            <div className="col-span-1 md:col-span-2">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="landmark">Landmark (Optional)</label>
              <input className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="landmark" name="landmark" type="text"/>
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="city">City</label>
              <input autoComplete="address-level2" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="city" name="city" placeholder="e.g. Mumbai" type="text"/>
            </div>
            <div className="col-span-1">
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="state">State</label>
              <select autoComplete="address-level1" className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors" id="state" name="state">
                <option value="">Select State</option>
                <option value="MH">Maharashtra</option>
                <option value="DL">Delhi</option>
                <option value="KA">Karnataka</option>
              </select>
            </div>
            <div className="col-span-1 md:col-span-2 mt-6">
              <button className="w-full md:w-auto bg-deep-emerald text-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-surface-tint transition-colors flex items-center justify-center gap-2" type="button">
                CONTINUE TO PAYMENT
                <span className="material-symbols-outlined" data-icon="arrow_forward">arrow_forward</span>
              </button>
            </div>
          </form>
        </section>
        {/* Payment Options (Disabled Preview for structural purposes) */}
        <section className="opacity-50 pointer-events-none bg-surface-white rounded-lg p-6 md:p-10 border border-outline-variant shadow-sm flex flex-col gap-6">
          <h2 className="font-headline-md text-headline-md text-on-surface-variant flex items-center gap-3">
            <span className="material-symbols-outlined" data-icon="payments">payments</span>
            Payment Method
          </h2>
          <div className="text-sm text-outline">Complete address to unlock payment options.</div>
        </section>
      </div>
      {/* Order Summary Sidebar (Right Side) */}
      <div className="lg:col-span-4 mt-10 lg:mt-0">
        <div className="sticky top-28 bg-surface-white rounded-lg p-6 border border-outline-variant shadow-[0_4px_30px_rgba(0,0,0,0.02)] flex flex-col gap-6">
          <h3 className="font-headline-md text-headline-md text-deep-emerald border-b border-outline-variant pb-4">Order Summary</h3>
          {/* Product Item */}
          <div className="flex gap-4 items-center">
            <div className="w-20 h-20 bg-surface-container-low rounded shrink-0 overflow-hidden relative">
              <img className="object-cover w-full h-full" data-alt="A macro studio shot of a delicate rose gold diamond necklace on a clean white background, high key lighting, luxurious feel, soft reflections. The jewelry sits perfectly centered, capturing the brilliance of the diamonds." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8tPo6nN-oWxvysjJIkPqDx6r-4z2lf9sqMB3q3PqVR82LtT_TnUR1_2e78RYoIhmsvRdISw3Edyqf43JrvRgi2kMA64S2ep_0KPYa44czewISZRV8NrToyY2q0fjpTR5JTgdc46D8id5mlVj3r0N5-F1r2YGG5YMmsChbzsjMmKLT1iynD0D-4F47u94Y4WTKUL2nTj_5FT-xZh3Obmpz9zaDOB-6_6VEpWrqoYgMMBvjHQW_dPo"/>
            </div>
            <div className="flex-grow">
              <p className="font-body-md font-semibold text-deep-emerald line-clamp-1">Ornate Floral Diamond Necklace</p>
              <p className="text-sm text-on-surface-variant">Qty: 1</p>
              <p className="font-body-md text-on-background mt-1">₹ 85,000</p>
            </div>
          </div>
          <hr className="border-outline-variant"/>
          {/* Cost Breakdown */}
          <div className="flex flex-col gap-3 font-body-md text-on-surface-variant">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹ 85,000</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="text-deep-emerald font-semibold">Free</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (Included)</span>
              <span>₹ 2,550</span>
            </div>
          </div>
          <hr className="border-outline-variant"/>
          <div className="flex justify-between font-headline-md text-headline-md text-deep-emerald">
            <span>Total</span>
            <span>₹ 85,000</span>
          </div>
          {/* Trust Badges */}
          <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-4">
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="verified_user">verified_user</span>
              <span>100% Secure Payments</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="workspace_premium">workspace_premium</span>
              <span>BIS Hallmarked Jewellery</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-on-surface-variant">
              <span className="material-symbols-outlined text-regal-gold" data-icon="local_shipping">local_shipping</span>
              <span>Insured Free Shipping</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
