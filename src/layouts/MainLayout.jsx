import { Outlet, useLocation } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import MobileNavbar from '../components/layout/MobileNavbar'

export default function MainLayout() {
  const { pathname } = useLocation()
  const isMapPage = pathname === '/map'

  return (
    <div className="min-h-screen">
      <Navbar />
      <main
        className={
          isMapPage
            ? 'pt-16'
            : 'mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pb-12'
        }
      >
        <Outlet />
      </main>
      <MobileNavbar />
    </div>
  )
}
