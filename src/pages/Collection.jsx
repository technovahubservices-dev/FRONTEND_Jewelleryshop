import { useState, useEffect, useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { productAPI } from '../services/api'

const COLLECTION_MAP = {
  'premium-bride': { type: 'collection', value: 'Premium Bride', title: 'Premium Bride Collection' },
  'accessories': { type: 'category', value: 'Accessories', title: 'Accessories Collection' },
  'hair-accessories': { type: 'subcategory', category: 'Accessories', value: 'Hair Accessories', title: 'Hair Accessories' },
  'anklets': { type: 'subcategory', category: 'Accessories', value: 'Anklets', title: 'Anklets' },
  'kumkum-box': { type: 'subcategory', category: 'Accessories', value: 'Kumkum Box', title: 'Kumkum Box' },
  'bindi': { type: 'subcategory', category: 'Accessories', value: 'Bindi', title: 'Bindi' },
}

export default function Collection() {
  const { slug } = useParams()
  const collection = COLLECTION_MAP[slug] || null

  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!collection) {
      setError('Collection not found')
      setLoading(false)
      return
    }

    let cancelled = false
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError('')
        const params = { limit: 200 }

        if (collection.type === 'collection') {
          params.jewelleryCollection = collection.value
        } else if (collection.type === 'category') {
          params.category = collection.value
        } else if (collection.type === 'subcategory') {
          params.category = collection.category
          params.subcategory = collection.value
        }

        const response = await productAPI.getAll(params)
        if (cancelled) return
        if (response.data.success) {
          const transformed = response.data.data.map(productAPI.transform)
          setProducts(transformed)
        } else {
          setProducts([])
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to fetch collection products:', err)
          setError('Failed to load products. Please try again.')
          setProducts([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchProducts()

    return () => { cancelled = true }
  }, [collection])

  const title = collection ? collection.title : 'Collection'

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-[120px]">
      {loading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">inventory_2</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading products...</p>
        </div>
      ) : error ? (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded text-sm">
          {error}
        </div>
      ) : (
        <>
          <div className="mb-12">
            <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
              <Link className="hover:text-primary transition-colors" to="/">Home</Link>
              <span>/</span>
              <span className="text-charcoal-text font-semibold">{title}</span>
            </nav>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-outline-variant pb-6">
              <div>
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald">
                  {title}
                </h1>
                <p className="text-on-surface-variant mt-2 max-w-2xl">
                  {collection?.type === 'subcategory'
                    ? `Explore our ${title.toLowerCase()} in the ${collection.category.toLowerCase()} collection.`
                    : `Browse our handpicked ${title.toLowerCase()}, crafted with timeless elegance.`}
                </p>
              </div>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-outline-variant rounded-lg">
              <span className="material-symbols-outlined text-[64px] text-on-surface-variant/40 mb-4 block">search_off</span>
              <h3 className="font-headline-md text-headline-md text-charcoal-text mb-2">
                No products found
              </h3>
              <p className="text-on-surface-variant mb-6 max-w-md mx-auto">
                We could not find any products in this collection yet. Please check back soon.
              </p>
              <Link
                to="/shop"
                className="inline-flex items-center gap-2 px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps uppercase tracking-wider rounded hover:bg-primary-container active:scale-95 transition-all"
              >
                Browse All Products
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link key={product.id} to={`/product/${product.id}`} className="group block">
                  <div className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                    <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
                      <img
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700 ease-out"
                        alt={product.description}
                        src={product.image}
                        onError={(e) => {
                          e.target.src = 'https://placehold.co/400x400?text=No+Image'
                        }}
                      />
                    </div>
                    <div className="text-center px-4 py-2">
                      <span className="font-label-caps text-label-caps text-xs text-on-surface-variant/70 uppercase tracking-wider">
                        JKR
                      </span>
                    </div>
                    <div className="px-4 pb-4 flex flex-col text-center">
                      <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                        {product.name}
                      </h3>
                      <div className="mb-4">
                        <span className="font-headline-md text-lg text-deep-emerald">
                          ₹ {product.price.toLocaleString('en-IN')}
                        </span>
                        {product.originalPrice && (
                          <span className="ml-2 text-xs text-on-surface-variant line-through">
                            ₹ {product.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          className="flex-1 border border-deep-emerald text-deep-emerald bg-transparent px-4 py-2.5 text-xs font-label-caps text-label-caps uppercase tracking-wider hover:bg-deep-emerald hover:text-surface-white transition-colors duration-200 rounded text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  )
}
