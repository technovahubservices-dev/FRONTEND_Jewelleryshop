import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Payment() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const orderId = searchParams.get('orderId')
  const paymentMethod = searchParams.get('method') || 'card'

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment?orderId=${orderId}&method=${paymentMethod}` } })
      return
    }

    if (!orderId) {
      setError('Order ID is missing')
      setLoading(false)
      return
    }

    loadRazorpayScript()
  }, [orderId, paymentMethod, isAuthenticated, navigate])

  const loadRazorpayScript = () => {
    if (document.getElementById('razorpay-script')) {
      setScriptLoaded(true)
      initiatePayment()
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => {
      setScriptLoaded(true)
      initiatePayment()
    }
    script.onerror = () => {
      setError('Failed to load payment gateway. Please check your internet connection.')
      setLoading(false)
    }
    document.body.appendChild(script)
  }

  const initiatePayment = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await orderAPI.createPaymentOrder({
        orderId,
        paymentMethod,
        gateway: 'razorpay',
      })

      if (response.data.success) {
        openRazorpay(response.data.data)
      } else {
        setError(response.data.message || 'Failed to initiate payment')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initiate payment')
    } finally {
      setLoading(false)
    }
  }

  const openRazorpay = (paymentData) => {
    const options = {
      key: paymentData.key,
      amount: paymentData.amount,
      currency: paymentData.currency,
      name: 'JS Shop',
      description: `Payment for order ${paymentData.orderId}`,
      order_id: paymentData.gatewayOrderId,
      prefill: {
        name: paymentData.prefill.name,
        email: paymentData.prefill.email,
        contact: paymentData.prefill.contact,
      },
      handler: handlePaymentSuccess,
      modal: {
        ondismiss: handlePaymentDismissed,
      },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  const handlePaymentSuccess = async (response) => {
    setProcessing(true)
    setError('')
    try {
      const verifyResponse = await orderAPI.verifyPayment({
        orderId,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      })

      if (verifyResponse.data.success) {
        navigate('/order-confirmation', {
          state: {
            orderId: verifyResponse.data.data._id,
            paymentStatus: 'paid',
          },
        })
      } else {
        setError(verifyResponse.data.message || 'Payment verification failed')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment verification failed')
    } finally {
      setProcessing(false)
    }
  }

  const handlePaymentDismissed = () => {
    navigate('/checkout', {
      state: {
        error: 'Payment was cancelled. You can retry or choose a different payment method.',
        orderId,
      },
    })
  }

  const handleRetry = () => {
    setError('')
    initiatePayment()
  }

  if (loading) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Initializing payment...
          </p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="max-w-md mx-auto text-center p-8">
          <span className="material-symbols-outlined text-[48px] text-error mb-4 block">
            error
          </span>
          <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">
            Payment Failed
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            {error}
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleRetry}
              disabled={processing}
              className="px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50"
            >
              {processing ? 'Processing...' : 'Retry Payment'}
            </button>
            <Link
              to="/checkout"
              className="px-6 py-3 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
            >
              Back to Checkout
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block animate-spin">
          progress_activity
        </span>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Processing payment...
        </p>
      </div>
    </main>
  )
}
