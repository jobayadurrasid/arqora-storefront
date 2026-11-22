import { RouterProvider } from 'react-router'
import { ThemeProvider } from '@/stores/ThemeProvider'
import { AuthProvider } from '@/stores/AuthProvider'
import { CartProvider } from '@/stores/CartProvider'
import { router } from '@/routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <RouterProvider router={router} />
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
