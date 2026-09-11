import { useEffect, useState } from 'react'
import { storeAPI } from '../services/api'

export default function WhatsAppButton() {
  const [phoneNumber, setPhoneNumber] = useState('')

  useEffect(() => {
    const fetchPhoneNumber = async () => {
      try {
        const response = await storeAPI.getSettings()

        const data = response.data?.data || response.data || {}

        const phone = String(data.phone || '')

        // Remove +, spaces, -, brackets
        const formattedPhone = phone.replace(/\D/g, '')

        setPhoneNumber(formattedPhone)
      } catch (error) {
        console.error('Failed to load WhatsApp number:', error)
      }
    }

    fetchPhoneNumber()
  }, [])

  const handleWhatsAppClick = () => {
    if (!phoneNumber) {
      alert('WhatsApp number is not available')
      return
    }

    const message = encodeURIComponent(
      'Hi, I would like to know more about your products.'
    )

    window.open(
      `https://wa.me/${phoneNumber}?text=${message}`,
      '_blank',
      'noopener,noreferrer'
    )
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
        z-[9999]
        w-14
        h-14
        rounded-full
        bg-[#25D366]
        text-white
        shadow-xl
        flex
        items-center
        justify-center
        transition-transform
        duration-300
        hover:scale-110
        cursor-pointer
      "
    >
      <i className="fa-brands fa-whatsapp text-3xl"></i>
    </button>
  )
}