import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="max-w-md mx-auto text-center">
        <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-4 block">
          sentiment_very_dissatisfied
        </span>
        <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">404</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-8">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
        >
          Go Back Home
        </Link>
      </div>
    </main>
  )
}
