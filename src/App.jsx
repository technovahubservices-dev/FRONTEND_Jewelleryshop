import { useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import AppRoutes from './routes/AppRoutes'
import Footer from './components/layout/Footer'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  const location = useLocation()
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '')
  const pathname =
    basePath !== '/' && location.pathname.startsWith(basePath)
      ? location.pathname.slice(basePath.length) || '/'
      : location.pathname
  const isAdminRoute = pathname.startsWith('/admin')

  return (
    <AuthProvider>
      <div className="font-body-md text-on-background min-h-screen flex flex-col antialiased">
        {!isAdminRoute && <Header />}
        <AppRoutes />
        {!isAdminRoute && <Footer />}
      </div>
    </AuthProvider>
  )
}
