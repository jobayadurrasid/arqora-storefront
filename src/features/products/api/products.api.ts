import api from '@/lib/axios'
import type {
  PaginatedProducts,
  ProductCreate,
  ProductQuery,
  ProductResponse,
  ProductUpdate,
} from '@/types/api'

function normalizePaginatedProducts(raw: unknown): PaginatedProducts {
  if (Array.isArray(raw)) {
    const items = raw as ProductResponse[]
    return {
      items,
      total: items.length,
      page: 1,
      page_size: items.length || 12,
      total_pages: 1,
    }
  }

  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (
      record.data &&
      typeof record.data === 'object' &&
      Array.isArray((record.data as Record<string, unknown>).items)
    ) {
      return normalizePaginatedProducts(record.data)
    }

    const items = Array.isArray(record.items)
      ? (record.items as ProductResponse[])
      : []

    return {
      items,
      total: typeof record.total === 'number' ? record.total : items.length,
      page: typeof record.page === 'number' ? record.page : 1,
      page_size: typeof record.page_size === 'number' ? record.page_size : 12,
      total_pages:
        typeof record.total_pages === 'number' ? record.total_pages : 1,
    }
  }

  return {
    items: [],
    total: 0,
    page: 1,
    page_size: 12,
    total_pages: 1,
  }
}

export const productsApi = {
  getProducts: async (
    params?: ProductQuery,
    signal?: AbortSignal
  ): Promise<PaginatedProducts> => {
    const cleanParams: Record<string, string | number | boolean> = {}
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== null && value !== undefined && value !== '') {
          cleanParams[key] = value
        }
      }
    }

    const response = await api.get<unknown>('/v1/products/', {
      params: cleanParams,
      signal,
    })
    return normalizePaginatedProducts(response.data)
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
