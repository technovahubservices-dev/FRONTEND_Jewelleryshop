import SideNavBar from '../components/SideNavBar'
import TopAppBar from '../components/TopAppBar'

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-soft-cream">
      <SideNavBar />
      <div className="flex-1 flex flex-col md:ml-72 min-h-screen">
        <TopAppBar />
        <main className="flex-1 p-margin-mobile md:p-margin-desktop max-w-container-max mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
