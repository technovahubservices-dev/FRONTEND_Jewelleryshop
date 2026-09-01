import { useState, useEffect } from 'react';
import { adminSettingsAPI, userAPI } from '../../services/api';

const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'JPY', 'CAD', 'AUD', 'SGD'];

const DEFAULT_STORE = {
  storeName: '',
  email: '',
  phone: '',
  currency: 'INR',
};

export default function Settings() {
  const [store, setStore] = useState(DEFAULT_STORE);
  const [storeDraft, setStoreDraft] = useState(DEFAULT_STORE);
  const [isEditingStore, setIsEditingStore] = useState(false);
  const [storeLoading, setStoreLoading] = useState(true);
  const [storeSaving, setStoreSaving] = useState(false);
  const [storeErrors, setStoreErrors] = useState({});
  const [message, setMessage] = useState({ type: '', text: '' });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSaving, setPasswordSaving] = useState(false);

  const adminUsername = (() => {
    try {
      const raw = localStorage.getItem('user');
      if (!raw) return '';
      const parsed = JSON.parse(raw);
      return parsed?.email || '';
    } catch {
      return '';
    }
  })();

  useEffect(() => {
    fetchStoreSettings();
  }, []);

  useEffect(() => {
    if (message.text) {
      const t = setTimeout(() => setMessage({ type: '', text: '' }), 4000);
      return () => clearTimeout(t);
    }
  }, [message]);

  const fetchStoreSettings = async () => {
    try {
      setStoreLoading(true);
      const res = await adminSettingsAPI.getSettings();
      if (res.data?.success) {
        const data = {
          storeName: res.data.data.storeName || '',
          email: res.data.data.email || '',
          phone: res.data.data.phone || '',
          currency: res.data.data.currency || 'INR',
        };
        setStore(data);
        setStoreDraft(data);
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to load store settings' });
    } finally {
      setStoreLoading(false);
    }
  };

  const validateStore = (values) => {
    const errs = {};
    if (!values.storeName || !values.storeName.trim()) {
      errs.storeName = 'Store name is required';
    } else if (values.storeName.trim().length > 120) {
      errs.storeName = 'Store name cannot exceed 120 characters';
    }
    if (!values.email || !values.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/^\S+@\S+\.\S+$/.test(values.email.trim())) {
      errs.email = 'Please provide a valid email';
    }
    if (!values.phone || !values.phone.trim()) {
      errs.phone = 'Phone is required';
    } else if (values.phone.trim().length > 30) {
      errs.phone = 'Phone cannot exceed 30 characters';
    }
    if (!values.currency || !SUPPORTED_CURRENCIES.includes(values.currency)) {
      errs.currency = 'Please select a supported currency';
    }
    return errs;
  };

  const handleEditStore = () => {
    setStoreDraft(store);
    setStoreErrors({});
    setIsEditingStore(true);
  };

  const handleCancelEditStore = () => {
    setStoreDraft(store);
    setStoreErrors({});
    setIsEditingStore(false);
  };

  const handleStoreFieldChange = (field, value) => {
    setStoreDraft((prev) => ({ ...prev, [field]: value }));
    if (storeErrors[field]) {
      setStoreErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSaveStore = async () => {
    const errs = validateStore(storeDraft);
    if (Object.keys(errs).length > 0) {
      setStoreErrors(errs);
      return;
    }
    try {
      setStoreSaving(true);
      const payload = {
        storeName: storeDraft.storeName.trim(),
        email: storeDraft.email.trim().toLowerCase(),
        phone: storeDraft.phone.trim(),
        currency: storeDraft.currency,
      };
      const res = await adminSettingsAPI.updateSettings(payload);
      if (res.data?.success) {
        const data = {
          storeName: res.data.data.storeName,
          email: res.data.data.email,
          phone: res.data.data.phone,
          currency: res.data.data.currency,
        };
        setStore(data);
        setStoreDraft(data);
        setIsEditingStore(false);
        setMessage({ type: 'success', text: res.data.message || 'Store information saved successfully' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save store information' });
    } finally {
      setStoreSaving(false);
    }
  };

  const validatePassword = (values) => {
    const errs = {};
    if (!values.currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!values.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (values.newPassword.length < 8) {
      errs.newPassword = 'New password must be at least 8 characters';
    } else if (values.newPassword.length > 128) {
      errs.newPassword = 'New password is too long';
    } else if (!/[A-Za-z]/.test(values.newPassword) || !/\d/.test(values.newPassword)) {
      errs.newPassword = 'New password must include letters and numbers';
    } else if (values.currentPassword && values.newPassword === values.currentPassword) {
      errs.newPassword = 'New password must differ from current password';
    }
    if (!values.confirmPassword) {
      errs.confirmPassword = 'Please confirm the new password';
    } else if (values.newPassword !== values.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    const errs = validatePassword(passwordForm);
    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    try {
      setPasswordSaving(true);
      const res = await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      if (res.data?.success) {
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordErrors({});
        setMessage({ type: 'success', text: res.data.message || 'Password changed successfully' });
      }
    } catch (err) {
      const apiMessage = err.response?.data?.message || 'Failed to change password';
      setMessage({ type: 'error', text: apiMessage });
      if (apiMessage.toLowerCase().includes('current password')) {
        setPasswordErrors((prev) => ({ ...prev, currentPassword: apiMessage }));
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleResetPassword = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  };

  const passwordStrength = (() => {
    const pwd = passwordForm.newPassword;
    if (!pwd) return { label: '', score: 0 };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/\d/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    return { label: labels[score], score };
  })();

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Manage your store information and admin account security.</p>
      </div>

      {message.text && (
        <div
          role="alert"
          className={`px-4 py-3 rounded-md text-sm border ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between gap-4 p-6 border-b border-outline-variant/30">
          <div className="flex items-center gap-4">
            <span className="material-symbols-outlined text-2xl text-deep-emerald">store</span>
            <h3 className="font-headline-md text-headline-md text-deep-emerald">Store Information</h3>
          </div>
          {!isEditingStore && !storeLoading && (
            <button
              type="button"
              onClick={handleEditStore}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-label-caps text-label-caps text-deep-emerald border border-deep-emerald/30 rounded-md hover:bg-emerald-50 transition-colors"
            >
              <span className="material-symbols-outlined text-base">edit</span>
              Edit
            </button>
          )}
        </div>

        {storeLoading ? (
          <div className="p-6 text-sm text-gray-500">Loading store information...</div>
        ) : !isEditingStore ? (
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/20">
              <span className="font-body-md text-body-md text-on-surface-variant">Store Name</span>
              <span className="font-body-md text-body-md text-deep-emerald font-semibold">{store.storeName || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/20">
              <span className="font-body-md text-body-md text-on-surface-variant">Email</span>
              <span className="font-body-md text-body-md text-deep-emerald font-semibold">{store.email || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-outline-variant/20">
              <span className="font-body-md text-body-md text-on-surface-variant">Phone</span>
              <span className="font-body-md text-body-md text-deep-emerald font-semibold">{store.phone || '—'}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="font-body-md text-body-md text-on-surface-variant">Currency</span>
              <span className="font-body-md text-body-md text-deep-emerald font-semibold">{store.currency || '—'}</span>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                Store Name <span className="text-red-500">*</span>
              </label>
              <input
                id="storeName"
                type="text"
                value={storeDraft.storeName}
                onChange={(e) => handleStoreFieldChange('storeName', e.target.value)}
                maxLength={120}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  storeErrors.storeName ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="e.g. JKR"
              />
              {storeErrors.storeName && (
                <p className="mt-1 text-xs text-red-600">{storeErrors.storeName}</p>
              )}
            </div>

            <div>
              <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                id="storeEmail"
                type="email"
                value={storeDraft.email}
                onChange={(e) => handleStoreFieldChange('email', e.target.value)}
                maxLength={120}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  storeErrors.email ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="support@example.com"
              />
              {storeErrors.email && (
                <p className="mt-1 text-xs text-red-600">{storeErrors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone <span className="text-red-500">*</span>
              </label>
              <input
                id="storePhone"
                type="text"
                value={storeDraft.phone}
                onChange={(e) => handleStoreFieldChange('phone', e.target.value)}
                maxLength={30}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  storeErrors.phone ? 'border-red-400' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 000-0000"
              />
              {storeErrors.phone && (
                <p className="mt-1 text-xs text-red-600">{storeErrors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="storeCurrency" className="block text-sm font-medium text-gray-700 mb-1">
                Currency <span className="text-red-500">*</span>
              </label>
              <select
                id="storeCurrency"
                value={storeDraft.currency}
                onChange={(e) => handleStoreFieldChange('currency', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 bg-white ${
                  storeErrors.currency ? 'border-red-400' : 'border-gray-300'
                }`}
              >
                {SUPPORTED_CURRENCIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {storeErrors.currency && (
                <p className="mt-1 text-xs text-red-600">{storeErrors.currency}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEditStore}
                disabled={storeSaving}
                className="px-4 py-2 text-sm font-label-caps text-label-caps border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveStore}
                disabled={storeSaving}
                className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm disabled:opacity-60"
              >
                {storeSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
          <span className="material-symbols-outlined text-2xl text-deep-emerald">lock</span>
          <h3 className="font-headline-md text-headline-md text-deep-emerald">Admin Password</h3>
        </div>
        <form onSubmit={handleSubmitPassword} className="p-6 space-y-4" noValidate>
          <input
            type="text"
            name="username"
            autoComplete="username"
            value={adminUsername}
            readOnly
            hidden
            aria-hidden="true"
            tabIndex={-1}
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px', opacity: 0 }}
          />
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Current Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showPassword.current ? 'text' : 'password'}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordFieldChange('currentPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  passwordErrors.currentPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword.current ? 'Hide current password' : 'Show current password'}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword.current ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.currentPassword}</p>
            )}
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword.new ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordFieldChange('newPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  passwordErrors.newPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword.new ? 'Hide new password' : 'Show new password'}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword.new ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.newPassword && (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.newPassword}</p>
            )}
            {passwordForm.newPassword && !passwordErrors.newPassword && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded ${
                        i <= passwordStrength.score
                          ? passwordStrength.score <= 2
                            ? 'bg-red-400'
                            : passwordStrength.score <= 3
                            ? 'bg-yellow-400'
                            : 'bg-emerald-500'
                          : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Strength: {passwordStrength.label}</p>
              </div>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Use 8+ characters with a mix of letters, numbers, and symbols.
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword.confirm ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordFieldChange('confirmPassword', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 ${
                  passwordErrors.confirmPassword ? 'border-red-400' : 'border-gray-300'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                aria-label={showPassword.confirm ? 'Hide confirm password' : 'Show confirm password'}
              >
                <span className="material-symbols-outlined text-base">
                  {showPassword.confirm ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
            {passwordErrors.confirmPassword && (
              <p className="mt-1 text-xs text-red-600">{passwordErrors.confirmPassword}</p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetPassword}
              disabled={passwordSaving}
              className="px-4 py-2 text-sm font-label-caps text-label-caps border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Clear
            </button>
            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm disabled:opacity-60"
            >
              {passwordSaving ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
