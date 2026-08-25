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
      
      {/* Sidebar Navigation */}
      <SideNavBar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      {/* Main Content Area - Fixed ml-64 to match Sidebar exact width */}
      <div className="flex-1 flex flex-col md:ml-64 min-w-0 min-h-screen">
        <TopAppBar onMenuClick={() => setSidebarOpen(true)} />
        {/* max-w-none removes container centering restrictions */}
        <main className="flex-1 p-6 md:p-8 w-full max-w-none">
          {children}
        </main>
      </div>
    </div>
  );
}