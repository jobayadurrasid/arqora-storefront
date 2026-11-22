import { Navigate, createBrowserRouter } from 'react-router'
import { RootLayout } from '../layouts/RootLayout'
import { CatalogPage } from '../features/products/components/CatalogPage'
import { ProductDetailPage } from '../features/products/components/ProductDetailPage'
import { CartPage } from '../features/cart/components/CartPage'
import { CheckoutPage } from '../features/checkout/components/CheckoutPage'
import { OrdersPage } from '../features/orders/components/OrdersPage'
import { OrderDetailPage } from '../features/orders/components/OrderDetailPage'
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
      {
        path: 'cart',
        element: <CartPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'orders',
        element: <OrdersPage />,
      },
      {
        path: 'orders/:orderId',
        element: <OrderDetailPage />,
      },
    ],
  },

  // Fallback for routes coming in later PRs
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])
