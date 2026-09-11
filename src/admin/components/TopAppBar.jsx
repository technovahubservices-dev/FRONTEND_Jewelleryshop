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
    <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 flex-shrink-0 z-10 shadow-sm">
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <i className="fa-solid fa-magnifying-glass text-gray-400 text-sm"></i>
        </div>

        <input
          className="block w-full pl-10 pr-3 py-2 border-none bg-surface-container-low rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-deep-emerald focus:bg-white transition-colors"
          placeholder="Search products, SKUs, or orders..."
          type="text"
        />
      </div>

      <div className="flex items-center gap-5">
        {!loading && (
          <div className="flex items-center gap-2 text-sm">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                googleDriveConnected
                  ? 'bg-emerald-500'
                  : 'bg-amber-500'
              }`}
            ></span>

            <span className="text-gray-600">
              Google Drive
            </span>

            <span
              className={`font-medium ${
                googleDriveConnected
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }`}
            >
              {googleDriveConnected ? 'Connected' : 'Not connected'}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-deep-emerald flex items-center justify-center text-white text-sm font-medium">
            {user?.name?.charAt(0) || 'A'}
          </div>
        </div>
      </div>
    </header>
  )
}