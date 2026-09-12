import { useState } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
      const normalizedIdentifier = identifier.trim()
      const trimmedPassword = password.trim()

      const data = await login(normalizedIdentifier, trimmedPassword)

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
              <label
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                htmlFor="identifier"
              >
                Email or Phone Number
              </label>

              <input
                autoComplete="username"
                className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 px-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors"
                id="identifier"
                name="identifier"
                placeholder="Enter email or phone number"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>

            <div>
              <label
                className="block font-label-caps text-label-caps text-on-surface-variant mb-2"
                htmlFor="password"
              >
                Password
              </label>

              <div className="relative">
                <input
                  autoComplete="current-password"
                  className="block w-full border-0 border-b border-outline-variant bg-transparent py-2 pr-10 pl-0 text-on-background focus:ring-0 focus:border-deep-emerald sm:text-sm transition-colors"
                  name="password"
                  placeholder="Enter your password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-emerald"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
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
            <Link
              to="/register"
              className="text-deep-emerald hover:text-regal-gold transition-colors font-medium"
            >
              Create Account
            </Link>
          </p>

        </div>
      </div>
    </main>
  )
}