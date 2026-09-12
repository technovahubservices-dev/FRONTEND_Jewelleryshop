import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()
  const { register } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const normalizedIdentifier = identifier.trim()
      const trimmedPassword = password.trim()

      const isEmail = normalizedIdentifier.includes('@')

      const email = isEmail
        ? normalizedIdentifier.toLowerCase()
        : ''

      const phone = isEmail
        ? ''
        : normalizedIdentifier

      await register(
        name.trim(),
        email,
        phone,
        trimmedPassword
      )

      navigate('/account', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-semibold text-center mb-2">
            Create Your Account
          </h1>

          <p className="text-sm text-gray-500 text-center mb-8">
            Create an account to continue
          </p>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Full Name
              </label>

              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="identifier"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email or Phone Number
              </label>

              <input
                id="identifier"
                name="identifier"
                type="text"
                placeholder="Enter email or phone number"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                required
                className="w-full rounded-md border border-gray-300 px-4 py-3 outline-none focus:border-gray-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-black text-white py-3 font-medium disabled:opacity-50"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-600 mt-6">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-black hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}