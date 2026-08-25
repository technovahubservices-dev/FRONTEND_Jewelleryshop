export default function TopAppBar({ onMenuClick }) {
  return (
    <header className="bg-surface-white dark:bg-surface-container-highest text-deep-emerald dark:text-primary-fixed-dim border-b border-outline-variant dark:border-outline sticky top-0 h-16 border-b dark:border-outline flex justify-between items-center px-gutter w-full z-10 shadow-sm">
      <div className="flex items-center flex-1">
        <button
          onClick={onMenuClick}
          className="md:hidden mr-4 p-2 text-deep-emerald hover:bg-surface-container-low rounded transition-colors"
          aria-label="Open menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
        <div className="relative w-full max-w-md hidden md:block">
          <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-outline" data-icon="search">
            search
          </span>
          <input
            className="w-full bg-soft-cream border-none focus:ring-0 focus:outline-none py-2 pl-10 pr-4 text-sm font-body-md text-on-surface placeholder-outline-variant rounded-full h-10 transition-colors focus:bg-surface-container-low"
            placeholder="Search products, SKUs, or orders..."
            type="text"
          />
        </div>
      </div>
      <div className="flex items-center gap-6 justify-end flex-1">
        <button className="text-deep-emerald dark:text-primary-fixed-dim hover:text-deep-emerald dark:hover:text-primary-fixed transition-colors active:opacity-80 duration-100 relative group">
          <span className="material-symbols-outlined" data-icon="notifications">
            notifications
          </span>
          <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full border border-surface-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-6 border-l border-outline-variant">
          <div className="text-right hidden sm:block"></div>
          <button className="text-deep-emerald dark:text-primary-fixed-dim hover:text-deep-emerald dark:hover:text-primary-fixed transition-colors active:opacity-80 duration-100">
            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }} data-icon="account_circle">
              account_circle
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
