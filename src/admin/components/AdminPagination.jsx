export default function AdminPagination({
  totalItems,
  currentPage,
  pageSize = 15,
  onPageChange,
  itemLabel = 'records',
  disabled = false,
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)
  const visiblePageCount = Math.min(5, totalPages)
  const firstVisiblePage = Math.min(
    Math.max(1, currentPage - Math.floor(visiblePageCount / 2)),
    totalPages - visiblePageCount + 1
  )

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="text-center text-sm text-on-surface-variant sm:text-left" aria-live="polite">
        Showing {startItem} to {endItem} of {totalItems} {itemLabel}
      </p>
      {totalPages > 1 && (
        <nav aria-label={`${itemLabel} pagination`} className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={disabled || currentPage <= 1}
            className="min-h-10 rounded border border-outline-variant px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: visiblePageCount }, (_, index) => firstVisiblePage + index).map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              disabled={disabled}
              className={`min-h-10 min-w-10 rounded border px-3 py-2 text-sm transition-colors disabled:cursor-not-allowed ${currentPage === page ? 'border-deep-emerald bg-deep-emerald text-white' : 'border-outline-variant text-on-surface-variant hover:bg-surface-container-low'}`}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={disabled || currentPage >= totalPages}
            className="min-h-10 rounded border border-outline-variant px-3 py-2 text-sm text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </nav>
      )}
    </div>
  )
}
