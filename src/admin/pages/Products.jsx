export default function Products() {
  const products = [
    {
      id: 1,
      name: 'Aurelia Diamond Solitaire',
      category: 'Engagement Ring',
      sku: 'JR-18K-D-042',
      categoryType: 'Diamond',
      purity: '18KT',
      price: '$2,450.00',
      stock: 'In Stock (45)',
      stockColor: 'bg-primary-fixed',
      dotColor: 'bg-deep-emerald',
      borderColor: 'border-primary-fixed-dim/30',
    },
    {
      id: 2,
      name: 'Crimson Tear Pendant',
      category: 'Necklace',
      sku: 'NL-14R-R-108',
      categoryType: 'Gold',
      purity: '14KT',
      price: '$850.00',
      stock: 'Low Stock (3)',
      stockColor: 'bg-secondary-fixed',
      dotColor: 'bg-secondary',
      borderColor: 'border-secondary-fixed-dim/30',
    },
    {
      id: 3,
      name: 'Eternal Platinum Hoops',
      category: 'Earrings',
      sku: 'ER-PT-H-022',
      categoryType: 'Platinum',
      purity: '950PT',
      price: '$1,200.00',
      stock: 'Out of Stock',
      stockColor: 'bg-error-container',
      dotColor: 'bg-error',
      borderColor: 'border-error/20',
    },
    {
      id: 4,
      name: 'Heritage Gold Bangle',
      category: 'Bracelet',
      sku: 'BR-22K-B-890',
      categoryType: 'Gold',
      purity: '22KT',
      price: '$3,100.00',
      stock: 'In Stock (12)',
      stockColor: 'bg-primary-fixed',
      dotColor: 'bg-deep-emerald',
      borderColor: 'border-primary-fixed-dim/30',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Product Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your inventory, prices, and product details.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            Add New Product
          </button>
        </div>

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">search</span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search by SKU or Name..."
              type="text"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative min-w-[140px]">
              <select className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all">
                <option disabled selected value="">Category</option>
                <option value="all">All Categories</option>
                <option value="gold">Gold Jewellery</option>
                <option value="diamond">Diamond Jewellery</option>
                <option value="platinum">Platinum</option>
                <option value="silver">Silver</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>
            <div className="relative min-w-[140px]">
              <select className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all">
                <option disabled selected value="">Purity</option>
                <option value="all">All Purities</option>
                <option value="14k">14KT</option>
                <option value="18k">18KT</option>
                <option value="22k">22KT</option>
                <option value="24k">24KT</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>
            <div className="relative min-w-[140px]">
              <select className="w-full appearance-none bg-surface-white border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-4 pr-10 text-sm font-body-md text-on-surface rounded cursor-pointer transition-all">
                <option disabled selected value="">Status</option>
                <option value="all">All Statuses</option>
                <option value="instock">In Stock</option>
                <option value="lowstock">Low Stock</option>
                <option value="outofstock">Out of Stock</option>
              </select>
              <span className="material-symbols-outlined absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none text-outline">
                expand_more
              </span>
            </div>
            <button className="p-2.5 text-on-surface-variant hover:text-deep-emerald border border-outline-variant rounded hover:bg-surface-container-low transition-colors" title="Clear Filters">
              <span className="material-symbols-outlined">filter_alt_off</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-b border-outline-variant/50">
          <div className="flex items-center gap-3">
            <span className="font-body-md text-sm text-on-surface-variant">
              <span className="font-semibold text-deep-emerald">0</span> items selected
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-[10px] rounded hover:bg-surface-container-low transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">download</span>
              Export to CSV
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-error/10 text-error border border-error/20 font-label-caps text-[10px] rounded hover:bg-error hover:text-surface-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className="material-symbols-outlined text-sm">delete</span>
              Delete Selected
            </button>
          </div>
        </div>

        <div className="bg-surface-white rounded shadow-sm border border-outline-variant overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="py-4 pl-6 pr-4 w-12">
                    <input className="rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald w-4 h-4 cursor-pointer" type="checkbox" />
                  </th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Product</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">SKU</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Category</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Purity</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Price</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Stock Status</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {products.map((product) => (
                  <tr key={product.id} className="table-row-hover bg-surface-white group">
                    <td className="py-4 pl-6 pr-4">
                      <input className="rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald w-4 h-4 cursor-pointer" type="checkbox" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded bg-soft-cream border border-outline-variant/30 flex-shrink-0 overflow-hidden">
                          <img className="w-full h-full object-cover" alt="Product image" src="https://placehold.co/48x48" />
                        </div>
                        <div>
                          <p className="font-semibold text-deep-emerald group-hover:text-regal-gold transition-colors cursor-pointer">
                            {product.name}
                          </p>
                          <p className="text-xs text-on-surface-variant mt-0.5">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-on-surface font-mono text-xs">{product.sku}</td>
                    <td className="py-4 px-4">{product.categoryType}</td>
                    <td className="py-4 px-4">{product.purity}</td>
                    <td className="py-4 px-4 text-right font-semibold">{product.price}</td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-label-caps ${product.stockColor} text-on-primary-fixed-variant ${product.borderColor}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${product.dotColor}`}></span>
                        {product.stock}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-on-surface-variant hover:text-deep-emerald hover:bg-surface-container-low rounded transition-colors" title="Edit">
                          <span className="material-symbols-outlined text-lg">edit</span>
                        </button>
                        <button className="p-1.5 text-on-surface-variant hover:text-error hover:bg-error/10 rounded transition-colors" title="Delete">
                          <span className="material-symbols-outlined text-lg">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant flex items-center justify-between">
            <span className="text-xs font-body-md text-on-surface-variant">Showing 1 to 4 of 248 entries</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-outline hover:text-deep-emerald disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-deep-emerald text-surface-white font-label-caps text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">3</button>
              <span className="text-on-surface-variant px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">25</button>
              <button className="p-1.5 text-on-surface-variant hover:text-deep-emerald transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
