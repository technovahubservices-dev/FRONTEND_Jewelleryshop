import { useNavigate } from 'react-router-dom'

export default function BackButton({ to, fallbackTo, className = '', children, ...props }) {
  const navigate = useNavigate()

  const handleClick = (e) => {
    if (to) {
      navigate(to)
    } else if (Number.isInteger(window.history.state?.idx) && window.history.state.idx > 0) {
      navigate(-1)
    } else if (fallbackTo) {
      navigate(fallbackTo, { replace: true })
    } else {
      navigate(-1)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-deep-emerald bg-surface-white border border-outline-variant hover:bg-surface-container-low hover:border-deep-emerald/40 transition-colors duration-200 ${className}`}
      {...props}
    >
      <span className="material-symbols-outlined text-[18px]">arrow_back</span>
      {children && <span>{children}</span>}
    </button>
  )
}
