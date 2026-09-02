import { createContext, useState, useEffect, useContext } from 'react'

const AuthContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || '/api'

const safeParseJson = async (response) => {
  if (!response.ok) {
    let data
    try {
      data = await response.json()
    } catch {
      data = {}
    }
    return { ok: false, data: { message: data.message || 'Request failed' } }
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return { ok: true, data: {} }
  }

  try {
    const data = await response.json()
    return { ok: true, data }
  } catch {
    return { ok: false, data: { message: 'Invalid server response' } }
  }
}

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
    const { ok, data } = await safeParseJson(response)
    if (!ok) throw new Error(data.message || 'Registration failed')
    login(data)
    return data
  }

  const loginUser = async (email, password) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const { ok, data } = await safeParseJson(response)
    if (!ok) throw new Error(data.message || 'Login failed')
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
    const { ok, data } = await safeParseJson(response)
    if (!ok) throw new Error(data.message || 'Failed to update profile')
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
    const { ok, data } = await safeParseJson(response)
    if (!ok) throw new Error(data.message || 'Failed to change password')
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
