import { useState } from 'react'
import SideNavBar from '../components/SideNavBar'
import TopAppBar from '../components/TopAppBar'

export default function AdminLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-soft-cream">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <SideNavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col md:ml-72 min-h-screen">
        <TopAppBar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-2 max-w-container-max  w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
