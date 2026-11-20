import api from '@/lib/axios'
import type {
  PaginatedProducts,
  ProductCreate,
  ProductQuery,
  ProductResponse,
  ProductUpdate,
} from '@/types/api'

export const productsApi = {
  getProducts: async (params?: ProductQuery): Promise<PaginatedProducts> => {
    const response = await api.get<PaginatedProducts>('/v1/products/', {
      params,
    })
    return response.data
  },

  getProduct: async (productId: string): Promise<ProductResponse> => {
    const response = await api.get<ProductResponse>(`/v1/products/${productId}`)
    return response.data
  },

  createProduct: async (data: ProductCreate): Promise<ProductResponse> => {
    const response = await api.post<ProductResponse>('/v1/products/', data)
    return response.data
  },

  updateProduct: async (
    productId: string,
    data: ProductUpdate
  ): Promise<ProductResponse> => {
    const response = await api.put<ProductResponse>(
      `/v1/products/${productId}`,
      data
    )
    return response.data
  },

  deleteProduct: async (productId: string): Promise<void> => {
    await api.delete(`/v1/products/${productId}`)
  },

  getCategoryRecommendations: async (
    categoryId: string,
    limit = 10
  ): Promise<ProductResponse[]> => {
    const response = await api.get<ProductResponse[]>(
      `/v1/categories/${categoryId}/recommendations`,
      { params: { limit } }
    )
    return response.data
  },
}
