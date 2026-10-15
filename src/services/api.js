import axios from 'axios'
import { getApiBaseUrl } from '../utils/apiUrl'

const API_URL = getApiBaseUrl()

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')

    if (token) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !error.config?.skipAuthRedirect
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      if (
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/account')
      ) {
        window.location.href = '/login'
      }
    }

    return Promise.reject(error)
  }
)

/* =========================
   Authentication
========================= */

export const authAPI = {
  login: (identifier, password) =>
    api.post('/auth/login', { identifier, password }),

  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
}

/* =========================
   Google Drive
========================= */

export const googleDriveAPI = {
  startOAuth: (config) =>
    api.get('/integrations/google-drive', config),

  getStatus: (config) =>
    api.get('/integrations/google-drive/status', config),

  disconnect: (config) =>
    api.post(
      '/integrations/google-drive/disconnect',
      undefined,
      config
    ),
}

/* =========================
   Products
========================= */

export const productAPI = {
  getAll: (params) =>
    api.get('/products', { params }),

  getById: (id) =>
    api.get(`/products/${id}`),

  create: (formData) =>
    api.post('/products', formData),

  update: (id, formData) =>
    api.put(`/products/${id}`, formData),

  checkSku: (sku) =>
    api.get('/products/check-sku', {
      params: { sku },
    }),

  getBySku: (sku) =>
    api.get(`/products/sku/${encodeURIComponent(sku)}`),

  delete: (id) =>
    api.delete(`/products/${id}`),

  transform: (p) => {
    const originalPrice = Number(p?.price)
    const discountPrice = Number(p?.discountPrice)
    const hasValidDiscount = Number.isFinite(originalPrice)
      && originalPrice > 0
      && Number.isFinite(discountPrice)
      && discountPrice > 0
      && discountPrice < originalPrice

    return {
    id: p._id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory || '',
    metal: p.metal || '',
    collection: p.jewelleryCollection || p.collection || '',
    occasion: p.occasion || '',
    bridal: p.bridal || false,
    wedding: p.wedding || false,

    price: hasValidDiscount ? discountPrice : (Number.isFinite(originalPrice) ? originalPrice : 0),

    originalPrice: hasValidDiscount ? originalPrice : null,

    discount:
      hasValidDiscount
        ? `${Math.round(
            ((originalPrice - discountPrice) / originalPrice) * 100
          )}% OFF`
        : null,

    discountAmount:
      hasValidDiscount
        ? Math.round(originalPrice - discountPrice)
        : 0,

    isOnSale: hasValidDiscount,

    image:
      typeof p.primaryImage === 'string'
        ? p.primaryImage
        : p.primaryImage?.url ||
          (Array.isArray(p.images)
            ? typeof p.images[0] === 'string'
              ? p.images[0]
              : p.images[0]?.url
            : '') ||
          'https://placehold.co/400x400',

    images: Array.isArray(p.images)
      ? p.images
          .map((img) =>
            typeof img === 'string'
              ? img
              : img?.url
          )
          .filter(Boolean)
      : [],

    video: p.video || '',
    description: p.description || '',
    fullDescription: p.description || '',

    isNew: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
    stock: (typeof p.stock === 'number' || (typeof p.stock === 'string' && p.stock.trim() !== '')) &&
      Number.isSafeInteger(Number(p.stock))
      ? Number(p.stock)
      : null,

    SKU: p.sku,

    weight: p.weight || '',
    purity: p.purity || '',
    metalColor: p.metal || '',

    diamondWeight: p.diamondWeight || 'N/A',
    diamondShape: p.diamondShape || 'N/A',
    diamondClarity: p.diamondClarity || 'N/A',
    diamondColor: p.diamondColor || 'N/A',

    rating: p.rating || 0,
    reviews: p.reviews || 0,

    status: p.status || 'active',
    tags: p.tags || [],
    slug: p.slug,
    }
  },
}

/* =========================
   Users
========================= */

