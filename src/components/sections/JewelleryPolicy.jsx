import { useState } from 'react'

const DEFAULT_POLICY_SECTIONS = [
  {
    id: 'returns',
    title: 'Returns',
    icon: 'assignment_return',
    content: 'Returns are not available for purchased products. Please review your order carefully before making a purchase.',
  },
  {
    id: 'exchange',
    title: 'Exchange',
    icon: 'swap_horiz',
    content: 'Product exchanges are not available. Please ensure that you select the correct product before confirming your order.',
  },
  {
    id: 'shipping',
    title: 'Shipping',
    icon: 'local_shipping',
    content: 'We provide delivery across India. Delivery timelines may vary depending on your location and order details. Please ensure that your shipping address and contact information are accurate when placing your order.',
  },
  {
    id: 'care',
    title: 'Jewellery Care',
    icon: 'clean_hands',
    content: 'To care for your covering and antique jewellery, keep it away from water, moisture, perfumes, lotions, and chemicals. Remove jewellery before bathing, swimming, or exercising. Store each piece separately in a dry, soft pouch or jewellery box. Clean gently with a soft, dry cloth and avoid excessive rubbing or rough handling.',
  },
]

export default function JewelleryPolicy() {
  const [expandedId, setExpandedId] = useState(null)

  const sections = DEFAULT_POLICY_SECTIONS
  const sectionTitle = 'Our Jewellery Policy'
  const sectionDescription = 'Your satisfaction and trust are our priority. We stand behind the quality and craftsmanship of every piece we create.'

  const toggleSection = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

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
          {sections.map((section) => {
            const isOpen = expandedId === section.id
            return (
              <div key={section.id} className="flex gap-4">
                <div className="flex-shrink-0">
                  <span className="material-symbols-outlined text-3xl text-regal-gold">
                    {section.icon || 'check_circle'}
                  </span>
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="flex items-center justify-between w-full text-left"
                  >
                    <h3 className="font-headline-md text-lg text-deep-emerald mb-2">
                      {section.title}
                    </h3>
                    <span className="material-symbols-outlined text-on-surface-variant transition-transform">
                      {isOpen ? 'expand_less' : 'expand_more'}
                    </span>
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed pt-2">
                      {section.content}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
