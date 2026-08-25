import { Link } from 'react-router-dom'

export default function OrderConfirmation() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 md:py-[120px]">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-24 h-24 mx-auto bg-deep-emerald/10 rounded-full flex items-center justify-center mb-8">
          <span className="material-symbols-outlined text-5xl text-deep-emerald" data-icon="check_circle" data-weight="fill" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
        </div>
        <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">Order Placed Successfully!</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-8">
          Thank you for your order. Your order has been received and is being processed.
        </p>
        <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6 mb-8 text-left">
          <p className="font-body-md text-body-md text-on-surface-variant mb-2">
            A confirmation email has been sent to your registered email address.
          </p>
          <p className="font-body-md text-body-md text-on-surface-variant">
            You can track your order status in <Link to="/account/orders" className="text-deep-emerald hover:text-regal-gold font-medium">My Orders</Link>.
          </p>
        </div>
        <Link
          to="/shop"
          className="inline-flex items-center justify-center gap-2 bg-deep-emerald text-surface-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
        >
          Continue Shopping
          <span className="material-symbols-outlined text-sm">arrow_forward</span>
        </Link>
      </div>
    </main>
  );
}
