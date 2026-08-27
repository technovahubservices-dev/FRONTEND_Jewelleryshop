import { useState } from 'react'

export default function Settings() {
  const [successMessage, setSuccessMessage] = useState('');

  const handleSave = () => {
    setSuccessMessage('Settings saved successfully');
  };

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
