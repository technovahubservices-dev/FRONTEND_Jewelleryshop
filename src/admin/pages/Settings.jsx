import { useEffect, useMemo, useState } from 'react'
import { adminSettingsAPI, googleDriveAPI } from '../../services/api'

const initialStoreInfo = {
  storeName: '',
  email: '',
  phone: '',
}

const initialPassword = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function Settings() {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false)
  const [googleDriveEmail, setGoogleDriveEmail] = useState('')
  const [googleDriveConnectedAt, setGoogleDriveConnectedAt] = useState('')
  const [googleDriveLoading, setGoogleDriveLoading] = useState(true)
  const [googleDriveActionLoading, setGoogleDriveActionLoading] = useState(false)

  const [storeInfo, setStoreInfo] = useState(initialStoreInfo)
  const [savedStoreInfo, setSavedStoreInfo] = useState(initialStoreInfo)
  const [storeInfoEdit, setStoreInfoEdit] = useState(false)
  const [storeInfoSaving, setStoreInfoSaving] = useState(false)

  const [password, setPassword] = useState(initialPassword)
  const [showPassword, setShowPassword] = useState({ current: false, new: false, confirm: false })
  const [passwordSaving, setPasswordSaving] = useState(false)

  const showMessage = (message) => {
    setSuccessMessage(message)
    setErrorMessage('')
  }

  const showError = (message) => {
    setSuccessMessage('')
    setErrorMessage(message)
  }

  const handleStoreInfoChange = (e) => {
    const { name, value } = e.target
    setStoreInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPassword((prev) => ({ ...prev, [name]: value }))
  }

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const fetchStoreInfo = async () => {
    try {
      const response = await adminSettingsAPI.get()
      const data = response.data?.data || response.data || {}
      const info = {
        storeName: data.storeName || '',
        email: data.email || '',
        phone: data.phone || '',
      }
      setStoreInfo(info)
      setSavedStoreInfo(info)
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your admin session has expired. Please log in again.'
        : error.response?.data?.message || 'Unable to load store settings.'
      showError(message)
    }
  }

  const handleEditStoreInfo = () => {
    setStoreInfoEdit(true)
    showMessage('')
    showError('')
  }

  const handleCancelStoreInfo = () => {
    setStoreInfo({ ...savedStoreInfo })
    setStoreInfoEdit(false)
    showMessage('')
    showError('')
  }

  const handleSaveStoreInfo = async () => {
    if (!storeInfo.storeName.trim()) {
      showError('Store Name is required')
      return
    }
    setStoreInfoSaving(true)
    showError('')
    try {
      const response = await adminSettingsAPI.update({
        storeName: storeInfo.storeName.trim(),
        email: storeInfo.email.trim(),
        phone: storeInfo.phone.trim(),
      })
      const data = response.data?.data || response.data || {}
      const info = {
        storeName: data.storeName || storeInfo.storeName,
        email: data.email || storeInfo.email,
        phone: data.phone || storeInfo.phone,
      }
      setStoreInfo(info)
      setSavedStoreInfo(info)
      setStoreInfoEdit(false)
      showMessage('Store information saved successfully')
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your admin session has expired. Please log in again.'
        : error.response?.data?.message || 'Failed to save store information.'
      showError(message)
    } finally {
      setStoreInfoSaving(false)
    }
  }

  const validatePassword = () => {
    if (!password.currentPassword) {
      return 'Current password is required'
    }
    if (!password.newPassword) {
      return 'New password is required'
    }
    if (password.newPassword.length < 8) {
      return 'New password must be at least 8 characters'
    }
    if (!password.confirmPassword) {
      return 'Confirm password is required'
    }
    if (password.newPassword !== password.confirmPassword) {
      return 'New password and confirm password do not match'
    }
    if (password.currentPassword === password.newPassword) {
      return 'New password must be different from current password'
    }
    return null
  }

  const handleChangePassword = async () => {
    const validationError = validatePassword()
    if (validationError) {
      showError(validationError)
      return
    }
    setPasswordSaving(true)
    showError('')
    try {
      await adminSettingsAPI.changePassword({
        currentPassword: password.currentPassword,
        newPassword: password.newPassword,
        confirmPassword: password.confirmPassword,
      })
      setPassword(initialPassword)
      setShowPassword({ current: false, new: false, confirm: false })
      showMessage('Password changed successfully')
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Current password is incorrect'
        : error.response?.data?.message || 'Failed to change password.'
      showError(message)
    } finally {
      setPasswordSaving(false)
    }
  }

  const refreshGoogleDriveStatus = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      showError('Your admin session has expired. Please log in again.')
      setGoogleDriveLoading(false)
      return
    }

    try {
      const response = await googleDriveAPI.getStatus({
        headers: { Authorization: `Bearer ${token}` },
        skipAuthRedirect: true,
      })
      const status = response.data?.data || response.data
      setGoogleDriveConnected(Boolean(status?.connected ?? status?.isConnected))
      setGoogleDriveEmail(status?.email || status?.account?.email || '')
      setGoogleDriveConnectedAt(status?.connectedAt || status?.connectedDate || status?.createdAt || '')
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your admin session is not authorized to access Google Drive.'
        : error.response?.data?.message || 'Unable to check Google Drive connection status.'
      showError(message)
    } finally {
      setGoogleDriveLoading(false)
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const googleDriveResult = params.get('googleDrive')

    if (googleDriveResult === 'connected') {
      setSuccessMessage('Google Drive connected successfully')
      params.delete('googleDrive')
      params.delete('reason')
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`)
    } else if (googleDriveResult === 'error') {
      const reason = params.get('reason')
      setErrorMessage(reason ? `Google Drive connection failed: ${reason}` : 'Google Drive connection failed.')
      params.delete('googleDrive')
      params.delete('reason')
      window.history.replaceState({}, '', `${window.location.pathname}${params.toString() ? `?${params}` : ''}`)
    }

    fetchStoreInfo()
    refreshGoogleDriveStatus()
  }, [])

  const handleGoogleDriveConnect = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      showError('Your admin session has expired. Please log in again.')
      return
    }

    setGoogleDriveActionLoading(true)
    setErrorMessage('')
    try {
      const response = await googleDriveAPI.startOAuth({
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        skipAuthRedirect: true,
      })
      const authUrl = response.data?.authUrl || response.data?.data?.authUrl
      if (!authUrl) {
        throw new Error('The server did not return a Google authorization URL.')
      }
      window.location.href = authUrl
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your admin session is not authorized to connect Google Drive.'
        : error.response?.data?.message || error.message || 'Unable to start Google Drive connection.'
      showError(message)
      setGoogleDriveActionLoading(false)
    }
  }

  const handleGoogleDriveDisconnect = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      showError('Your admin session has expired. Please log in again.')
      return
    }

    setGoogleDriveActionLoading(true)
    setErrorMessage('')
    try {
      await googleDriveAPI.disconnect({
        headers: { Authorization: `Bearer ${token}` },
        skipAuthRedirect: true,
      })
      setSuccessMessage('Google Drive disconnected')
      await refreshGoogleDriveStatus()
    } catch (error) {
      const message = error.response?.status === 401
        ? 'Your admin session is not authorized to disconnect Google Drive.'
        : error.response?.data?.message || 'Unable to disconnect Google Drive.'
      showError(message)
    } finally {
      setGoogleDriveActionLoading(false)
    }
  }

  const googleDriveStatus = useMemo(
    () => ({
      label: googleDriveConnected ? 'Connected' : 'Not connected',
      tone: googleDriveConnected
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200',
      helper: googleDriveConnected
        ? `Files can be synced and attached from Google Drive.${googleDriveEmail ? ` Connected as ${googleDriveEmail}.` : ''}${googleDriveConnectedAt ? ` Connected on ${new Date(googleDriveConnectedAt).toLocaleDateString()}.` : ''}`
        : 'Connect your admin account to enable Drive file access.',
    }),
    [googleDriveConnected, googleDriveEmail, googleDriveConnectedAt]
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store information and integrations.</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">store</span>
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Store Information</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex flex-col gap-2 py-3 last:pb-0">
              <label className="font-body-md text-sm text-on-surface-variant">Store Name</label>
              {storeInfoEdit ? (
                <input
                  type="text"
                  name="storeName"
                  value={storeInfo.storeName}
                  onChange={handleStoreInfoChange}
                  className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                />
              ) : (
                <span className="text-sm font-body-md text-on-surface">{storeInfo.storeName || '—'}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 py-3 last:pb-0">
              <label className="font-body-md text-sm text-on-surface-variant">Email</label>
              {storeInfoEdit ? (
                <input
                  type="email"
                  name="email"
                  value={storeInfo.email}
                  onChange={handleStoreInfoChange}
                  className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                />
              ) : (
                <span className="text-sm font-body-md text-on-surface">{storeInfo.email || '—'}</span>
              )}
            </div>
            <div className="flex flex-col gap-2 py-3 last:pb-0">
              <label className="font-body-md text-sm text-on-surface-variant">Phone</label>
              {storeInfoEdit ? (
                <input
                  type="tel"
                  name="phone"
                  value={storeInfo.phone}
                  onChange={handleStoreInfoChange}
                  className="px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                />
              ) : (
                <span className="text-sm font-body-md text-on-surface">{storeInfo.phone || '—'}</span>
              )}
            </div>
            <div className="flex justify-end pt-4 gap-3">
              {storeInfoEdit ? (
                <>
                  <button
                    onClick={handleCancelStoreInfo}
                    disabled={storeInfoSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-outline-variant/60 text-deep-emerald font-medium transition-all duration-200 hover:bg-surface-container-low disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveStoreInfo}
                    disabled={storeInfoSaving}
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-emerald text-white font-medium shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-95 disabled:opacity-50"
                  >
                    {storeInfoSaving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditStoreInfo}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-emerald text-white font-medium shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">edit</span>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">security</span>
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Security</h3>
          </div>
          <div className="p-6 space-y-4">
            <h4 className="text-lg font-semibold text-deep-emerald">Change Admin Password</h4>
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">Current Password</label>
              <div className="relative">
                <input
                  type={showPassword.current ? 'text' : 'password'}
                  name="currentPassword"
                  value={password.currentPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordSaving}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md pr-12 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current')}
                  disabled={passwordSaving}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-emerald disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword.current ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">New Password</label>
              <div className="relative">
                <input
                  type={showPassword.new ? 'text' : 'password'}
                  name="newPassword"
                  value={password.newPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordSaving}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md pr-12 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('new')}
                  disabled={passwordSaving}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-emerald disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword.new ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">Minimum 8 characters</p>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? 'text' : 'password'}
                  name="confirmPassword"
                  value={password.confirmPassword}
                  onChange={handlePasswordChange}
                  disabled={passwordSaving}
                  className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md pr-12 disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('confirm')}
                  disabled={passwordSaving}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-deep-emerald disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-lg">
                    {showPassword.confirm ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button
                onClick={handleChangePassword}
                disabled={passwordSaving}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-emerald text-white font-medium shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-95 disabled:opacity-50"
              >
                {passwordSaving ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">cloud_sync</span>
            <div>
              <h3 className="font-headline-md text-headline-md text-deep-emerald">Integrations</h3>
              <p className="text-sm text-gray-500">Connect third-party services used by the admin team.</p>
            </div>
          </div>

          <div className="p-6">
            <div className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/70 p-5 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-2xl bg-white border border-outline-variant/40 flex items-center justify-center shadow-sm">
                  <span className="material-symbols-outlined text-[28px] text-[#4285F4]">drive_folder_upload</span>
                </div>
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-lg font-semibold text-deep-emerald">Google Drive</h4>
                    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${googleDriveStatus.tone}`}>
                      {googleDriveStatus.label}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 max-w-2xl">
                    Use OAuth to let admins connect a Google account and access Drive files without storing passwords.
                  </p>
                  <p className="mt-2 text-sm text-gray-600">{googleDriveStatus.helper}</p>
                  <ul className="mt-4 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                      Secure OAuth flow with backend token exchange
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                      Access scoped to Drive files only
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-base text-emerald-600">check_circle</span>
                      Ready for file picker or upload sync later
                    </li>
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-3 md:items-end">
                <button
                  onClick={handleGoogleDriveConnect}
                  disabled={googleDriveLoading || googleDriveActionLoading}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-emerald text-white font-medium shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                  {googleDriveActionLoading ? 'Connecting...' : googleDriveConnected ? 'Reconnect Drive' : 'Connect with Google'}
                </button>
                <button
                  onClick={handleGoogleDriveDisconnect}
                  disabled={googleDriveLoading || googleDriveActionLoading || !googleDriveConnected}
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-outline-variant/60 text-deep-emerald font-medium transition-all duration-200 hover:bg-surface-container-low"
                >
                  <span className="material-symbols-outlined text-base">link_off</span>
                  Disconnect
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t border-outline-variant/30">
        {(successMessage || errorMessage) && (
          <span className={`text-sm mr-4 self-center ${errorMessage ? 'text-red-600' : 'text-primary'}`}>
            {errorMessage || successMessage}
          </span>
        )}
      </div>
    </div>
  )
}
