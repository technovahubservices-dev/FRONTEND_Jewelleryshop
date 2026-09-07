import { useEffect, useState } from 'react'
import { adminSettingsAPI } from '../../services/api'

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
        storeName: String(data.storeName || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
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
    const storeName = String(storeInfo.storeName || '').trim()
    if (!storeName) {
      showError('Store Name is required')
      return
    }
    setStoreInfoSaving(true)
    showError('')
    try {
      const response = await adminSettingsAPI.update({
        storeName: storeName,
        email: String(storeInfo.email || '').trim(),
        phone: String(storeInfo.phone || '').trim(),
      })
      const data = response.data?.data || response.data || {}
      const info = {
        storeName: String(data.storeName || storeName),
        email: String(data.email || storeInfo.email || ''),
        phone: String(data.phone || storeInfo.phone || ''),
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
  }, [])

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store information and security.</p>
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
