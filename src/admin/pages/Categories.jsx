export default function Categories() {
  const categories = [
    {
      id: 1,
      name: 'Diamond Jewellery',
      icon: 'diamond',
      subCategories: '3',
      activeProducts: '1,245',
      status: 'ACTIVE',
      statusColor: 'bg-secondary-fixed/20 text-secondary border-secondary-fixed',
      expanded: true,
      subItems: [
        { name: 'Rings', products: '450' },
        { name: 'Earrings', products: '320' },
      ],
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDctl2azjXNrekjoUcglBNgQBXhl4zr5jqQf0kmINkAMTuMdQDGKcFeByTD2UKnmbx7cl1J4qjRjp6vS4sTjTG3-2Y14nbv6F3fWadFBgaVyjYwzLPglfATH2u8WGBrqX4PW3a-Xe34v5006nR04NYGgmClOhQd2emp5htcAq-yy99IF2681OAOjppynWTV_v3rUL0UOBvy87Okn3e6lBRX-gTyUUF2gJlCs3L8mgzzD6NH_MpwibI',
    },
    {
      id: 2,
      name: 'Gold Jewellery',
      icon: 'watch_lifestyle',
      subCategories: '4',
      activeProducts: '2,104',
      status: 'ACTIVE',
      statusColor: 'bg-secondary-fixed/20 text-secondary border-secondary-fixed',
      expanded: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCUIRS5yZpw39wI9wQEneQPhYjpSSIl6F0S9EEhtT2eibiEAStgMLwrzncUXiTtMzVpMtE_7nFqxbc8B5vKpWUMmZRKsPvSfQ_h9M58flXDhvtJ9-ocMA8Pg7S2efyh4x_1ZFJBLmDMYQdCxRyqieIbsXBHObWNpPbAzyCczSV73ny02gWQMi6JnTsyVcKEcgVZvO77sxRiIuJVMxQARs6d2-eE_NVHldvZA3vGXmwkU9c1UW9nNkA',
    },
    {
      id: 3,
      name: 'Platinum Jewellery',
      icon: 'watch_lifestyle',
      subCategories: '2',
      activeProducts: '458',
      status: 'ACTIVE',
      statusColor: 'bg-secondary-fixed/20 text-secondary border-secondary-fixed',
      expanded: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCX3O2b9_iFzQSNlTQeoG1Z8QhIPUqr1yVkRtpUijKIwWh38ulzxRjeSr3P8b6jUpuLesyL36DRbNhFpuOTdfWDtMixW4nCCEXoYxhjt-b0EhtFMJerMNhO0tY21QS9nyTj1vcksxvjd0ZqoYRw0eqrjTpdpePIrBYFTsE5auNr6n_yGNINwNz9mOLvWYbqsayPe5sfknJh2o0_XDmJNASm8w4msNjn2bruQyKBKeRDhIuMxEflMhk',
    },
    {
      id: 4,
      name: 'Collections',
      icon: 'style',
      subCategories: '8',
      activeProducts: '890',
      status: 'ACTIVE',
      statusColor: 'bg-secondary-fixed/20 text-secondary border-secondary-fixed',
      expanded: false,
      image: null,
    },
    {
      id: 5,
      name: 'Watches',
      icon: 'watch',
      subCategories: '2',
      activeProducts: '0',
      status: 'INACTIVE',
      statusColor: 'bg-surface-variant/50 text-outline border-outline/20',
      expanded: false,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBeaEVZgjEZPowsqCsp52GS4FVzASN6sQ5_-Aj0N915PDRbstjhlINs2Bj1vDHU7WDa5B4dYkZAayFlf9ZWAakgNpfObijyRFAhpSuUtn4EwmobVE2_WgQ4yCifqVMvy8OGrUyRzf1jzjlljSTlV4Xvk5dkhaMrEDg1ybP3uSIYiz3Da3XH7dHv46_G09rCNKP99uL-lHMJ81_vfEMaweVP-3G43cajcZgKjMA_jf7elQEcYiruPv4',
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto bg-soft-cream custom-scrollbar p-gutter pt-8">
      <div className="max-w-container-max mx-auto space-y-8 pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-1">Category Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Manage your inventory, prices, and product details.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-regal-gold text-deep-emerald font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-secondary-fixed active:scale-95 shadow-sm">
            <span className="material-symbols-outlined text-sm">add</span>
            Create New Category
          </button>
        </div>

        <div className="bg-surface-white p-4 rounded border border-outline-variant shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative w-full lg:w-96">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline text-lg">
              search
            </span>
            <input
              className="w-full bg-soft-cream border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald py-2.5 pl-10 pr-4 text-sm font-body-md text-on-surface rounded transition-all"
              placeholder="Search by SKU or Name..."
              type="text"
            />
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
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase">Category Name</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Sub-categories</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Active Products</th>
                  <th className="py-4 px-4 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-center">Status</th>
                  <th className="py-4 px-6 font-label-caps text-[11px] text-on-surface-variant tracking-wider uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 font-body-md text-sm">
                {categories.map((category) => (
                  <tr key={category.id} className="table-row-hover bg-surface-white group">
                    <td className="py-4 pl-6 pr-4">
                      <input className="rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald w-4 h-4 cursor-pointer" type="checkbox" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-4">
                        {category.expanded ? (
                          <button className="text-secondary w-6 h-6 flex items-center justify-center rounded-full bg-secondary-fixed/20">
                            <span className="material-symbols-outlined text-[16px]">expand_more</span>
                          </button>
                        ) : (
                          <button className="text-on-surface-variant w-6 h-6 flex items-center justify-center rounded-full hover:bg-surface-variant/30 transition-colors">
                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                          </button>
                        )}
                        {category.image ? (
                          <div className="w-12 h-12 bg-surface-container rounded overflow-hidden">
                            <img className="w-full h-full object-cover" alt={category.name} src={category.image} />
                          </div>
                        ) : (
                          <div className="w-12 h-12 bg-surface-container rounded overflow-hidden flex items-center justify-center text-outline">
                            <span className="material-symbols-outlined">{category.icon}</span>
                          </div>
                        )}
                        <span className="font-headline-md text-headline-md text-deep-emerald">{category.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center text-on-surface-variant font-body-md text-body-md">{category.subCategories}</td>
                    <td className="py-4 px-4 text-center text-on-surface-variant font-body-md text-body-md">{category.activeProducts}</td>
                    <td className="py-4 px-4 text-center flex justify-center">
                      <span className={`px-3 py-1 ${category.statusColor} font-label-caps text-[10px] rounded-full border`}>
                        {category.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 hover:text-deep-emerald transition-colors" title="Edit">
                          <span className="material-symbols-outlined">edit</span>
                        </button>
                        <button className="p-2 hover:text-error transition-colors" title="Delete">
                          <span className="material-symbols-outlined">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="bg-surface-container-low px-6 py-4 border-t border-outline-variant flex items-center justify-between">
            <span className="text-xs font-body-md text-on-surface-variant">Showing 1 to 5 of 12 categories</span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 text-outline hover:text-deep-emerald disabled:opacity-50 transition-colors">
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <button className="w-8 h-8 flex items-center justify-center rounded bg-deep-emerald text-surface-white font-label-caps text-xs">1</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">2</button>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">3</button>
              <span className="text-on-surface-variant px-1">...</span>
              <button className="w-8 h-8 flex items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-high font-label-caps text-xs transition-colors">12</button>
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
