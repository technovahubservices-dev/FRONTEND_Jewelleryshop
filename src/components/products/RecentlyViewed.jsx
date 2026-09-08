import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { productAPI } from '../../services/api'
import ProductCard from './ProductCard'

const MAX_RECENTLY_VIEWED = 10
const STORAGE_KEY = 'jkr_recently_viewed'

export const trackProductView = (productId) => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    let ids = stored ? JSON.parse(stored) : []
    if (!Array.isArray(ids)) ids = []

    ids = ids.filter((id) => id !== productId)
    ids.unshift(productId)
    ids = ids.slice(0, MAX_RECENTLY_VIEWED)

    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids))
  } catch {
    // ignore
  }
}

const getRecentlyViewedIds = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    const ids = stored ? JSON.parse(stored) : []
    return Array.isArray(ids) ? ids : []
  } catch {
    return []
  }
}

export default function RecentlyViewed({ currentProductId }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const viewedIds = getRecentlyViewedIds().filter((id) => id !== currentProductId)
    if (viewedIds.length === 0) {
      setLoading(false)
      return
    }

    const fetchProducts = async () => {
      setLoading(true)
      try {
        const results = await Promise.allSettled(
          viewedIds.map((id) => productAPI.getById(id))
        )
        const transformed = results
          .filter((r) => r.status === 'fulfilled' && r.value?.data?.success)
          .map((r) => productAPI.transform(r.value.data.data))
          .filter(Boolean)
        setProducts(transformed)
      } catch {
        setProducts([])
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [currentProductId])

  if (loading || products.length === 0) {
    return null
  }

  return (
    <div className="mb-24">
      <div className="flex justify-between items-end mb-8">
        <h2 className="font-headline-md text-headline-md text-primary">
          Recently Viewed
        </h2>
        <Link
          to="/shop"
          className="text-sm font-label-caps uppercase text-surface-tint hover:text-primary transition-colors flex items-center gap-1 border-b border-transparent hover:border-primary"
        >
          View All
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}
