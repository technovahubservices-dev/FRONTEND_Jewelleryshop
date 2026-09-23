import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { googleDriveAPI } from '../../services/api'

export default function TopAppBar({ onMenuClick }) {
  const { user } = useAuth()
  const [googleDriveConnected, setGoogleDriveConnected] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkGoogleDriveStatus = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const response = await googleDriveAPI.getStatus({
        headers: { Authorization: `Bearer ${token}` },
        skipAuthRedirect: true,
      })

      const status = response.data?.data || response.data

      setGoogleDriveConnected(
        Boolean(status?.connected ?? status?.isConnected)
      )
    } catch {
      setGoogleDriveConnected(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkGoogleDriveStatus()
  }, [])

  return (
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10 shadow-sm">

      {/* Mobile Menu Button */}
      <button
        type="button"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
        className="md:hidden w-10 h-10 flex items-center justify-center rounded-md text-gray-600 hover:bg-emerald-50 hover:text-deep-emerald transition-colors"
      >
        <i className="fa-solid fa-bars text-lg"></i>
      </button>

      {/* Desktop left space */}
      <div className="hidden md:block"></div>

      {/* Right Section */}
      <div className="ml-auto flex items-center gap-3 md:gap-5">

        {/* Google Drive Status */}
        {!loading && (
          <div className="flex items-center gap-2 text-sm shrink-0">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                googleDriveConnected
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            ></span>

            <span
              className={`font-medium hidden sm:inline ${
                googleDriveConnected
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {googleDriveConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        )}

        {/* User */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-full bg-deep-emerald flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>

      </div>
    </header>
  )
}