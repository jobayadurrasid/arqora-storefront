import { createBrowserRouter } from 'react-router'
import { RootLayout } from '../layouts/RootLayout'
import { AdminLayout } from '../layouts/AdminLayout'
import { CatalogPage } from '../features/products/components/CatalogPage'
import { ProductDetailPage } from '../features/products/components/ProductDetailPage'
import { CartPage } from '../features/cart/components/CartPage'
import { CheckoutPage } from '../features/checkout/components/CheckoutPage'
import { OrdersPage } from '../features/orders/components/OrdersPage'
import { OrderDetailPage } from '../features/orders/components/OrderDetailPage'
import { AdminDashboardPage } from '../features/account/components/AdminDashboardPage'
import { AdminGuard } from '../features/account/components/AdminGuard'
import { CustomerGuard } from '../features/account/components/CustomerGuard'
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

  // Dedicated Admin Console (No Customer Shopping/Cart Layout)
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboardPage />,
      },
    ],
  },

  // Customer Storefront Layout (Guarded: Admins are prevented & redirected to /admin)
  {
    path: '/',
    element: (
      <CustomerGuard>
        <RootLayout />
      </CustomerGuard>
    ),
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
])
