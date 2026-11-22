import { useNavigate, Outlet } from 'react-router'
import { useAuth } from '@/stores/authContextDef'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher'
import { BrandLogo } from '@/components/common/BrandLogo'

export function AdminLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-svh w-full bg-primary text-secondary flex flex-col font-sans">
      {/* Admin Top Navbar — No Customer Cart or Storefront links */}
      <header className="sticky top-0 z-40 w-full bg-surface border-b border-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" />
            <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-secondary text-secondary-foreground">
              Admin Console
            </span>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4 text-xs font-semibold">
            <ThemeSwitcher />
            <span className="text-secondary/70 hidden sm:inline">
              Admin: {user?.first_name || user?.email}
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-md border border-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground transition cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Admin Content Area */}
      <div className="flex-1 w-full">
        <Outlet />
      </div>

      {/* Admin Footer */}
      <footer className="w-full bg-surface border-t border-secondary/10 py-4 text-center text-xs text-secondary/40">
        Arqora Storefront Administration System • Restricted Access
      </footer>
    </div>
  )
}
