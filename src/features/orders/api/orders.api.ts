import api from '@/lib/axios'
import type {
  OrderCreate,
  OrderResponse,
  PaginatedOrders,
} from '@/types/api'

export const ordersApi = {
  createOrder: async (data: OrderCreate): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>('/v1/orders/', data)
    return response.data
  },

  listOrders: async (page = 1, pageSize = 20): Promise<PaginatedOrders> => {
    const response = await api.get<PaginatedOrders>('/v1/orders/', {
      params: { page, page_size: pageSize },
    })
    return response.data
  },

  getOrder: async (orderId: string): Promise<OrderResponse> => {
    const response = await api.get<OrderResponse>(`/v1/orders/${orderId}`)
    return response.data
  },

  cancelOrder: async (orderId: string): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>(`/v1/orders/${orderId}/cancel`)
    return response.data
  },
}
