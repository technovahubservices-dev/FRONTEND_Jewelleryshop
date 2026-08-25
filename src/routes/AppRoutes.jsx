import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from '../pages/Home'
import Shop from '../pages/Shop'
import ProductDetails from '../pages/ProductDetails'
import Cart from '../pages/Cart'
import Checkout from '../pages/Checkout'
import Account from '../pages/Account'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Search from '../pages/Search'
import OrderConfirmation from '../pages/OrderConfirmation'
import OrdersHistory from '../pages/OrdersHistory'
import Wishlist from '../pages/Wishlist'
import Addresses from '../pages/Addresses'
import Settings from '../pages/Settings'
import AdminLayout from '../admin/layouts/AdminLayout'
import Dashboard from '../admin/pages/Dashboard'
import Products from '../admin/pages/Products'
import Categories from '../admin/pages/Categories'
import RawMaterials from '../admin/pages/RawMaterials'
import Production from '../admin/pages/Production'
import Orders from '../admin/pages/Orders'
import AdminSettings from '../admin/pages/Settings'
import NotFound from '../pages/NotFound'
import { useAuth } from '../context/AuthContext'

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>

  if (!isAdmin) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/account" element={<Account />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/account/orders" element={<OrdersHistory />} />
      <Route path="/account/wishlist" element={<Wishlist />} />
      <Route path="/account/addresses" element={<Addresses />} />
      <Route path="/account/settings" element={<Settings />} />
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout><Dashboard /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminRoute>
            <AdminLayout><Products /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminRoute>
            <AdminLayout><Categories /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/raw-materials"
        element={
          <AdminRoute>
            <AdminLayout><RawMaterials /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/production"
        element={
          <AdminRoute>
            <AdminLayout><Production /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminRoute>
            <AdminLayout><Orders /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminLayout><AdminSettings /></AdminLayout>
          </AdminRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
