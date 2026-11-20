import { Link } from 'react-router'

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-secondary/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between text-xs text-secondary/60 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-widest uppercase text-secondary">
            ARQORA
          </span>
          <span>© {new Date().getFullYear()} All rights reserved.</span>
        </div>
        <div className="flex items-center space-x-6">
          <Link to="/" className="hover:text-secondary transition">
            Shop
          </Link>
          <Link to="/orders" className="hover:text-secondary transition">
            Orders
          </Link>
          <span>Fast Worldwide Delivery</span>
        </div>
      </div>
    </footer>
  )
}
