import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { orderAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Payment() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const { isAuthenticated } = useAuth()
  const { clearCart } = useCart()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [processing, setProcessing] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('unknown')
  const startLock = useRef(false)
  const verificationLock = useRef(false)

  const orderId = searchParams.get('orderId')
  const paymentMethod = searchParams.get('method') || 'card'
  const checkoutKey = location.state?.checkoutKey

  const loadPaymentStatus = useCallback(async () => {
    if (!orderId) {
      setError('Order ID is missing')
      setPaymentStatus('unknown')
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const response = await orderAPI.getPaymentStatus(orderId)
      const status = response.data?.data?.paymentStatus || 'unknown'

      if (status === 'paid') {
        clearCart()
        sessionStorage.removeItem('jkr_checkout_idempotency')
        navigate('/order-confirmation', {
          replace: true,
          state: { orderId: response.data.data.orderId || orderId, paymentStatus: 'paid' },
        })
        return
      }

      setPaymentStatus(status)
      if (status === 'unknown') {
        setError(response.data?.message || 'Payment status is not confirmed yet. Your cart is still saved.')
      } else if (status !== 'failed') {
        setError('')
      }
    } catch (err) {
      setPaymentStatus('unknown')
      setError(err.response?.data?.message || 'Payment status could not be confirmed. Your cart is still saved.')
    } finally {
      setLoading(false)
    }
  }, [clearCart, navigate, orderId])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/payment?orderId=${orderId}&method=${paymentMethod}` } })
      return
    }
    loadPaymentStatus()
  }, [isAuthenticated, loadPaymentStatus, navigate, orderId, paymentMethod])

  const handlePaymentSuccess = async (response) => {
    if (verificationLock.current) return
    verificationLock.current = true
    setProcessing(true)
    setError('')
    try {
      const verifyResponse = await orderAPI.verifyPayment({
        orderId,
        paymentId: response.razorpay_payment_id,
        signature: response.razorpay_signature,
      })

      if (
        verifyResponse.data.success &&
        (verifyResponse.data.data?.isPaid || verifyResponse.data.data?.paymentStatus === 'paid')
      ) {
        clearCart()
        sessionStorage.removeItem('jkr_checkout_idempotency')
        navigate('/order-confirmation', {
          replace: true,
          state: { orderId: verifyResponse.data.data._id, paymentStatus: 'paid' },
        })
      } else {
        setError(verifyResponse.data.message || 'Payment verification is pending. Your cart is still saved.')
        await loadPaymentStatus()
      }
    } catch (err) {
      await loadPaymentStatus()
      setError(err.response?.data?.message || 'Payment verification is pending. Your cart is still saved.')
    } finally {
      verificationLock.current = false
      setProcessing(false)
    }
  }

  const handlePaymentDismissed = () => {
    navigate('/checkout', {
      replace: true,
      state: {
        paymentCancelled: true,
        error: 'Payment was cancelled. Your cart is saved; check the payment status before trying again.',
        orderId,
        paymentMethod,
        checkoutKey,
      },
    })
  }

  const loadRazorpay = () => new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    const existingScript = document.getElementById('razorpay-script')
    if (existingScript) {
      existingScript.addEventListener('load', resolve, { once: true })
      existingScript.addEventListener('error', reject, { once: true })
      return
    }

    const script = document.createElement('script')
    script.id = 'razorpay-script'
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.body.appendChild(script)
  })

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
      modal: { ondismiss: handlePaymentDismissed },
    }

    const razorpay = new window.Razorpay(options)
    razorpay.on('payment.failed', async (response) => {
      setError(response.error?.description || 'Payment failed. Checking the payment status…')
      await loadPaymentStatus()
    })
    razorpay.open()
  }

  const startPayment = async () => {
    if (startLock.current || !['not_started', 'failed'].includes(paymentStatus)) return
    startLock.current = true
    setLoading(true)
    setError('')
    try {
      await loadRazorpay()
      const response = paymentStatus === 'failed'
        ? await orderAPI.retryPayment(orderId, { paymentMethod, gateway: 'razorpay' })
        : await orderAPI.createPaymentOrder({ orderId, paymentMethod, gateway: 'razorpay' })

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to initiate payment')
      }
      setPaymentStatus('pending')
      openRazorpay(response.data.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to initiate payment')
      await loadPaymentStatus()
    } finally {
      startLock.current = false
      setLoading(false)
    }
  }

  if (loading || processing) {
    return (
      <main className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block animate-spin">
            progress_activity
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {processing ? 'Verifying payment…' : 'Checking payment status…'}
          </p>
        </div>
      </main>
    )
  }

  const canStartPayment = paymentStatus === 'not_started' || paymentStatus === 'failed'
  const statusMessage = paymentStatus === 'pending'
    ? 'A payment attempt is still being processed. Check the status before starting another attempt.'
    : paymentStatus === 'unknown'
      ? 'We could not confirm the payment status. Please check again before retrying.'
      : paymentStatus === 'failed'
        ? 'The previous payment attempt failed. You can safely retry.'
        : 'Your order is ready. Choose Pay Now when you are ready to open the payment gateway.'

  return (
    <main className="flex-grow flex items-center justify-center min-h-[400px] px-4 py-10">
      <div className="max-w-md w-full mx-auto text-center p-8">
        <span className={`material-symbols-outlined text-[48px] mb-4 block ${paymentStatus === 'failed' ? 'text-error' : 'text-regal-gold'}`}>
          {paymentStatus === 'pending' || paymentStatus === 'unknown' ? 'hourglass_top' : paymentStatus === 'failed' ? 'error' : 'payments'}
        </span>
        <h1 className="font-display-lg text-display-lg text-deep-emerald mb-4">
          {paymentStatus === 'failed' ? 'Payment Failed' : 'Online Payment'}
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-6">
          {error || statusMessage}
        </p>
        <div className="flex flex-col gap-3">
          {canStartPayment ? (
            <button
              type="button"
              onClick={startPayment}
              disabled={loading || processing}
              className="px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors disabled:opacity-50"
            >
              {paymentStatus === 'failed' ? 'Retry Payment' : 'Pay Now'}
            </button>
          ) : (
            <button
              type="button"
              onClick={loadPaymentStatus}
              className="px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
            >
              Check Payment Status
            </button>
          )}
          <Link
            to="/checkout"
            state={{ orderId, paymentMethod, checkoutKey }}
            className="px-6 py-3 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
          >
            Back to Checkout
          </Link>
        </div>
      </div>
    </main>
  )
}
