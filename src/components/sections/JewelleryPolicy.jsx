import { useState, useEffect } from 'react'
import { contentAPI } from '../../services/api'

const DEFAULT_POLICY_SECTIONS = [
  {
    id: 'authenticity',
    title: 'Authenticity & Certification',
    icon: 'verified',
    content: 'Every piece in our collection comes with a certificate of authenticity and is hallmarked for guaranteed purity. We source our diamonds and precious metals from conflict-free, ethically certified suppliers.',
  },
  {
    id: 'purity',
    title: 'Gold Purity',
    icon: 'diamond',
    content: 'All our gold jewellery is crafted using hallmarked gold of certified purity — 22K, 18K, and 14K gold with HGE (High Gold Electroplated) finishing options. Each piece is stamped with its purity grade.',
  },
  {
    id: 'returns',
    title: 'Returns',
    icon: 'assignment_return',
    content: 'We offer a 15-day return window from the date of delivery. Products must be in their original packaging with all tags attached and in resalable condition.',
  },
  {
    id: 'exchange',
    title: 'Exchange',
    icon: 'swap_horiz',
    content: 'Enjoy a hassle-free exchange within 30 days of purchase. Simply return the item in its original condition and choose your preferred replacement from our collection.',
  },
  {
    id: 'warranty',
    title: 'Warranty',
    icon: 'shield',
    content: 'All jewellery comes with a 1-year manufacturer warranty covering manufacturing defects. The warranty does not cover damage from normal wear, misuse, or accidental damage.',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    icon: 'local_shipping',
    content: 'We offer free insured shipping on all orders above ₹4,999 across India. Delivery typically takes 3–7 business days. All packages are fully insured and tracked.',
  },
  {
    id: 'care',
    title: 'Jewellery Care',
    icon: 'clean_hands',
    content: 'To preserve your jewellery\'s brilliance: store separately in a soft pouch, avoid exposure to perfumes and lotions, clean gently with a soft cloth, and have it professionally serviced annually.',
  },
]

export default function JewelleryPolicy() {
  const [policyContent, setPolicyContent] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPolicy = async () => {
      try {
        const response = await contentAPI.getActive('storePolicy')
        if (response.data?.success && response.data.data) {
          setPolicyContent(response.data.data)
        }
      } catch (err) {
        // Silently fall back to defaults
      } finally {
        setLoading(false)
      }
    }
    fetchPolicy()
  }, [])

  const sections = policyContent?.sections || DEFAULT_POLICY_SECTIONS
  const sectionTitle = policyContent?.title || 'Our Jewellery Policy'
  const sectionDescription = policyContent?.description || 'Your satisfaction and trust are our priority. We stand behind the quality and craftsmanship of every piece we create.'

  return (
    <section className="mb-24">
      <div className="text-center mb-12">
        <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">
          {sectionTitle}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
          {sectionDescription}
        </p>
      </div>

      <div className="bg-surface-white border border-outline-variant/30 rounded-2xl shadow-sm p-6 md:p-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {sections.map((section) => (
            <div key={section.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <span className="material-symbols-outlined text-3xl text-regal-gold">
                  {section.icon || 'check_circle'}
                </span>
              </div>
              <div>
                <h3 className="font-headline-md text-lg text-deep-emerald mb-2">
                  {section.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {section.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
