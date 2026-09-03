import { createContext, useState, useEffect, useContext } from 'react'
import { getApiBaseUrl } from '../utils/apiUrl'

const AuthContext = createContext()

const API_URL = getApiBaseUrl()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      if (token && storedUser) {
        const parsed = JSON.parse(storedUser)
        if (parsed && typeof parsed === 'object' && parsed._id && parsed.email) {
          setUser(parsed)
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      }
    } catch {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = (userData) => {
    localStorage.setItem('token', userData.token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  const register = async (name, email, password) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email: email.toLowerCase().trim(), password: password.trim() }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Registration failed')
    login(data)
    return data
  }

  const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Login failed')
    login(data)
    return data
  }

  const updateProfile = async (profileData) => {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(profileData),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to update profile')
    const updatedUser = { ...user, ...data.data }
    localStorage.setItem('user', JSON.stringify(updatedUser))
    setUser(updatedUser)
    return data
  }

  const changePassword = async (currentPassword, newPassword) => {
    const response = await fetch(`${API_URL}/users/password`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await response.json()
    if (!response.ok) throw new Error(data.message || 'Failed to change password')
    return data
  }

  const value = {
    user,
    loading,
    register,
    login: loginUser,
    logout,
    updateProfile,
    changePassword,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
