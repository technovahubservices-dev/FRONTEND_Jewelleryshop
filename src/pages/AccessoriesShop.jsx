import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { accessoryAPI, accessoryProductAPI } from '../services/api'
import { getAccessoryImage, getCategorySlug, getRecordId, isAccessoryActive, transformAccessoryProduct } from '../utils/accessoryProducts'
import { resolveImageUrl } from '../utils/apiUrl'

export default function AccessoriesShop() {
  const { categorySlug } = useParams()
  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(false)
  const [error, setError] = useState('')

  const selectedCategory = useMemo(() => {
    if (!categorySlug) return null
    return categories.find((category) => getCategorySlug(category) === categorySlug) || null
  }, [categories, categorySlug])

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await accessoryAPI.getAll()
        if (!response.data?.success || !Array.isArray(response.data.data)) {
          throw new Error(response.data?.message || 'Failed to fetch accessory categories')
        }
        setCategories(response.data.data.filter((category) => category.isActive !== false))
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch accessory categories')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([])
      return
    }

    const fetchProducts = async () => {
      setProductsLoading(true)
      setError('')
      try {
        const categoryId = getRecordId(selectedCategory)
        const response = await accessoryProductAPI.getAll({
          category: categoryId,
          categoryId,
          status: 'active',
          limit: 100,
        })
        if (!response.data?.success || !Array.isArray(response.data.data)) {
          throw new Error(response.data?.message || 'Failed to fetch accessory products')
        }
        setProducts(response.data.data.map(transformAccessoryProduct).filter(isAccessoryActive))
      } catch (err) {
        setProducts([])
        setError(err.response?.data?.message || err.message || 'Failed to fetch accessory products')
      } finally {
        setProductsLoading(false)
      }
    }

    fetchProducts()
  }, [selectedCategory])

  if (loading) {
    return (
      <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 animate-spin">progress_activity</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading accessories...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-8 md:py-16">
      <nav className="flex text-sm text-on-surface-variant mb-4 space-x-2">
        <Link className="hover:text-primary transition-colors" to="/">Home</Link>
        <span>/</span>
        <Link className="hover:text-primary transition-colors" to="/accessories">Accessories</Link>
        {selectedCategory && (
          <>
            <span>/</span>
            <span className="text-charcoal-text font-semibold">{selectedCategory.name}</span>
          </>
        )}
      </nav>

      <div className="mb-10 border-b border-outline-variant pb-6">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald">
          {selectedCategory ? selectedCategory.name : 'Accessories'}
        </h1>
        <p className="text-on-surface-variant mt-2 max-w-2xl">
          {selectedCategory?.description || 'Browse curated accessories by category and discover the latest available products.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
          {error}
        </div>
      )}

      {!selectedCategory ? (
        categories.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">category</span>
            <h2 className="font-headline-md text-headline-md text-deep-emerald mb-3">No Accessories Available</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Active accessory categories will appear here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
            {categories.map((category) => (
              <Link key={getRecordId(category)} to={`/accessories/${getCategorySlug(category)}`} className="group block border border-outline-variant/40 rounded-lg overflow-hidden bg-surface-white shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-[4/5] bg-surface-container-low overflow-hidden">
                  <img
                    src={resolveImageUrl(category.image || getAccessoryImage(category, 'https://placehold.co/600x750?text=Accessories'))}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/600x750?text=Accessories'
                    }}
                  />
                </div>
                <div className="p-4 text-center">
                  <h2 className="font-headline-md text-lg text-deep-emerald">{category.name}</h2>
                  <p className="text-xs text-on-surface-variant mt-2 line-clamp-2">{category.description || 'Explore collection'}</p>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : productsLoading ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 animate-spin">progress_activity</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Loading products...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4">inventory_2</span>
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-3">No Products Found</h2>
          <p className="font-body-md text-body-md text-on-surface-variant">Products added by admin will appear here after they are active.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {products.map((product) => (
            <Link key={product.id} to={`/accessory-product/${product.id}`} className="group block w-full">
              <div className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                <div className="relative aspect-[4/5] w-full overflow-hidden bg-surface-container-low">
                  <img
                    className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
                    alt={product.name}
                    src={resolveImageUrl(product.image || 'https://placehold.co/400x600?text=No+Image')}
                    onError={(event) => {
                      event.currentTarget.src = 'https://placehold.co/400x600?text=No+Image'
                    }}
                    loading="lazy"
                  />
                  {!product.isAvailable && (
                    <span className="absolute top-3 left-3 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-label-caps bg-error text-surface-white">Unavailable</span>
                  )}
                </div>
                <div className="px-4 py-4 text-center">
                  <span className="font-label-caps text-[10px] text-on-surface-variant/70 uppercase tracking-wider">{product.brand || 'JKR'}</span>
                  <h3 className="font-body-md text-sm text-charcoal-text mt-2 mb-2 truncate group-hover:text-deep-emerald transition-colors">{product.name}</h3>
                  <p className="font-headline-md text-lg text-deep-emerald">Rs. {product.price.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-on-surface-variant mt-1">{product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}
