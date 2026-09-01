import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const from = location.state?.from?.pathname || '/account'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const normalizedEmail = email.trim().toLowerCase()
      const trimmedPassword = password.trim()
      const data = await login(normalizedEmail, trimmedPassword)
      const targetPath = data?.isAdmin ? '/admin' : from
      navigate(targetPath, { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="max-w-md mx-auto">
        <div className="bg-surface-white border border-outline-variant rounded-lg shadow-sm p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="font-display-lg text-display-lg text-deep-emerald">
              Welcome Back
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3">
              Sign in to access your account and orders
            </p>
          </div>

          {error && (
            <div className="bg-error-container/10 border border-error/30 text-error px-4 py-3 rounded mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                autoComplete="email"
                className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors"
                id="email"
                name="email"
                placeholder="you@example.com"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-label-caps text-label-caps text-on-surface-variant mb-2" htmlFor="password">
                Password
              </label>
              <input
                autoComplete="current-password"
                className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors"
                id="password"
                name="password"
                placeholder="Enter your password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-deep-emerald text-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-surface-tint transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Signing In...' : 'SIGN IN'}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-4">
            Don't have an account?{' '}
            <Link to="/register" className="text-deep-emerald hover:text-regal-gold transition-colors font-medium">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
