import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/stores/authContextDef'

export function CustomerGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // If logged-in user is an admin, redirect them out of the customer storefront to /admin
  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />
  }

  return <>{children}</>
}
