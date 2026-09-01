import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userAPI } from '../services/api'

export default function Addresses() {
  const { isAuthenticated } = useAuth()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: false,
  })

  useEffect(() => {
    if (!isAuthenticated) return
    fetchAddresses()
  }, [isAuthenticated])

  const fetchAddresses = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await userAPI.getAddresses()
      if (response.data.success) {
        setAddresses(response.data.data || [])
      } else {
        setError(response.data.message || 'Failed to fetch addresses')
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch addresses')
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setEditingAddress(null)
    setFormData({ fullName: '', phone: '', address: '', landmark: '', city: '', state: '', pincode: '', isDefault: false })
    setIsModalOpen(true)
    setError('')
  }

  const openEditModal = (address) => {
    setEditingAddress(address)
    setFormData({
      fullName: address.fullName || '',
      phone: address.phone || '',
      address: address.address || '',
      landmark: address.landmark || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: address.isDefault || false,
    })
    setIsModalOpen(true)
    setError('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')

    if (!formData.fullName.trim() || !formData.address.trim() || !formData.city.trim() || !formData.state.trim() || !formData.pincode.trim()) {
      setError('Please fill all required fields')
      return
    }

    try {
      if (editingAddress) {
        await userAPI.updateAddress(editingAddress._id, formData)
        setSuccessMessage('Address updated successfully')
      } else {
        await userAPI.addAddress(formData)
        setSuccessMessage('Address added successfully')
      }
      setIsModalOpen(false)
      setEditingAddress(null)
      setFormData({ fullName: '', phone: '', address: '', landmark: '', city: '', state: '', pincode: '', isDefault: false })
      fetchAddresses()
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save address')
    }
  }

  const handleSetDefault = async (id) => {
    setError('')
    setSuccessMessage('')
    try {
      const response = await userAPI.setDefaultAddress(id)
      if (response.data.success) {
        setAddresses(response.data.data || [])
        setSuccessMessage('Default address updated')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to set default address')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return
    setError('')
    setSuccessMessage('')
    try {
      const response = await userAPI.deleteAddress(id)
      if (response.data.success) {
        setAddresses(response.data.data || [])
        setSuccessMessage('Address deleted successfully')
        setTimeout(() => setSuccessMessage(''), 3000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete address')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="flex-grow flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="font-body-md text-body-md text-on-surface-variant mb-4">Please login to manage your addresses</p>
          <a href="/login" className="inline-block px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors">
            Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-grow flex w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 gap-gutter">
      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-32 space-y-2">
          <h2 className="font-headline-md text-headline-md text-deep-emerald mb-6 pb-2 border-b border-outline-variant">My Account</h2>
          <nav className="flex flex-col gap-2 font-body-md text-body-md">
            <Link to="/account" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">person</span>
              Profile Overview
            </Link>
            <Link to="/account/orders" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">shopping_basket</span>
              My Orders
            </Link>
            <Link to="/account/addresses" className="flex items-center gap-3 px-4 py-3 bg-surface-white text-deep-emerald font-bold rounded border border-outline-variant shadow-sm transition-all">
              <span className="material-symbols-outlined text-regal-gold">location_on</span>
              Addresses
            </Link>
            <Link to="/account/settings" className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:bg-surface-white hover:text-deep-emerald rounded transition-all">
              <span className="material-symbols-outlined">settings</span>
              Account Settings
            </Link>
          </nav>
        </div>
      </aside>

      <main className="flex-1">
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-display-lg text-display-lg text-deep-emerald">My Addresses</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mt-2">Manage your shipping addresses.</p>
          </div>
          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Address
          </button>
        </header>

        {error && (
          <div className="mb-6 p-4 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-primary-fixed/20 border border-primary-fixed/30 text-primary rounded-lg text-sm">
            {successMessage}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[32px] text-on-surface-variant/30 mb-4 block">hourglass_empty</span>
            <p className="font-body-md text-body-md text-on-surface-variant">Loading addresses...</p>
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-12 bg-surface-white border border-outline-variant rounded">
            <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-4 block">location_on</span>
            <p className="font-body-md text-body-md text-on-surface-variant mb-4">You have no saved addresses</p>
            <button onClick={openCreateModal} className="inline-block px-6 py-3 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors">
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div key={address._id} className="bg-surface-white border border-outline-variant rounded shadow-sm p-6 relative">
                {address.isDefault && (
                  <span className="absolute top-4 right-4 inline-flex items-center px-2 py-1 rounded-full text-[10px] font-label-caps bg-primary-fixed/20 text-on-primary-fixed-variant border border-primary-fixed-dim/30">
                    Default
                  </span>
                )}
                <div className="space-y-2 font-body-md text-body-md">
                  <p className="font-semibold text-deep-emerald">{address.fullName}</p>
                  {address.phone && <p className="text-on-surface-variant">{address.phone}</p>}
                  <p className="text-on-surface">{address.address}</p>
                  {address.landmark && <p className="text-on-surface-variant">{address.landmark}</p>}
                  <p className="text-on-surface-variant">
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
                <div className="mt-4 flex gap-3">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address._id)}
                      className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-deep-emerald transition-colors"
                    >
                      <span className="material-symbols-outlined text-sm">star</span>
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(address)}
                    className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-deep-emerald transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(address._id)}
                    className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-error transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {isModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto"
            onClick={() => setIsModalOpen(false)}
          >
            <div
              className="bg-surface-white rounded-lg shadow-xl max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-6 border-b border-outline-variant">
                <h2 className="font-headline-md text-headline-md text-deep-emerald">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-on-surface-variant hover:text-deep-emerald transition-colors"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 bg-error-container/10 border border-error-container/20 text-error rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Full Name"
                    required
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Phone Number"
                  />
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Address *
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md resize-y"
                    placeholder="Street address"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    name="landmark"
                    value={formData.landmark}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Landmark (optional)"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                      State *
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                      placeholder="State"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-label-caps text-xs text-on-surface-variant mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2.5 border border-outline-variant rounded focus:border-deep-emerald focus:ring-1 focus:ring-deep-emerald text-sm font-body-md"
                    placeholder="Pincode"
                    required
                  />
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    className="w-4 h-4 rounded border-outline-variant text-deep-emerald focus:ring-deep-emerald"
                  />
                  <label className="font-body-md text-on-surface">
                    Set as default address
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 bg-transparent text-charcoal-text border border-outline-variant font-label-caps text-label-caps rounded hover:bg-surface-container-low transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-deep-emerald text-surface-white font-label-caps text-label-caps rounded hover:bg-deep-emerald/90 transition-colors"
                  >
                    {editingAddress ? 'Update' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
