export default function Shop() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-[120px]">
      {/* Breadcrumbs & Header */}
      <div className="mb-12">
        <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
          <a className="hover:text-primary transition-colors" href="/home">Home</a>
          <span>/</span>
          <span className="text-charcoal-text font-semibold">Jewellery</span>
        </nav>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald">Fine Jewellery Collection</h1>
            <p className="text-on-surface-variant mt-2 max-w-2xl">Discover our exquisite range of handcrafted pieces, designed to celebrate every moment with timeless elegance.</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-on-surface-variant">Showing 1-24 of 1,248 Items</span>
            <div className="relative">
              <select className="appearance-none bg-transparent border border-outline-variant rounded-none py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald cursor-pointer">
                <option>Sort by: Recommended</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>New Arrivals</option>
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-12">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0 space-y-8 hidden md:block">
          {/* Filter Section: Metal */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Metal <span className="material-symbols-outlined text-[18px]">remove</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input checked className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">Gold (452)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">Platinum (128)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">Silver (89)</span>
              </label>
            </div>
          </div>
          {/* Filter Section: Purity */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Purity <span className="material-symbols-outlined text-[18px]">remove</span>
            </h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">14k (112)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input checked className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">18k (340)</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer group">
                <input className="form-checkbox h-4 w-4 text-deep-emerald border-outline-variant rounded-none focus:ring-deep-emerald" type="checkbox"/>
                <span className="text-on-surface-variant group-hover:text-charcoal-text transition-colors">22k (85)</span>
              </label>
            </div>
          </div>
          {/* Filter Section: Price */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Price <span className="material-symbols-outlined text-[18px]">add</span>
            </h3>
          </div>
          {/* Filter Section: Category */}
          <div>
            <h3 className="font-headline-md text-sm font-semibold text-charcoal-text uppercase tracking-widest mb-4 border-b border-outline-variant pb-2 flex justify-between items-center cursor-pointer">
              Category <span className="material-symbols-outlined text-[18px]">add</span>
            </h3>
          </div>
          <button className="w-full py-3 bg-surface border border-outline-variant text-charcoal-text text-sm font-semibold hover:bg-surface-variant transition-colors mt-8">
            CLEAR ALL FILTERS
          </button>
        </aside>
        {/* Product Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-12">
            {/* Product Card 1 */}
            <div className="group cursor-pointer flex flex-col relative">
              <div className="relative w-full aspect-[4/5] bg-surface-white overflow-hidden mb-4 p-4 border border-transparent hover:border-outline-variant transition-colors duration-300">
                <img className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="A close-up studio shot of a delicate 18k gold diamond necklace on a soft cream background. The lighting is high-key and soft, highlighting the brilliant sparkle of the central diamond pendant. The aesthetic is luxurious, minimalist, and refined, fitting a high-end jewelry boutique." src="https://lh3.googleusercontent.com/aida-public/AB6AXuCMaV2NcyoofFZwJZdmgmQBCzDxxrJqZI7yMBzELqoOyTmSUr4Rbet7198SrtrRbFFdKiNOWhSJ6_xo-Kcl_sluF8MvowYs0H4SrjIU0oaclEbneLEaOzZj20kMdwCxvZK6RmE6m9pEC__U7TbsYdbSHyZy9W90Q58ifbRBZXd_HiX8-XcEPj8sPUQqlkRXzB2nBSwalBQOS9xRzxb1xo-3B9FfKqD2X-Gc_587cs7jA4JZY6y5MXk"/>
                <button className="absolute top-4 right-4 text-on-surface-variant hover:text-regal-gold transition-colors p-2 bg-surface-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 shadow-sm translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
                  <button className="bg-deep-emerald text-white px-6 py-2 text-xs font-semibold tracking-wider hover:bg-primary transition-colors">QUICK VIEW</button>
                </div>
                <span className="absolute top-4 left-4 bg-regal-gold text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">-15%</span>
              </div>
              <div className="text-center px-2 flex-grow flex flex-col">
                <h4 className="font-body-md text-sm text-charcoal-text truncate group-hover:text-deep-emerald transition-colors">The Celeste Diamond Necklace</h4>
                <p className="text-xs text-on-surface-variant mt-1 mb-2">18k Yellow Gold, 3.2g</p>
                <div className="mt-auto flex justify-center items-center space-x-2">
                  <span className="font-semibold text-deep-emerald">$1,250</span>
                  <span className="text-xs text-on-surface-variant line-through">$1,470</span>
                </div>
              </div>
            </div>
            {/* Product Card 2 */}
            <div className="group cursor-pointer flex flex-col relative">
              <div className="relative w-full aspect-[4/5] bg-surface-white overflow-hidden mb-4 p-4 border border-transparent hover:border-outline-variant transition-colors duration-300">
                <img className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="An elegant pair of platinum diamond stud earrings displayed on a minimalist white acrylic stand. The background is a soft, warm cream tone. Lighting is sharp and focused to capture the clarity of the diamonds, creating a luxurious and pristine presentation." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfsdZWhOiGJMK6I1mBfQDI7edV7H5ZAEumI5WV4TZvFKxhtKEKuEGzQo_adu8QuWGFx3Bs9K18qSSmIPokqQBCPCDHEHFTuhwyXwU5uoTXIk-5IMrLcH55cbUXEl9qAN5Oxoqg7KfZudJQavxfcaw_IhGTLVqu7LI3AXY3LOsLuUMF5unsNmv3mFRdScJ3Kg5jnO0Gk51HZzJWxGRMRee625NQFET1lD8QsYKm1-JQmw5AYzcoKL8"/>
                <button className="absolute top-4 right-4 text-on-surface-variant hover:text-regal-gold transition-colors p-2 bg-surface-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 shadow-sm translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
                  <button className="bg-deep-emerald text-white px-6 py-2 text-xs font-semibold tracking-wider hover:bg-primary transition-colors">QUICK VIEW</button>
                </div>
              </div>
              <div className="text-center px-2 flex-grow flex flex-col">
                <h4 className="font-body-md text-sm text-charcoal-text truncate group-hover:text-deep-emerald transition-colors">Aura Solitaire Studs</h4>
                <p className="text-xs text-on-surface-variant mt-1 mb-2">Platinum, 1.5g</p>
                <div className="mt-auto flex justify-center items-center space-x-2">
                  <span className="font-semibold text-deep-emerald">$890</span>
                </div>
              </div>
            </div>
            {/* Product Card 3 */}
            <div className="group cursor-pointer flex flex-col relative">
              <div className="relative w-full aspect-[4/5] bg-surface-white overflow-hidden mb-4 p-4 border border-transparent hover:border-outline-variant transition-colors duration-300">
                <img className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="A luxurious 22k gold bangle with intricate filigree details, resting on a smooth marble surface. The lighting is warm and directional, emphasizing the rich yellow tone of the high-purity gold. The scene conveys heritage and premium craftsmanship." src="https://lh3.googleusercontent.com/aida-public/AB6AXuBXRcm8hiTHKBY7FOEBJFJ22Z4tIhzIwEEz5qtGMJrOTx0jHWuZmmgamtNGo9mLCSAtuFIMCsbJ8oUg37JSWTJegYn_UvQ1YnKacO7ekML1R48jb8E18_p-z-PGE0PNqIo0CAeKj5h-iMLFi5njAAEt1aqvwpQwwgJ6lDYrUm8XYUgAvqwqYssEymsW-DvP40_5-mqTSU_sAcC2fNqoFRnpfQuFk6T5FAo-p-bKM0B26x3QiUmQCZw"/>
                <button className="absolute top-4 right-4 text-on-surface-variant hover:text-regal-gold transition-colors p-2 bg-surface-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 shadow-sm translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
                  <button className="bg-deep-emerald text-white px-6 py-2 text-xs font-semibold tracking-wider hover:bg-primary transition-colors">QUICK VIEW</button>
                </div>
              </div>
              <div className="text-center px-2 flex-grow flex flex-col">
                <h4 className="font-body-md text-sm text-charcoal-text truncate group-hover:text-deep-emerald transition-colors">Heritage Filigree Bangle</h4>
                <p className="text-xs text-on-surface-variant mt-1 mb-2">22k Yellow Gold, 15.4g</p>
                <div className="mt-auto flex justify-center items-center space-x-2">
                  <span className="font-semibold text-deep-emerald">$2,450</span>
                </div>
              </div>
            </div>
            {/* Product Card 4 */}
            <div className="group cursor-pointer flex flex-col relative">
              <div className="relative w-full aspect-[4/5] bg-surface-white overflow-hidden mb-4 p-4 border border-transparent hover:border-outline-variant transition-colors duration-300">
                <img className="object-cover w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-700 ease-out" data-alt="A modern rose gold ring featuring a cluster of small diamonds, displayed floating against a very light grey minimalist background. The lighting is even and soft, creating subtle reflections on the polished metal surface, emphasizing a contemporary and chic style." src="https://lh3.googleusercontent.com/aida-public/AB6AXuAkfjazKViOe-vOJ9v7C3ZWx-GYnNTbthgpy7lq3DWuva4bd2hTwNBIG93Q0cXEXUkPJb3TGJfjCaRvBaG_AePrH3Fa5D9-l9aTrYE3i2uBvvoZ8Dhs2EJGRlS8EYIxq9_0C1LcN9wI0r7AJT217ReYsYl6eOX9tKjvgSlyrhRHYq5gBXR-_2MvWZfXUyJ7gRmE3sAInx21l2WE145i74rO_QeKtUd7xqVY2ffd2iXeueQ9CUi-9Gw"/>
                <button className="absolute top-4 right-4 text-on-surface-variant hover:text-regal-gold transition-colors p-2 bg-surface-white/80 backdrop-blur rounded-full opacity-0 group-hover:opacity-100 shadow-sm translate-y-2 group-hover:translate-y-0 duration-300">
                  <span className="material-symbols-outlined text-[20px]">favorite</span>
                </button>
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out flex justify-center">
                  <button className="bg-deep-emerald text-white px-6 py-2 text-xs font-semibold tracking-wider hover:bg-primary transition-colors">QUICK VIEW</button>
                </div>
                <span className="absolute top-4 left-4 bg-charcoal-text text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider">NEW</span>
              </div>
              <div className="text-center px-2 flex-grow flex flex-col">
                <h4 className="font-body-md text-sm text-charcoal-text truncate group-hover:text-deep-emerald transition-colors">Blossom Cluster Ring</h4>
                <p className="text-xs text-on-surface-variant mt-1 mb-2">14k Rose Gold, 2.1g</p>
                <div className="mt-auto flex justify-center items-center space-x-2">
                  <span className="font-semibold text-deep-emerald">$650</span>
                </div>
              </div>
            </div>
          </div>
          {/* Pagination */}
          <div className="mt-20 flex justify-center items-center space-x-2">
            <button className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">chevron_left</span>
            </button>
            <button className="w-10 h-10 border border-deep-emerald bg-deep-emerald text-white flex items-center justify-center font-semibold text-sm">1</button>
            <button className="w-10 h-10 border border-outline-variant flex items-center justify-center text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald transition-colors text-sm">2</button>
            <button className="w-10 h-10 border border-outline-variant flex items-center justify-center text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald transition-colors text-sm">3</button>
            <span className="px-2 text-on-surface-variant">...</span>
            <button className="w-10 h-10 border border-outline-variant flex items-center justify-center text-charcoal-text hover:text-deep-emerald hover:border-deep-emerald transition-colors text-sm">12</button>
            <button className="w-10 h-10 border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-deep-emerald hover:border-deep-emerald transition-colors">
              <span className="material-symbols-outlined text-[18px]">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
