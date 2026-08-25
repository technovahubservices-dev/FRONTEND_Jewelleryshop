import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Settings() {
  const navigate = useNavigate()
  const { user, isAuthenticated, updateProfile, changePassword, logout } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [profileForm, setProfileForm] = useState({ name: '', email: '', phone: '' })
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })
  const [profileLoading, setProfileLoading] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [profileSuccess, setProfileSuccess] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/account/settings' } })
      return
    }
    if (user) {
      setProfileForm({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
      })
    }
  }, [isAuthenticated, user, navigate])

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setProfileForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleProfileSubmit = async (e) => {
    e.preventDefault()
    setProfileError('')
    setProfileSuccess('')
    setProfileLoading(true)

    try {
      const data = { name: profileForm.name, email: profileForm.email }
      if (profileForm.phone !== undefined) data.phone = profileForm.phone
      await updateProfile(data)
      setProfileSuccess('Profile updated successfully')
    } catch (err) {
      setProfileError(err.message || 'Failed to update profile')
    } finally {
      setProfileLoading(false)
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match')
      return
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters')
      return
    }

    setPasswordLoading(true)
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordSuccess('Password changed successfully')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password')
    } finally {
      setPasswordLoading(false)
    }
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex-grow flex w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-2 border-b border-outline-variant">My Account</h2>
          <nav className="flex flex-col gap-2 font-body-md text-body-md">
            <Link to="/account" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">person</span>
              Profile Overview
            </Link>
            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">shopping_basket</span>
              My Orders
            </Link>
            <Link to="/account/wishlist" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">favorite</span>
              Wishlist
            </Link>
            <Link to="/account/addresses" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">location_on</span>
              Addresses
            </Link>
            <Link to="/account/settings" className="flex items-center gap-3 px-4 py-3 bg-surface-white text-deep-emerald font-bold rounded border border-outline-variant shadow-sm transition-all">
              <span className="material-symbols-outlined text-regal-gold">settings</span>
              Account Settings
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        <header className="mb-8">
          <h1 className="font-display-lg text-display-lg text-deep-emerald">Account Settings</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Update your profile information and password.</p>
        </header>

        <div className="bg-surface-white border border-outline-variant rounded shadow-sm overflow-hidden">
          <div className="flex border-b border-outline-variant">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-4 font-label-caps text-label-caps uppercase tracking-widest transition-colors ${activeTab === 'profile' ? 'text-deep-emerald border-b-2 border-deep-emerald' : 'text-on-surface-variant hover:text-deep-emerald'}`}
            >
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex-1 py-4 font-label-caps text-label-caps uppercase tracking-widest transition-colors ${activeTab === 'password' ? 'text-deep-emerald border-b-2 border-deep-emerald' : 'text-on-surface-variant hover:text-deep-emerald'}`}
            >
              Change Password
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit} className="max-w-xl space-y-6">
                {profileError && (
                  <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                    {profileError}
                  </div>
                )}

                {profileSuccess && (
                  <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
                    {profileSuccess}
                  </div>
                )}

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileForm.name}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={profileForm.email}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileForm.phone}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Phone Number"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {profileLoading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
                    Save Changes
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handlePasswordSubmit} className="max-w-xl space-y-6">
                {passwordError && (
                  <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                    {passwordError}
                  </div>
                )}

                {passwordSuccess && (
                  <div className="p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
                    {passwordSuccess}
                  </div>
                )}

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                    minLength="6"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    required
                    minLength="6"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {passwordLoading && <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>}
                    Change Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
