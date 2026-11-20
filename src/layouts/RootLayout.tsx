import { Outlet } from 'react-router'
import { Navbar } from '../components/common/Navbar'
import { Footer } from '../components/common/Footer'

export function RootLayout() {
  return (
    <div className="min-h-svh w-full bg-primary text-secondary flex flex-col font-sans">
      <Navbar />
      <div className="flex-1 w-full">
        <Outlet />
      </div>
      <Footer />
    </div>
  )
}
