import { createContext, useContext } from 'react'
import type { ProductResponse } from '@/types/api'

export interface CartItem {
  product: ProductResponse
  quantity: number
}

export interface CartContextType {
  items: CartItem[]
  addToCart: (product: ProductResponse, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  totalCount: number
  subtotal: number
}

export const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
