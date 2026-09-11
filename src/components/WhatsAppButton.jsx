import { useEffect, useState } from 'react'
import { storeAPI } from '../services/api'

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStoreSettings = async () => {
      try {
        const response = await storeAPI.getSettings()

        const data = response.data?.data || response.data || {}

        const phone = String(data.phone || '')

        // Remove spaces, +, -, brackets, etc.
        const formattedPhone = phone.replace(/\D/g, '')

        setPhoneNumber(formattedPhone)
      } catch (error) {
        console.error(
          'Failed to fetch WhatsApp phone number:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    fetchStoreSettings()
  }, [])

  const handleWhatsAppClick = () => {
    if (!phoneNumber) {
      console.error('WhatsApp phone number is not available')
      return
    }

    const message = encodeURIComponent(
      'Hi, I would like to know more about your products.'
    )

    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      '_blank'
    )
  }

  // Don't display the button until the phone number is loaded
  if (loading || !phoneNumber) {
    return null
  }

  return (
    <button
      type="button"
      onClick={handleWhatsAppClick}
      aria-label="Chat with us on WhatsApp"
      title="Chat with us on WhatsApp"
      className="
        fixed
        bottom-6
        right-6
        z-50
        flex
        items-center
        gap-3
        bg-[#25D366]
        text-white
        px-4
        py-3
        rounded-full
        shadow-lg
        transition-all
        duration-300
        hover:scale-105
        hover:shadow-xl
      "
    >
      <i className="fa-brands fa-whatsapp text-2xl"></i>

      <span className="text-sm font-semibold">
        Chat with us
      </span>
    </button>
  )
}