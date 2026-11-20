// Authentication Types
export interface UserRegister {
  first_name: string
  last_name: string
  email: string
  password: string
  address?: string | null
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type?: string
  expires_in?: number
}

export interface UserResponse {
  id: string
  first_name: string
  last_name: string
  email: string
  address: string | null
  role: string
  is_active: boolean
}

// Category Types
export interface CategoryResponse {
  id: string
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  is_active: boolean
}

export interface CategoryCreate {
  name: string
  slug: string
  description?: string | null
  parent_id?: string | null
  is_active?: boolean
}

// Product Types
export interface ProductResponse {
  id: string
  category_id: string
  name: string
  slug: string
  sku: string
  description?: string | null
  price: string | number
  stock: number
  is_active: boolean
}

export interface ProductCreate {
  name: string
  slug: string
  sku: string
  description?: string | null
  price: number | string
  stock: number
  category_id: string
  is_active?: boolean
}

export interface ProductUpdate {
  name?: string | null
  slug?: string | null
  sku?: string | null
  description?: string | null
  price?: number | string | null
  stock?: number | null
  category_id?: string | null
  is_active?: boolean | null
}

export interface PaginatedProducts {
  items: ProductResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface ProductQuery {
  category_id?: string | null
  include_subcategories?: boolean
  is_active?: boolean | null
  search?: string | null
  page?: number
  page_size?: number
}

// Order Types
export type OrderStatus = 'pending' | 'paid' | 'cancelled' | 'failed'

export interface OrderItemCreate {
  product_id: string
  quantity: number
}

export interface OrderCreate {
  items: OrderItemCreate[]
  shipping_address: string
}

export interface OrderItemResponse {
  id: string
  product_id: string
  quantity: number
  unit_price: string
  subtotal: string
}

export interface OrderResponse {
  id: string
  user_id: string
  order_number: string
  status: OrderStatus
  subtotal: string
  tax: string
  total_amount: string
  shipping_address: string
  created_at: string
  items: OrderItemResponse[]
}

export interface PaginatedOrders {
  items: OrderResponse[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

// Payment Types
export type PaymentProvider = 'stripe' | 'bkash'
export type PaymentStatus = 'pending' | 'successful' | 'failed'

export interface CheckoutRequest {
  order_id: string
  provider: PaymentProvider
  currency?: string
  return_url?: string | null
}

export interface CheckoutResponse {
  payment_id: string
  order_id: string
  provider: PaymentProvider
  amount: string
  currency: string
  status: PaymentStatus
  checkout_url?: string | null
  client_secret?: string | null
  metadata?: Record<string, unknown> | null
}

export interface BkashExecuteRequest {
  payment_id: string
  payment_id_bkash: string
}

export interface PaymentResponse {
  id: string
  order_id: string
  provider: PaymentProvider
  transaction_id?: string | null
  status: PaymentStatus
  amount: string
  currency: string
  created_at: string
}

// Error type from FastAPI / OpenAPI 3.1
export interface ValidationError {
  loc: (string | number)[]
  msg: string
  type: string
}

export interface HTTPValidationError {
  detail?: ValidationError[] | string
}