export const userAPI = {
  getAll: (params) =>
    api.get('/users', { params }),

  getProfile: () =>
    api.get('/users/profile'),

  updateProfile: (data) =>
    api.put('/users/profile', data),

  changePassword: (data) =>
    api.put('/users/password', data),

  getAddresses: () =>
    api.get('/users/addresses'),

  addAddress: (data) =>
    api.post('/users/addresses', data),

  updateAddress: (id, data) =>
    api.put(`/users/addresses/${id}`, data),

  deleteAddress: (id) =>
    api.delete(`/users/addresses/${id}`),

  setDefaultAddress: (id) =>
    api.put(`/users/addresses/${id}/default`),
}

/* =========================
   Orders
========================= */

export const orderAPI = {
  create: (orderData) =>
    api.post('/orders', orderData),

  getAll: (params) =>
    api.get('/orders', { params }),

  getById: (id) =>
    api.get(`/orders/${id}`),

  updateStatus: (id, statusOrData) =>
    api.put(
      `/orders/${id}/status`,
      typeof statusOrData === 'string'
        ? { status: statusOrData }
        : statusOrData
    ),

  delete: (id) =>
    api.delete(`/orders/${id}`),

  convertFromQuotation: (quotationId, data) =>
    api.post(
      `/orders/convert-from-quotation/${quotationId}`,
      data
    ),

  createPaymentOrder: (data) =>
    api.post(
      '/orders/payment/create-payment-order',
      data
    ),

  getPaymentStatus: (id) =>
    api.get(`/orders/payment/status/${id}`),

  verifyPayment: (data) =>
    api.post(
      '/orders/payment/verify-payment',
      data
    ),

  retryPayment: (id, data) =>
    api.post(
      `/orders/payment/${id}/retry-payment`,
      data
    ),

  downloadInvoice: (id) =>
    api.get(`/orders/${id}/invoice`, {
      responseType: 'blob',
    }),

  getViewInvoice: (id) =>
    api.get(`/orders/${id}/invoice`, {
      responseType: 'blob',
    }),
}

export const adminOrderAPI = {
  getAll: (params) =>
    api.get('/admin/orders', { params }),

  getById: (id) =>
    api.get(`/admin/orders/${id}`),

  update: (id, data) =>
    api.put(`/admin/orders/${id}`, data),

  delete: (id) =>
    api.delete(`/admin/orders/${id}`),

  downloadInvoice: (id) =>
    api.get(`/admin/orders/${id}/invoice`, {
      responseType: 'blob',
    }),
}

/* =========================
   Dashboard
========================= */

export const dashboardAPI = {
  getAnalytics: (params) =>
    api.get('/admin/dashboard/analytics', { params }),

  getOrderStatusCounts: () =>
    api.get('/admin/dashboard/order-status-counts'),
}

/* =========================
   Contact Enquiries
========================= */

export const contactAPI = {
  create: (data) =>
    api.post('/contact', data),

  getAll: (params) =>
    api.get('/contact/admin', { params }),

  getById: (id) =>
    api.get(`/contact/admin/${id}`),

  updateStatus: (id, data) =>
    api.put(`/contact/admin/${id}/status`, data),

  reply: (id, data) =>
    api.post(`/contact/admin/${id}/reply`, data),

  getStatuses: () =>
    api.get('/contact/admin/statuses'),

  getStats: () =>
    api.get('/contact/admin/stats'),
}

/* =========================
   Quotations
========================= */

export const quotationAPI = {
  getAll: (params) =>
    api.get('/quotations', { params }),

  getById: (id) =>
    api.get(`/quotations/${id}`),

  create: (data) =>
    api.post('/quotations', data),

  update: (id, data) =>
    api.put(`/quotations/${id}`, data),

  delete: (id) =>
    api.delete(`/quotations/${id}`),

  uploadExcel: (formData) =>
    api.post('/quotations/upload-excel', formData),
}

/* =========================
   Categories
========================= */

export const categoryAPI = {
  getAll: () =>
    api.get('/categories'),

  getById: (id) =>
    api.get(`/categories/${id}`),

  create: (categoryData) =>
    api.post('/categories', categoryData),

  update: (id, categoryData) =>
    api.put(`/categories/${id}`, categoryData),

  delete: (id) =>
    api.delete(`/categories/${id}`),
}

