import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname.startsWith('/admin') || window.location.pathname.startsWith('/account')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
};

export const productAPI = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (formData) =>
    api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/products/${id}`),
  transform: (p) => ({
    id: p._id,
    name: p.name,
    category: p.category,
    metal: p.metal || '',
    price: p.discountPrice > 0 ? p.discountPrice : p.price,
    originalPrice: p.price > 0 && p.discountPrice > 0 ? p.price : null,
    discount: p.discountPrice > 0 && p.price > 0
      ? `${Math.round(((p.price - p.discountPrice) / p.price) * 100)}% OFF`
      : null,
    image: p.primaryImage || (p.images && p.images[0]) || 'https://placehold.co/400x400',
    images: p.images || [],
    description: p.description || '',
    fullDescription: p.description || '',
    isNew: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    isFeatured: p.isFeatured,
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
  }),
};

export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.put('/users/password', data),
  getAddresses: () => api.get('/users/addresses'),
  addAddress: (data) => api.post('/users/addresses', data),
  updateAddress: (id, data) => api.put(`/users/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/users/addresses/${id}`),
  getWishlist: () => api.get('/users/wishlist'),
  addToWishlist: (productId) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId) => api.delete(`/users/wishlist/${productId}`),
};

export const orderAPI = {
  create: (orderData) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.put(`/orders/${id}`, { status }),
  delete: (id) => api.delete(`/orders/${id}`),
};

export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (categoryData) => api.post('/categories', categoryData),
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const rawMaterialAPI = {
  getAll: () => api.get('/raw-materials'),
  getById: (id) => api.get(`/raw-materials/${id}`),
  create: (materialData) => api.post('/raw-materials', materialData),
  update: (id, materialData) => api.put(`/raw-materials/${id}`, materialData),
  delete: (id) => api.delete(`/raw-materials/${id}`),
};

export const productionAPI = {
  getAll: () => api.get('/productions'),
  getById: (id) => api.get(`/productions/${id}`),
  create: (productionData) => api.post('/productions', productionData),
  update: (id, productionData) => api.put(`/productions/${id}`, productionData),
  delete: (id) => api.delete(`/productions/${id}`),
};

export default api;