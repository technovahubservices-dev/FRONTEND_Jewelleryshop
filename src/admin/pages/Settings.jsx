import { useMemo, useState } from 'react'

export default function Settings() {
  const [successMessage, setSuccessMessage] = useState('')
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false)

  const handleSave = () => {
    setSuccessMessage('Settings saved successfully')
  }

  const handleGoogleDriveConnect = () => {
    const authUrl =
      import.meta.env.VITE_GOOGLE_DRIVE_AUTH_URL || '/api/auth/google-drive'

    window.location.href = authUrl
  }

  const handleGoogleDriveDisconnect = () => {
    setGoogleDriveConnected(false)
    setSuccessMessage('Google Drive disconnected')
  }

  const googleDriveStatus = useMemo(
    () => ({
      label: googleDriveConnected ? 'Connected' : 'Not connected',
      tone: googleDriveConnected
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : 'bg-amber-50 text-amber-700 border-amber-200',
      helper: googleDriveConnected
        ? 'Files can be synced and attached from Google Drive.'
        : 'Connect your admin account to enable Drive file access.',
    }),
    [googleDriveConnected]
  )

  const settingSections = [
    {
      title: 'Store Information',
      icon: 'store',
      items: [
        { label: 'Store Name', value: 'JKR' },
        { label: 'Email', value: 'support@JKR.com' },
        { label: 'Phone', value: '+1 (555) 019-8234' },
        { label: 'Currency', value: 'INR (₹)' },
      ],
    },
    {
      title: 'Payment Gateway',
      icon: 'payments',
      items: [
        { label: 'Gateway', value: 'Stripe' },
        { label: 'Status', value: 'Active' },
        { label: 'Test Mode', value: 'Enabled' },
      ],
    },
    {
      title: 'Shipping',
      icon: 'local_shipping',
      items: [
        { label: 'Provider', value: 'Bluedart' },
        { label: 'Free Shipping Threshold', value: '₹5,000' },
        { label: 'Delivery Time', value: '3-5 Business Days' },
      ],
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="mb-12">
        <h1 className="text-3xl font-playfair text-emerald-900 font-bold mb-1">Settings</h1>
        <p className="text-sm text-gray-500">Configure your store preferences, payment gateways, and shipping options.</p>
      </div>

      <div className="space-y-6">
        {settingSections.map((section) => (
          <div key={section.title} className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 p-6 border-b border-outline-variant/30">
              <span className="material-symbols-outlined text-2xl text-deep-emerald">{section.icon}</span>
              <h3 className="font-headline-md text-headline-md text-deep-emerald">{section.title}</h3>
            </div>
            <div className="p-6 space-y-4">
              {section.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-3 border-b border-outline-variant/20 last:border-0">
                  <span className="font-body-md text-body-md text-on-surface-variant">{item.label}</span>
                  <span className="font-body-md text-body-md text-deep-emerald font-semibold">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}

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
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-deep-emerald text-white font-medium shadow-sm transition-all duration-200 hover:bg-primary-container active:scale-95"
                >
                  <span className="material-symbols-outlined text-base">link</span>
                  {googleDriveConnected ? 'Reconnect Drive' : 'Connect with Google'}
                </button>
                <button
                  onClick={handleGoogleDriveDisconnect}
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
        {successMessage && (
          <span className="text-sm text-primary mr-4 self-center">{successMessage}</span>
        )}
        <button onClick={handleSave} className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded transition-all duration-200 hover:bg-primary-container active:scale-95 shadow-sm">
          Save Changes
        </button>
      </div>
    </div>
  );
}
