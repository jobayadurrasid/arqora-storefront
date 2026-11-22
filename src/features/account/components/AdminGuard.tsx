import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/stores/authContextDef'

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-secondary/60">Checking permissions...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=/admin" replace />
  }

  // Treat only 'admin' role as authorized
  const isAdmin = user?.role === 'admin'
  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
