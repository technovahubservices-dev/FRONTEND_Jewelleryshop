import { useEffect, useState } from 'react'
import { adminSettingsAPI } from '../../services/api'

const initialStoreInfo = {
  storeName: '',
  email: '',
  phone: '',
  address: '',
  instagramUrl: '',
  instagramUsername: '',
  contactDescription: '',
}

const initialPassword = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

export default function Settings() {
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const [storeInfo, setStoreInfo] = useState(initialStoreInfo)
  const [savedStoreInfo, setSavedStoreInfo] = useState(initialStoreInfo)
  const [storeInfoEdit, setStoreInfoEdit] = useState(false)
  const [storeInfoSaving, setStoreInfoSaving] = useState(false)

  const [password, setPassword] = useState(initialPassword)
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
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

    setStoreInfo((prev) => ({
      ...prev,
      [name]: value,
    }))

    setFieldErrors((prev) => ({
      ...prev,
      [name]: '',
    }))

    if (errorMessage) {
      setErrorMessage('')
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target

    setPassword((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const toggleShowPassword = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const fetchStoreInfo = async () => {
    try {
      const response = await adminSettingsAPI.get()
      const data = response.data?.data || response.data || {}

      const info = {
        storeName: String(data.storeName || ''),
        email: String(data.email || ''),
        phone: String(data.phone || ''),
        address: String(data.address || ''),
        instagramUrl: String(data.instagramUrl || ''),
        instagramUsername: String(data.instagramUsername || ''),
        contactDescription: String(data.contactDescription || ''),
      }

      setStoreInfo(info)
      setSavedStoreInfo(info)
    } catch (error) {
      const message =
        error.response?.status === 401
          ? 'Your admin session has expired. Please log in again.'
          : error.response?.data?.message ||
            'Unable to load store settings.'

      showError(message)
    }
  }

  const handleEditStoreInfo = () => {
    setStoreInfoEdit(true)
    setFieldErrors({})
    showMessage('')
    showError('')
  }

  const handleCancelStoreInfo = () => {
    setStoreInfo({ ...savedStoreInfo })
    setStoreInfoEdit(false)
    setFieldErrors({})
    showMessage('')
    showError('')
  }

  const handleSaveStoreInfo = async () => {
    const storeName = String(storeInfo.storeName || '').trim()
    const email = String(storeInfo.email || '').trim()
    const phone = String(storeInfo.phone || '').trim()
    const address = String(storeInfo.address || '').trim()
    const instagramUrl = String(storeInfo.instagramUrl || '').trim()
    const instagramUsername = String(
      storeInfo.instagramUsername || ''
    ).trim()
    const contactDescription = String(
      storeInfo.contactDescription || ''
    ).trim()

    const errors = {}

    if (!storeName) {
      errors.storeName = 'Store Name is required'
    }

    if (!email) {
      errors.email = 'Email is required'
    }

    if (!phone) {
      errors.phone = 'Phone is required'
    }

    if (!address) {
      errors.address = 'Address is required'
    }

    if (!instagramUrl) {
      errors.instagramUrl = 'Instagram URL is required'
    }

    if (!instagramUsername) {
      errors.instagramUsername = 'Instagram Username is required'
    }

    if (!contactDescription) {
      errors.contactDescription = 'Contact Description is required'
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      showError(Object.values(errors)[0])
      return
    }

    setFieldErrors({})
    setStoreInfoSaving(true)
    showError('')

    try {
      const response = await adminSettingsAPI.update({
        storeName,
        email,
        phone,
        address,
        instagramUrl,
        instagramUsername,
        contactDescription,
      })

      const data = response.data?.data || response.data || {}

      const info = {
        storeName: String(data.storeName || storeName),
        email: String(data.email || email),
        phone: String(data.phone || phone),
        address: String(data.address || address),
        instagramUrl: String(data.instagramUrl || instagramUrl),
        instagramUsername: String(
          data.instagramUsername || instagramUsername
        ),
        contactDescription: String(
          data.contactDescription || contactDescription
        ),
      }

      setStoreInfo(info)
      setSavedStoreInfo(info)
      setStoreInfoEdit(false)

      showMessage('Store information saved successfully')
      setTimeout(() => {
  setSuccessMessage('')
}, 3000)
    } catch (error) {
      const message =
        error.response?.status === 401
          ? 'Your admin session has expired. Please log in again.'
          : error.response?.data?.message ||
            'Failed to save store information.'

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

    return ''
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
      setShowPassword({
        current: false,
        new: false,
        confirm: false,
      })

      showMessage('Password changed successfully')
    } catch (error) {
      const message =
        error.response?.status === 401
          ? 'Current password is incorrect'
          : error.response?.data?.message ||
            'Failed to change password.'

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

      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${
          params.toString() ? `?${params}` : ''
        }`
      )
    } else if (googleDriveResult === 'error') {
      const reason = params.get('reason')

      setErrorMessage(
        reason
          ? `Google Drive connection failed: ${reason}`
          : 'Google Drive connection failed.'
      )

      params.delete('googleDrive')
      params.delete('reason')

      window.history.replaceState(
        {},
        '',
        `${window.location.pathname}${
          params.toString() ? `?${params}` : ''
        }`
      )
    }

    fetchStoreInfo()
  }, [])

  const inputClass = (fieldName) =>
    `px-4 py-2.5 rounded text-sm font-body-md ${
      fieldErrors[fieldName]
        ? 'border border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
        : 'border border-outline-variant focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald'
    }`

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">
          Settings
        </h1>

        <p className="text-sm text-gray-500">
          Configure your store information and security.
        </p>
      </div>
      <div className="space-y-6">
        {(successMessage || errorMessage) && (
  <div
    className={`rounded-md px-4 py-3 text-sm font-medium ${
      errorMessage
        ? 'bg-red-50 text-red-600 border border-red-200'
        : 'bg-green-50 text-green-600 border border-green-200'
    }`}
  >
    {errorMessage || successMessage}
  </div>
)}

        {/* Store Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">
              store
            </span>

            <h3 className="font-headline-md text-headline-md text-deep-emerald">
              Store Information
            </h3>
          </div>

          <div className="p-6 space-y-4">

            {/* Store Name */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Store Name <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <input
                    type="text"
                    name="storeName"
                    value={storeInfo.storeName}
                    onChange={handleStoreInfoChange}
                    className={inputClass('storeName')}
                  />

                  {fieldErrors.storeName && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.storeName}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface">
                  {storeInfo.storeName || '—'}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Email <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <input
                    type="email"
                    name="email"
                    value={storeInfo.email}
                    onChange={handleStoreInfoChange}
                    className={inputClass('email')}
                  />

                  {fieldErrors.email && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.email}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface">
                  {storeInfo.email || '—'}
                </span>
              )}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Phone <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <input
                    type="tel"
                    name="phone"
                    value={storeInfo.phone}
                    onChange={handleStoreInfoChange}
                    className={inputClass('phone')}
                  />

                  {fieldErrors.phone && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.phone}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface">
                  {storeInfo.phone || '—'}
                </span>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Address <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <textarea
                    name="address"
                    value={storeInfo.address}
                    onChange={handleStoreInfoChange}
                    rows="3"
                    className={inputClass('address')}
                  />

                  {fieldErrors.address && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.address}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface whitespace-pre-line">
                  {storeInfo.address || '—'}
                </span>
              )}
            </div>

            {/* Instagram URL */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Instagram URL <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <input
                    type="url"
                    name="instagramUrl"
                    value={storeInfo.instagramUrl}
                    onChange={handleStoreInfoChange}
                    className={inputClass('instagramUrl')}
                  />

                  {fieldErrors.instagramUrl && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.instagramUrl}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface">
                  {storeInfo.instagramUrl || '—'}
                </span>
              )}
            </div>

            {/* Instagram Username */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Instagram Username <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <input
                    type="text"
                    name="instagramUsername"
                    value={storeInfo.instagramUsername}
                    onChange={handleStoreInfoChange}
                    className={inputClass('instagramUsername')}
                  />

                  {fieldErrors.instagramUsername && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.instagramUsername}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface">
                  {storeInfo.instagramUsername || '—'}
                </span>
              )}
            </div>

            {/* Contact Description */}
            <div className="flex flex-col gap-2 py-3">
              <label className="font-body-md text-sm text-on-surface-variant">
                Contact Description <span className="text-red-500">*</span>
              </label>

              {storeInfoEdit ? (
                <>
                  <textarea
                    name="contactDescription"
                    value={storeInfo.contactDescription}
                    onChange={handleStoreInfoChange}
                    rows="4"
                    className={inputClass('contactDescription')}
                  />

                  {fieldErrors.contactDescription && (
                    <span className="text-sm text-red-600">
                      {fieldErrors.contactDescription}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm font-body-md text-on-surface whitespace-pre-line">
                  {storeInfo.contactDescription || '—'}
                </span>
              )}
            </div>

            {/* Store Buttons */}
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
                  <span className="material-symbols-outlined text-base">
                    edit
                  </span>
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">
              security
            </span>

            <h3 className="font-headline-md text-headline-md text-deep-emerald">
              Security
            </h3>
          </div>

          <div className="p-6 space-y-4">
            <h4 className="text-lg font-semibold text-deep-emerald">
              Change Admin Password
            </h4>

            {/* Current Password */}
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">
                Current Password
              </label>

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
                    {showPassword.current
                      ? 'visibility_off'
                      : 'visibility'}
                  </span>
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">
                New Password
              </label>

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
                    {showPassword.new
                      ? 'visibility_off'
                      : 'visibility'}
                  </span>
                </button>
              </div>

              <p className="text-xs text-on-surface-variant mt-1">
                Minimum 8 characters
              </p>
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-2">
              <label className="font-body-md text-sm text-on-surface-variant">
                Confirm New Password
              </label>

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
                    {showPassword.confirm
                      ? 'visibility_off'
                      : 'visibility'}
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


    </div>
  )
}