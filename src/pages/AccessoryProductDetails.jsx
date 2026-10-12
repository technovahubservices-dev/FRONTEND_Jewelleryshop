import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { accessoryProductAPI } from '../services/api'
import { useCart } from '../context/CartContext'
import { resolveImageUrl } from '../utils/apiUrl'
import { isAccessoryActive, transformAccessoryProduct } from '../utils/accessoryProducts'

export default function AccessoryProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addItem } = useCart()
  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await accessoryProductAPI.getById(id)
        if (!response.data?.success || !response.data.data) {
          throw new Error(response.data?.message || 'Accessory product not found')
        }
        setProduct(transformAccessoryProduct(response.data.data))
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch accessory product')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const images = useMemo(() => {
    if (!product) return []
    return product.images.length ? product.images : [product.image].filter(Boolean)
  }, [product])

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 animate-spin">progress_activity</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading product...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <h2 className="font-headline-lg text-headline-lg text-deep-emerald mb-4">Product Not Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">{error || "We couldn't find this accessory product."}</p>
          <button onClick={() => navigate('/accessories')} className="bg-deep-emerald text-white px-8 py-4 font-label-caps text-label-caps rounded hover:bg-primary transition-colors">
            Browse Accessories
          </button>
        </div>
      </main>
    )
  }

  const canBuy = product.isAvailable && isAccessoryActive(product.raw)
  const displayImage = images[activeImage] || product.image || 'https://placehold.co/700x850?text=No+Image'
  const attributeEntries = Object.entries(product.attributes || {}).filter(([, value]) => value)

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      <nav aria-label="Breadcrumb" className="flex text-sm text-on-surface-variant mb-8 font-body-md">
        <ol className="inline-flex items-center space-x-1 md:space-x-3">
          <li><Link className="hover:text-primary transition-colors" to="/">Home</Link></li>
          <li className="flex items-center">
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <Link className="hover:text-primary transition-colors" to="/accessories">Accessories</Link>
          </li>
          <li className="flex items-center">
            <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
            <span className="text-primary font-medium">{product.name}</span>
          </li>
        </ol>
      </nav>

      {successMessage && (
        <div className="mb-6 p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter mb-20">
        <div className="md:col-span-7">
          <div className="bg-surface-container-low border border-outline-variant/30 rounded-lg overflow-hidden aspect-[4/5]">
            <img
              src={resolveImageUrl(displayImage)}
              alt={product.name}
              className="w-full h-full object-cover"
              onError={(event) => {
                event.currentTarget.src = 'https://placehold.co/700x850?text=No+Image'
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-3 mt-4">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(index)} className={`aspect-square rounded border overflow-hidden ${activeImage === index ? 'border-deep-emerald border-2' : 'border-outline-variant'}`}>
                  <img src={resolveImageUrl(image)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-5 flex flex-col justify-center px-2 md:px-6">
          <div className="mb-2">
            <span className="text-xs font-label-caps tracking-widest text-on-surface-variant uppercase">{product.category || 'Accessory'}</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-primary mb-4">{product.name}</h1>
          {product.brand && <p className="font-body-md text-body-md text-on-surface-variant mb-6">Brand: {product.brand}</p>}

          <div className="mb-8 pb-6 border-b border-outline-variant/30">
            <p className="text-3xl font-headline-md text-primary">Rs. {product.price.toLocaleString('en-IN')}</p>
            <p className="text-xs text-on-surface-variant mt-1">Inclusive of all taxes</p>
            <p className={`text-sm mt-3 ${canBuy ? 'text-deep-emerald' : 'text-error'}`}>
              {canBuy ? `${product.stock} available` : 'Currently unavailable'}
            </p>
          </div>

          <div className="mb-8">
            <label className="font-body-md font-semibold text-primary">Quantity</label>
            <div className="flex items-center gap-2 mt-3">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-9 h-9 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald">
                <span className="material-symbols-outlined text-[16px]">remove</span>
              </button>
              <span className="w-12 text-center font-body-md text-body-md text-primary">{quantity}</span>
              <button type="button" onClick={() => setQuantity(quantity + 1)} disabled={product.stock > 0 && quantity >= product.stock} className="w-9 h-9 rounded border border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-deep-emerald hover:text-deep-emerald disabled:opacity-40">
                <span className="material-symbols-outlined text-[16px]">add</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-4 mb-8">
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => {
                addItem({ ...product, id: `accessory:${product.id}` }, quantity)
                setSuccessMessage(`Added ${quantity} ${quantity === 1 ? 'item' : 'items'} to cart`)
                setTimeout(() => setSuccessMessage(''), 3000)
              }}
              className="w-full bg-regal-gold text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-regal-gold/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">shopping_cart</span>
              Add to Cart
            </button>
            <button
              type="button"
              disabled={!canBuy}
              onClick={() => {
                addItem({ ...product, id: `accessory:${product.id}` }, quantity)
                navigate('/checkout')
              }}
              className="w-full bg-deep-emerald text-surface-white py-4 rounded-lg font-label-caps text-label-caps uppercase hover:bg-deep-emerald/90 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">flash_on</span>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="font-headline-md text-headline-md text-primary text-center mb-8">Product Details</h2>
        <div className="bg-surface-white/60 border border-outline-variant/30 rounded-lg p-6 md:p-10 max-w-4xl mx-auto">
          <p className="font-body-lg text-body-lg text-on-surface-variant mb-8 text-center leading-relaxed">
            {product.description || 'No description available.'}
          </p>
          {attributeEntries.length > 0 && (
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {attributeEntries.map(([key, value]) => (
                <div key={key} className="flex justify-between gap-4 border-b border-outline-variant/30 pb-2">
                  <dt className="capitalize text-on-surface-variant">{key.replace(/([A-Z])/g, ' $1')}</dt>
                  <dd className="font-medium text-primary">{value}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
    </main>
  )
}