/* =========================
   Content Management
========================= */

export const contentAPI = {
  getAll: (type, params) =>
    api.get(`/content/${type}`, { params }),

  getActive: (type, params) =>
    api.get(`/content/${type}/active`, { params }),

  getById: (type, id) =>
    api.get(`/content/${type}/${id}`),

  create: (type, formData) =>
    api.post(`/content/${type}`, formData),

  update: (type, id, formData) =>
    api.put(`/content/${type}/${id}`, formData),

  delete: (type, id) =>
    api.delete(`/content/${type}/${id}`),

  reorder: (type, items) =>
    api.put(`/content/${type}/reorder`, { items }),

  toggleActive: (type, id) =>
    api.put(`/content/${type}/${id}/toggle`),

  getHomepageSettings: () =>
    api.get('/content/homepage/settings'),

  updateHomepageSettings: (data) =>
    api.put('/content/homepage/settings', data),

  uploadHomepageImage: (formData) =>
    api.post('/content/homepage/upload', formData),

  uploadHomepageMedia: (formData) =>
    api.post('/content/homepage/media-upload', formData),

  updateHomepageTab: (tab, payload) =>
    api.put(
      '/content/homepage/settings/updateTab',
      {
        tab,
        payload,
      }
    ),
}

/* =========================
   Video Reels
========================= */

export const videoReelsAPI = {
  upload: (formData) =>
    api.post(
      '/content/homepage/video-reels/upload',
      formData
    ),

  listAdmin: () =>
    api.get('/content/homepage/video-reels'),

  listPublic: () =>
    api.get('/content/homepage/video-reels/active'),

  update: (id, data) =>
    api.put(
      `/content/homepage/video-reels/${id}`,
      data
    ),

  remove: (id) =>
    api.delete(
      `/content/homepage/video-reels/${id}`
    ),

  toggle: (id) =>
    api.put(
      `/content/homepage/video-reels/${id}/toggle`
    ),

  reorder: (items) =>
    api.put(
      '/content/homepage/video-reels/reorder',
      { items }
    ),
}

/* =========================
   Admin Settings
========================= */

export const adminSettingsAPI = {
  get: () =>
    api.get('/admin/settings'),

  update: (data) =>
    api.put('/admin/settings', data),

  changePassword: (data) =>
    api.put(
      '/admin/settings/password',
      data
    ),
}

/* =========================
   Public Store
========================= */

export const storeAPI = {
  getSettings: () =>
    api.get('/store/public'),
}

export default api

export const accessoryAPI = {
  getAll: (params) => api.get('/accessories/categories', { params }),
  getActive: () => api.get('/accessories/public/categories'),
  getById: (id) => api.get(`/accessories/categories/${id}`),
  create: (accessoryData) => api.post('/accessories/categories', accessoryData),
  update: (id, accessoryData) => api.put(`/accessories/categories/${id}`, accessoryData),
  delete: (id) => api.delete(`/accessories/categories/${id}`),
}

export const accessoryProductAPI = {
  getAll: (params = {}) => {
    const categoryId = params.categoryId || params.category
    if (categoryId) {
      return api.get(`/accessories/categories/${categoryId}/products`, { params })
    }
    return api.get('/accessories/products', { params })
  },

  getById: (id) =>
    api.get(`/accessories/products/${id}`),

  create: (formData, config) => {
    const categoryId = formData?.get?.('categoryId') || formData?.get?.('category')
    return api.post(`/accessories/categories/${categoryId}/products`, formData, config)
  },

  update: (id, formData, config) =>
    api.put(`/accessories/products/${id}`, formData, config),

  delete: (id) =>
    api.delete(`/accessories/products/${id}`),

  getActiveByCategory: (categoryId, params) =>
    api.get(`/accessories/public/categories/${categoryId}/products`, { params }),

  getPublicById: (id) =>
    api.get(`/accessories/public/products/${id}`),
}

