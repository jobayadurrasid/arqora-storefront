import api from '@/lib/axios'
import type {
  BkashExecuteRequest,
  CheckoutRequest,
  CheckoutResponse,
  PaymentResponse,
} from '@/types/api'

export const paymentsApi = {
  checkout: async (data: CheckoutRequest): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutResponse>('/v1/payments/checkout', data)
    return response.data
  },

  getPayment: async (paymentId: string): Promise<PaymentResponse> => {
    const response = await api.get<PaymentResponse>(`/v1/payments/${paymentId}`)
    return response.data
  },

  executeBkashPayment: async (
    data: BkashExecuteRequest
  ): Promise<PaymentResponse> => {
    const response = await api.post<PaymentResponse>(
      '/v1/payments/execute',
      data
    )
    return response.data
  },
}
