import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { productAPI } from '../../services/api'

const tabs = [
  { id: 'all', label: 'All Products' },
  { id: 'bestsellers', label: 'Best Sellers' },
  { id: 'new', label: 'New Arrivals' },
  { id: 'sale', label: 'SALE' },
]

export default function FeaturedProducts() {
  const [activeTab, setActiveTab] = useState('all')
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { addToCart } = useCart()

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productAPI.getAll();
        if (response.data.success) {
          const transformed = response.data.data.map(productAPI.transform);
          setProducts(transformed);
        }
      } catch (err) {
        console.error('Failed to fetch products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      switch (activeTab) {
        case 'bestsellers':
          return product.isBestSeller
        case 'new':
          return product.isNew
        case 'sale':
          return product.originalPrice
        default:
          return true
      }
    })
    return filtered
  }, [products, activeTab])

  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products.slice(0, 4)

  const getProductDisplayPrice = (product) => {
    const price = product.price || 0;
    return `₹ ${price.toLocaleString('en-IN')}`;
  }

  const handleAddToCart = (product) => {
    addToCart(product, 1)
  }

  const handleWishlist = async (product, e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate('/account/wishlist')
  }

  const handleViewProduct = (product) => {
    navigate(`/product/${product.id}`)
  }

  return (
    <section className="w-full bg-surface-white py-16 md:py-24">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-deep-emerald mb-2">
            Featured Products
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
            Handpicked selections of our most cherished pieces, crafted with exceptional care and timeless elegance.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center mb-10">
  <div className="inline-flex items-center bg-surface-container-low rounded-full p-1.5 border border-outline-variant/30">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={`relative px-6 py-2.5 text-sm font-label-caps text-label-caps transition-all duration-200 rounded-full ${
          activeTab === tab.id
            ? 'bg-deep-emerald text-surface-container-highest shadow-md'
            : 'text-charcoal-text hover:text-deep-emerald'
        }`}
      >
        {activeTab === tab.id && (
          <span className="absolute inset-0 rounded-full bg-deep-emerald/10"></span>
        )}

        <span className="relative z-10">
          {tab.label}
        </span>
      </button>
    ))}
  </div>
</div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {displayProducts.map((product) => (
            <div key={product.id} className="bg-surface-white border border-outline-variant/30 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
              {/* Badge */}
              <div className="relative aspect-square bg-surface-container-low flex items-center justify-center p-6">
                <img
                  className="w-full h-full object-contain img-hover-zoom"
                  alt={product.description}
                  src={product.image}
                />
                {product.discount && (
                  <span className="absolute top-3 left-3 bg-deep-emerald text-surface-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    {product.discount}
                  </span>
                )}
                {product.isNew && (
                  <span className="absolute top-3 left-3 bg-charcoal-text text-surface-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                    NEW
                  </span>
                )}
                {/* Wishlist */}
                 <button
                   className="absolute top-3 right-3 w-8 h-8 rounded-full bg-surface-white/80 backdrop-blur flex items-center justify-center text-on-surface-variant hover:text-error transition-colors shadow-sm opacity-0 group-hover:opacity-100"
                   onClick={(e) => handleWishlist(product, e)}
                   title="Add to Wishlist"
                 >
                  <span className="material-symbols-outlined text-sm">favorite</span>
                </button>
              </div>

              {/* Brand */}
              <div className="text-center px-4 py-2">
                <span className="font-label-caps text-label-caps text-xs text-on-surface-variant/70 uppercase tracking-wider">
                  CaratLane
                </span>
              </div>

              {/* Product Info */}
              <div className="px-4 pb-4 flex flex-col text-center">
                <h3 className="font-body-md text-sm text-charcoal-text mb-2 truncate group-hover:text-deep-emerald transition-colors">
                  {product.name}
                </h3>

                {/* Pricing */}
                <div className="mb-4">
                  <span className="font-headline-md text-lg text-deep-emerald">
                    {getProductDisplayPrice(product)}
                  </span>
                  {product.originalPrice && (
                    <span className="ml-2 text-xs text-on-surface-variant line-through">
                      ₹ {product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  className="w-full bg-deep-emerald text-surface-white py-3.5 rounded font-label-caps text-label-caps uppercase tracking-wider hover:bg-regal-gold transition-colors flex items-center justify-center gap-2 shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">shopping_bag</span>
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="mt-16 flex justify-center">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-deep-emerald text-deep-emerald px-10 py-4 font-label-caps text-label-caps uppercase tracking-wider rounded-full hover:bg-deep-emerald hover:text-surface-white transition-all duration-200 shadow-sm hover:shadow-md"
          >
            View All Products
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
