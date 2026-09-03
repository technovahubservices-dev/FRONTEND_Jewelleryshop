import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Home from '../pages/Home'
import Shop from '../pages/Shop'
import Collection from '../pages/Collection'
import ProductDetails from '../pages/ProductDetails'
import Account from '../pages/Account'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Search from '../pages/Search'
import OrderConfirmation from '../pages/OrderConfirmation'
import OrdersHistory from '../pages/OrdersHistory'
import Tracking from '../pages/Tracking'
import Payment from '../pages/Payment'
import Addresses from '../pages/Addresses'
import Settings from '../pages/Settings'
import Blog from '../pages/Blog'
import BlogPost from '../pages/BlogPost'
import AdminLayout from '../admin/layouts/AdminLayout'
import Products from '../admin/pages/Products'
import Categories from '../admin/pages/Categories'
import ContentManagement from '../admin/pages/ContentManagement'
import AdminSettings from '../admin/pages/Settings'
import NotFound from '../pages/NotFound'
import Contact from '../pages/Contact'
import Quotations from '../admin/pages/Quotations'
import CreateQuotation from '../admin/pages/CreateQuotation'
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

const adminElement = (Element) => (
  <AdminRoute>
    <AdminLayout>
      <Element />
    </AdminLayout>
  </AdminRoute>
)

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/collections/:slug" element={<Collection />} />
      <Route path="/product/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/search" element={<Search />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPost />} />
      <Route path="/contact" element={<Contact />} />

      {/* Account / User routes */}
      <Route path="/account" element={<Account />} />
      <Route path="/order-confirmation" element={<OrderConfirmation />} />
      <Route path="/payment" element={<Payment />} />
      <Route path="/account/orders" element={<OrdersHistory />} />
      <Route path="/account/tracking" element={<Tracking />} />
      <Route path="/account/addresses" element={<Addresses />} />
      <Route path="/account/settings" element={<Settings />} />

       {/* Admin routes */}
      <Route path="/admin" element={adminElement(Products)} />
      <Route path="/admin/products" element={adminElement(Products)} />
      <Route path="/admin/categories" element={adminElement(Categories)} />
      <Route path="/admin/quotations" element={adminElement(Quotations)} />
      <Route path="/admin/quotations/create" element={adminElement(CreateQuotation)} />
      <Route path="/admin/content" element={adminElement(ContentManagement)} />
      <Route path="/admin/settings" element={adminElement(AdminSettings)} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
