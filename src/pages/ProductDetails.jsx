export default function ProductDetails() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex text-sm text-on-surface-variant mb-8 font-body-md">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li className="inline-flex items-center">
            <a className="hover:text-primary transition-colors" href="#">Home</a>
          </li>
          <li className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <a className="hover:text-primary transition-colors" href="#">Jewellery</a>
            </div>
          </li>
          <li className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <a className="hover:text-primary transition-colors" href="#">Rings</a>
            </div>
          </li>
          <li aria-current="page" className="">
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <span className="text-primary font-medium">The Solitaire Promise Ring</span>
            </div>
          </li>
        </ol>
      </nav>
      {/* Product Hero Section (Bento/Asymmetric Layout) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-24">
        {/* Image Gallery (Left - 7 cols) */}
        <div className="md:col-span-7 flex flex-col md:flex-row gap-4 h-full">
          {/* Thumbnails (Vertical on desktop) */}
          <div className="hidden md:flex flex-col gap-4 w-24 flex-shrink-0">
            <button className="w-full aspect-square bg-surface-white border-2 border-regal-gold rounded-lg overflow-hidden p-1">
              <img className="w-full h-full object-cover rounded" data-alt="Close up macro photography of a brilliant cut diamond solitaire ring set in 18k yellow gold, resting on a textured cream silk fabric. The lighting is soft and directional, highlighting the facets of the diamond. The mood is luxurious and romantic, fitting a high-end jewelry brand aesthetic." src="https://lh3.googleusercontent.com/aida-public/AB6AXuB154UghwYbZiNZRJYj3LINCsw7pWW30WkWC14dqafErgiZd-IZSMp6kDoc7w3WZQzAbmd7mcO95Ghz9GGtj6BIV1wFZcMNZqWc6OHcM9h58YYGExTpCXR2uxFY2800tBkIP_DwGP68kUiOB5fgHCQOCAa0l_ibzhEX6YbvGVR7Hx8_FTMqWWLPRq8OUPSHGpm1DwEUh03Dez71U_DBS4GFdsIIbVkL0hfCGM_xpQh1yISG1tPpB8M"/>
            </button>
            <button className="w-full aspect-square bg-surface-white border border-outline-variant hover:border-regal-gold rounded-lg overflow-hidden p-1 transition-colors">
              <img className="w-full h-full object-cover rounded" data-alt="Side profile view of a diamond solitaire ring in 18k yellow gold, showing the intricate gallery detailing beneath the center stone. Set against a clean, warm off-white background with subtle studio lighting emphasizing the polished metal surface and luxury craftsmanship." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDdTSaAsMbKXaFGJ2Z2uJDiypbTSQWtQCZ5I2le-I28T1MErFK34UzdAq9QG5TSKgHtf9RgLJ4N9V2DKJDFMjjN_WOWSd4mTiCTm542CSo0Owc18wrNbOcgrzYb8LJZQBgk-sbByWfK-KXBUKkLzsuP1joQVc4xcw4PTqHRHMY7KfIv93ax8WjFjACFRFhUxt3P0JIPZYBN5d35A0_Z0XJ82y0NFMBwj1I1oW1MLCKycwKmsGY_qrQ"/>
            </button>
            <button className="w-full aspect-square bg-surface-white border border-outline-variant hover:border-regal-gold rounded-lg overflow-hidden p-1 transition-colors">
              <img className="w-full h-full object-cover rounded" data-alt="An elegant woman's hand wearing a delicate 18k yellow gold diamond solitaire ring. Her skin tone is warm, and she rests her hand gracefully against a neutral, soft beige background. The focus is on how the ring looks when worn, conveying a sense of timeless elegance and quiet luxury." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAos1QY9lC-pCbGcGgwSuOzVoL2eKGb7gVi5wLZp4WnVgoLuK--sQ9RSyWcsdPW4m0sCO33BLNPlTgO7j-hS8zqA6Z7hCexuNIjGfA8Mr6_8C_s4poWttxYgVxWHAT7YR1Sk5maGoO-dChI-Ozz7GtzDR-veuq0msJVEq5VbwZHHAPa_DFltBeZHIgXmNyIpC9QKTPikKVl4vizG7S04ybylKv39lcl0fSH1UI0rn4N2EKlkHKF8Lk"/>
            </button>
            <button className="w-full aspect-square bg-surface-white border border-outline-variant hover:border-regal-gold rounded-lg overflow-hidden p-1 transition-colors flex items-center justify-center bg-surface-container-low text-on-surface-variant">
              <span className="material-symbols-outlined text-3xl">play_circle</span>
            </button>
          </div>
          {/* Main Image */}
          <div className="flex-grow bg-surface-white rounded-xl overflow-hidden shadow-sm relative group aspect-square md:aspect-[4/5]">
            <div className="absolute top-4 left-4 z-10 bg-surface-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-label-caps text-primary border border-outline-variant">
              Best Seller
            </div>
            <button className="absolute top-4 right-4 z-10 p-2 bg-surface-white/80 backdrop-blur-sm rounded-full text-on-surface-variant hover:text-error transition-colors shadow-sm">
              <span className="material-symbols-outlined">favorite</span>
            </button>
            <img className="w-full h-full object-cover img-hover-zoom" data-alt="A stunning, high-resolution front-facing shot of a flawless diamond solitaire ring crafted in 18k yellow gold. The ring is perfectly centered on a pristine, soft cream background with a very subtle, diffused shadow directly beneath it, simulating high-end boutique lighting. The image exudes quiet luxury and exceptional clarity." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAu85qsH-b1ZTpHVBtDHU-0DERkY6TaLw4zAa8t-45s4LNsOD9BwZTtBe2T9za6PJO8zRA8NHkj5G3c4kJWHlfKwy_gB5k3Ohr-10cSkpFw7tvWhvYwZe57VH0BE2nKJyrK7z8rKO0MrtDHGUWQL1QkOf0WgKg3fK6IO24zXUpP5RQHFVZ5qIrdYI_7AbWJ5noldHjld8ZlAh9szv7a34ghtZrk1YN9C3gRWr8NBuJsIBnKIEPsPY8"/>
            {/* Mobile Thumbnails (Horizontal) */}
            <div className="md:hidden absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 z-10">
              <div className="w-2 h-2 rounded-full bg-regal-gold"></div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
              <div className="w-2 h-2 rounded-full bg-outline-variant"></div>
            </div>
          </div>
        </div>
        {/* Product Info (Right - 5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-center px-2 md:px-6 py-4 md:py-0">
          <div className="mb-2">
            <span className="text-xs font-label-caps tracking-widest text-on-surface-variant uppercase">Rings</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">The Solitaire Promise Ring</h1>
          {/* Ratings & SKU */}
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-outline-variant/30">
            <div className="flex items-center gap-1 text-regal-gold">
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined filled text-lg">star</span>
              <span className="material-symbols-outlined text-lg">star_half</span>
              <span className="text-sm font-body-md text-on-surface-variant ml-2">(124 Reviews)</span>
            </div>
            <span className="text-sm font-body-md text-on-surface-variant">SKU: JR03456-1Y</span>
          </div>
          {/* Price */}
          <div className="mb-8">
            <div className="flex items-baseline gap-4">
              <span className="text-3xl font-headline-md text-primary">₹ 45,999</span>
              <span className="text-lg text-on-surface-variant line-through">₹ 52,000</span>
              <span className="text-sm font-bold text-surface-tint bg-primary-fixed/30 px-2 py-1 rounded">12% OFF</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">Inclusive of all taxes</p>
          </div>
          {/* Size Selector */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-3">
              <label className="font-body-md font-semibold text-primary">Select Size</label>
              <button className="text-sm text-surface-tint underline underline-offset-2 hover:text-primary transition-colors">Size Guide</button>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center font-body-md text-on-surface-variant hover:border-regal-gold transition-colors">10</button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center font-body-md text-on-surface-variant hover:border-regal-gold transition-colors">11</button>
              <button className="w-12 h-12 rounded-full border-2 border-primary text-primary flex items-center justify-center font-body-md font-semibold bg-surface-container-lowest shadow-sm">12</button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center font-body-md text-on-surface-variant hover:border-regal-gold transition-colors">13</button>
              <button className="w-12 h-12 rounded-full border border-outline-variant flex items-center justify-center font-body-md text-on-surface-variant hover:border-regal-gold transition-colors">14</button>
            </div>
          </div>
          {/* Actions */}
          <div className="flex flex-col gap-4 mb-8">
            <button className="w-full bg-deep-emerald text-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-surface-tint transition-colors shadow-sm flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-lg">shopping_bag</span>
              Add to Cart
            </button>
            <button className="w-full bg-transparent text-deep-emerald border border-outline py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
              Buy Now
            </button>
          </div>
          {/* Delivery Check */}
          {/* Trust Signals */}
          <div className="flex justify-between items-center py-4 border-t border-outline-variant/30">
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">verified</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">Certified<br />Jewellery</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">assignment_return</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">15 Day<br />Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">autorenew</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">Lifetime<br />Exchange</span>
            </div>
            <div className="flex flex-col items-center gap-1 text-center">
              <span className="material-symbols-outlined text-2xl text-regal-gold">security</span>
              <span className="text-[10px] uppercase font-label-caps tracking-wide text-on-surface-variant">1 Yr<br />Warranty</span>
            </div>
          </div>
        </div>
      </div>
      {/* Product Specifications (Glassmorphism / Tabbed feel) */}
      <div className="mb-24">
        <h2 className="font-headline-md text-headline-md text-primary text-center mb-12">Product Details</h2>
        <div className="bg-surface-white/60 backdrop-blur-md border border-outline-variant/30 rounded-2xl p-6 md:p-12 shadow-sm max-w-4xl mx-auto">
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-10 text-center leading-relaxed">
            A timeless classic, this solitaire ring is crafted in 18kt yellow gold featuring a brilliant round cut diamond. The elegant six-prong setting maximizes light performance, ensuring your diamond sparkles from every angle.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {/* Metal Details */}
            <div>
              <h3 className="font-headline-md text-lg text-primary border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-regal-gold text-xl">diamond</span>
                Metal Details
              </h3>
              <ul className="space-y-3 font-body-md text-sm text-on-surface-variant">
                <li className="flex justify-between"><span className="">Gold Purity</span><span className="font-medium text-primary">18 Kt</span></li>
                <li className="flex justify-between"><span className="">Metal Color</span><span className="font-medium text-primary">Yellow</span></li>
                <li className="flex justify-between"><span className="">Gross Weight</span><span className="font-medium text-primary">2.45 g</span></li>
              </ul>
            </div>
            {/* Diamond Details */}
            <div>
              <h3 className="font-headline-md text-lg text-primary border-b border-outline-variant/30 pb-2 mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-regal-gold text-xl">auto_awesome</span>
                Diamond Details
              </h3>
              <ul className="space-y-3 font-body-md text-sm text-on-surface-variant">
                <li className="flex justify-between"><span className="">Total Weight</span><span className="font-medium text-primary">0.50 ct</span></li>
                <li className="flex justify-between"><span className="">Total No. of Diamonds</span><span className="font-medium text-primary">1</span></li>
                <li className="flex justify-between"><span className="">Clarity</span><span className="font-medium text-primary">SI</span></li>
                <li className="flex justify-between"><span className="">Color</span><span className="font-medium text-primary">IJ</span></li>
                <li className="flex justify-between"><span className="">Shape</span><span className="font-medium text-primary">Round</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* Similar Products (Horizontal Scroll / Grid) */}
      <div>
        <div className="flex justify-between items-end mb-8">
          <h2 className="font-headline-md text-headline-md text-primary">You May Also Like</h2>
          <a className="text-sm font-label-caps uppercase text-surface-tint hover:text-primary transition-colors flex items-center gap-1 border-b border-transparent hover:border-primary" href="#">
            View All <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </a>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Product Card 1 */}
          <div className="group cursor-pointer">
            <div className="bg-surface-white rounded-lg overflow-hidden aspect-square mb-4 relative flex items-center justify-center p-4 border border-transparent hover:border-outline-variant/30 transition-all shadow-sm group-hover:shadow-md">
              <button className="absolute top-3 right-3 z-10 text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <img className="w-full h-full object-contain img-hover-zoom" data-alt="A delicate 18k rose gold ring featuring a cluster of small diamonds forming a floral pattern. Set against a clean soft cream background to highlight the warm tones of the rose gold and the subtle sparkle of the pavé diamonds. Aesthetic is romantic and refined." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA8E_Ck6j2jscqdTlxBdaedvwZsaCBYCjELeGm3fSwZatnZHorUchqqygDhf8BXbs28Of0yy8hsvWLb-6Irfh50LQDJ7nDST9ZlKu9ysgjYMDILlVYD87TkdCE4nuQwYKzWDXquTWtcGs8hMYHWJEVtj4Lgf01F3Aj8OrvSUGYwovbVdzb_ddQBqDIIv2U2M13CYG4SwI6EY19s52bx0f1jMHUksgfNS1LtHWs0QZ9WXztwcEv6S4g"/>
            </div>
            <div className="text-center px-2">
              <h3 className="font-body-md text-sm text-on-surface-variant truncate mb-1">Floral Diamond Ring</h3>
              <p className="font-headline-md text-base text-primary">₹ 32,500</p>
            </div>
          </div>
          {/* Product Card 2 */}
          <div className="group cursor-pointer">
            <div className="bg-surface-white rounded-lg overflow-hidden aspect-square mb-4 relative flex items-center justify-center p-4 border border-transparent hover:border-outline-variant/30 transition-all shadow-sm group-hover:shadow-md">
              <button className="absolute top-3 right-3 z-10 text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <img className="w-full h-full object-contain img-hover-zoom" data-alt="An elegant 18k white gold eternity band set with small round diamonds all around. Photographed on a minimalist light grey surface reflecting a high-end, modern luxury aesthetic with crisp focus on the diamond setting." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHpJcB5PBlUp_0oSNQg7h09EGXTyAndYCpvuTARqgNsELcvtwSijj0QVaeYvwpUQGVJcUvJLhCvBwag3FKebyZ7hsLgC8F9O2ek7OxGZXglgDl6QYXMqgjCziGT0DDRSnoNUHDKA6zFTJzXJSkk3ob63R3uLjWP-D0DcK03LK0iuqVobFAIoVxlP0XEVQesWyztOOXTBxblM8bvEkJCGBolJ5UwLBdyu-rohPxIJ2jaAkUcK7udyo"/>
            </div>
            <div className="text-center px-2">
              <h3 className="font-body-md text-sm text-on-surface-variant truncate mb-1">Eternity Band</h3>
              <p className="font-headline-md text-base text-primary">₹ 41,200</p>
            </div>
          </div>
          {/* Product Card 3 */}
          <div className="group cursor-pointer hidden md:block">
            <div className="bg-surface-white rounded-lg overflow-hidden aspect-square mb-4 relative flex items-center justify-center p-4 border border-transparent hover:border-outline-variant/30 transition-all shadow-sm group-hover:shadow-md">
              <div className="absolute top-3 left-3 z-10 bg-surface-container-low px-2 py-0.5 rounded text-[10px] font-label-caps text-on-surface-variant">New</div>
              <button className="absolute top-3 right-3 z-10 text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <img className="w-full h-full object-contain img-hover-zoom" data-alt="A unique geometric diamond ring in 18k yellow gold, featuring an emerald-cut center stone surrounded by a subtle halo. The background is a soft, warm off-white, emphasizing the sharp, modern lines of the cut and the classic luxury of the yellow gold." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrt6q1vHNIjg1RlZjW3iBIYaX5VXtpTCjhphgjq0x6EU5-7Yec1FUd23Lyhj21JkcPZYQTLFikM4EPy3IG4aqL0ssXnNbPCmRGNSvaSdXx21TO5pgtnL_QYnqx0sYwDUDhO3ZoKkkMj0ggw2syEI_8yNF1d2ysLdmJpvB0IGHXIUuEGgOZBbirzv7wdkKrnbAH47WucirBCSIjrBDqqL037afGtJboe5lvVLyOPw_Rb0c0RxhfcoE"/>
            </div>
            <div className="text-center px-2">
              <h3 className="font-body-md text-sm text-on-surface-variant truncate mb-1">Geometric Halo Ring</h3>
              <p className="font-headline-md text-base text-primary">₹ 58,000</p>
            </div>
          </div>
          {/* Product Card 4 */}
          <div className="group cursor-pointer hidden md:block">
            <div className="bg-surface-white rounded-lg overflow-hidden aspect-square mb-4 relative flex items-center justify-center p-4 border border-transparent hover:border-outline-variant/30 transition-all shadow-sm group-hover:shadow-md">
              <button className="absolute top-3 right-3 z-10 text-outline hover:text-error transition-colors">
                <span className="material-symbols-outlined text-[20px]">favorite</span>
              </button>
              <img className="w-full h-full object-contain img-hover-zoom" data-alt="A minimalist twisted band ring in 18k yellow and white gold intertwined, without stones. The image is bright and clean, capturing the smooth, polished texture of the metals against a soft cream backdrop. Aesthetic is simple, modern, and quietly luxurious." src="https://lh3.googleusercontent.com/aida-public/AB6AXuA3F1M-NCh93frsJZT57XDOuVX2s2LaOcPv1NIGQp54z2iJzqKHE2zSxnASHVaIP91xeg2qGJyxHT8NcvUZNRk0RBD0B785HV_1XaMRd0O-tAEIWND-cz71AELnUCWnsy9UAfBadmdKHEjBUy8b-v5_gHaxxk2yQ4BASQmY5WaMu6rUI1ew9tnEwWLOdP6PdfcofeWKIvz8X43PvE_w7eJC0Egc-HrzU7E3fA5WcLo4GQojIV_VL_M"/>
            </div>
            <div className="text-center px-2">
              <h3 className="font-body-md text-sm text-on-surface-variant truncate mb-1">Twist Two-Tone Ring</h3>
              <p className="font-headline-md text-base text-primary">₹ 18,900</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
