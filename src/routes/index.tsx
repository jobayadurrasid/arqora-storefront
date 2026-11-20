import { Navigate, createBrowserRouter } from 'react-router'
import { RootLayout } from '../layouts/RootLayout'
import { CatalogPage } from '../features/products/components/CatalogPage'
import { ProductDetailPage } from '../features/products/components/ProductDetailPage'
import { RegisterPage, LoginPage } from '../features/auth'

export const router = createBrowserRouter([
  // Full-bleed auth pages
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/login',
    element: <LoginPage />,
  },

  // Customer Storefront Layout
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <CatalogPage />,
      },
      {
        path: 'products/:productId',
        element: <ProductDetailPage />,
      },
    ],
  },

  // Fallback for routes coming in later PRs
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
