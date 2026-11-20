import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/stores/authContextDef'
import { useCart } from '@/stores/cartContextDef'
import { ThemeSwitcher } from './ThemeSwitcher'

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { totalCount } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-surface border-b border-secondary/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          className="text-2xl font-bold tracking-[0.22em] uppercase text-secondary flex items-center"
        >
          A<span className="text-action">R</span>QO
          <span className="text-action">R</span>A
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link
            to="/"
            className="text-secondary/70 hover:text-secondary transition"
          >
            Catalog
          </Link>
          <Link
            to="/orders"
            className="text-secondary/70 hover:text-secondary transition"
          >
            My Orders
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center space-x-3 sm:space-x-4 text-sm">
          {/* Theme Switcher */}
          <ThemeSwitcher />

          {/* Cart Icon & Count */}
          <Link
            to="/cart"
            className="relative flex items-center gap-1.5 py-1 px-3 rounded-md border border-secondary/20 text-secondary hover:border-secondary transition"
          >
            <span className="text-xs font-semibold uppercase tracking-wider">
              Cart
            </span>
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-action text-action-foreground text-xs font-bold">
              {totalCount}
            </span>
          </Link>

          {/* Auth State */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-medium text-secondary/70 hidden sm:inline">
                Hi, {user?.first_name || user?.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-xs font-medium px-3 py-1.5 rounded-md border border-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground transition cursor-pointer"
              >
                Sign out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/login"
                className="text-xs font-medium px-3 py-1.5 text-secondary hover:text-action transition"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="text-xs font-medium px-3.5 py-1.5 rounded-md bg-action text-action-foreground hover:opacity-90 transition"
              >
                Join
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
