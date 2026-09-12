import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { contactAPI, storeAPI } from '../services/api'

export default function Contact() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [storeEmail, setStoreEmail] = useState('')
  const [storePhone, setStorePhone] = useState('')
  const [loadingSettings, setLoadingSettings] = useState(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return

    setSubmitting(true)
    setSubmitError('')

    try {
      const response = await contactAPI.create({
        name: form.name,
        email: form.email,
        message: form.message,
      })

      if (response.data?.success) {
        setSubmitted(true)
        setForm({ name: '', email: '', message: '' })
      } else {
        setSubmitError(response.data?.message || 'Failed to send your message. Please try again.')
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to send your message. Please try again.'
      setSubmitError(errMsg)
    } finally {
      setSubmitting(false)
    }
  }

  const fetchStoreSettings = async () => {
    try {
      const response = await storeAPI.getSettings()
      const data = response.data?.data || response.data || {}
      setStoreEmail(String(data.email || ''))
      setStorePhone(String(data.phone || ''))
    } catch (error) {
      console.error('Failed to load store settings:', error)
    } finally {
      setLoadingSettings(false)
    }
  }

  useEffect(() => {
    fetchStoreSettings()
  }, [])

  const getWhatsAppLink = () => {
    const formattedPhone = storePhone.replace(/\D/g, '')
    const message = encodeURIComponent('Hi, I would like to know more about your products.')
    return `https://wa.me/${formattedPhone}?text=${message}`
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="text-center mb-12">
        <h1 className="font-display-lg text-display-lg md:text-headline-lg text-deep-emerald mb-4">Contact Us</h1>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
          We would love to hear from you. Reach out for appointments, custom orders, or any questions about our collections.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        {/* Company Details Column */}
        <div className="space-y-8">
          <div className="bg-surface-white border border-outline-variant/30 rounded-xl shadow-sm p-6 md:p-8">
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6">JKR Jewellery</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-regal-gold text-[28px] mt-0.5">storefront</span>
                <div>
                  <p className="font-body-md text-body-md text-charcoal-text font-medium">Visit Our Store</p>
                  <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                    123, Heritage Lane,<br />
                    T Nagar, Chennai - 600017,<br />
                    Tamil Nadu, India
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-regal-gold text-[28px] mt-0.5">mail</span>
                <div>
                  <p className="font-body-md text-body-md text-charcoal-text font-medium">Email Us</p>
                  <Link to={`mailto:${storeEmail}`} className="font-body-md text-body-md text-deep-emerald hover:text-regal-gold transition-colors mt-1 inline-block">
                    {loadingSettings ? 'Loading...' : storeEmail || '—'}
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-regal-gold text-[28px] mt-0.5">call</span>
                <div>
                  <p className="font-body-md text-body-md text-charcoal-text font-medium">WhatsApp</p>
                  {storePhone ? (
                    <Link
                      to={getWhatsAppLink()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-body-md text-body-md text-deep-emerald hover:text-regal-gold transition-colors mt-1 inline-flex items-center gap-2"
                    >
                      {storePhone}
                    </Link>
                  ) : (
                    <span className="font-body-md text-body-md text-on-surface-variant mt-1">
                      {loadingSettings ? 'Loading...' : '—'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-regal-gold text-[28px] mt-0.5">photo_camera</span>
                <div>
                  <p className="font-body-md text-body-md text-charcoal-text font-medium">Follow Us</p>
                  <Link
                    to="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-2 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-[18px]">photo_camera</span>
                    @jkrjewellery
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Message Form Column */}
        <div className="bg-surface-white border border-outline-variant/30 rounded-xl shadow-sm p-6 md:p-8">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6">Send Us a Message</h2>
          {submitted ? (
            <div className="text-center py-10">
              <span className="material-symbols-outlined text-[48px] text-deep-emerald mb-4 block">check_circle</span>
              <p className="font-body-md text-body-md text-charcoal-text mb-2">Thank you for reaching out!</p>
              <p className="font-body-md text-body-md text-on-surface-variant">We will get back to you within 24 hours.</p>
              <button
                onClick={() => setSubmitted(false)}
                className="mt-6 text-deep-emerald hover:text-regal-gold transition-colors font-label-caps uppercase tracking-widest text-xs"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {submitError && (
                <div className="p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                  {submitError}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block font-label-caps text-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">
                  Customer Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors"
                  placeholder="Your full name"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="email" className="block font-label-caps text-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">
                  Customer Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors"
                  placeholder="you@example.com"
                  disabled={submitting}
                />
              </div>

              <div>
                <label htmlFor="message" className="block font-label-caps text-label-caps text-[11px] text-on-surface-variant uppercase tracking-wider mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  rows="6"
                  value={form.message}
                  onChange={(e) => setForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-none px-4 py-3 font-body-md text-body-md text-charcoal-text placeholder:text-outline-variant focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:border-deep-emerald transition-colors resize-y"
                  placeholder="Tell us how we can help..."
                  disabled={submitting}
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-deep-emerald text-surface-white py-3.5 rounded font-label-caps text-label-caps uppercase tracking-widest hover:bg-regal-gold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></span>
                    Sending...
                  </>
                ) : (
                  'Send Message'
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
