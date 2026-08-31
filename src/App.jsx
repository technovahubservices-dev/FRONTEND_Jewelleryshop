import { useLocation } from 'react-router-dom'
import Header from './components/layout/Header'
import AppRoutes from './routes/AppRoutes'
import Footer from './components/layout/Footer'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

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
