import { RouterProvider } from 'react-router'
import { ThemeProvider } from '@/stores/ThemeProvider'
import { AuthProvider } from '@/stores/AuthProvider'
import { router } from '@/routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
