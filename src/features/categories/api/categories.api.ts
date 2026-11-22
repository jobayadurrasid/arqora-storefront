import api from '@/lib/axios'
import type {
  CategoryCreate,
  CategoryResponse,
} from '@/types/api'

function normalizeCategories(raw: unknown): CategoryResponse[] {
  if (Array.isArray(raw)) {
    return raw as CategoryResponse[]
  }
  if (raw && typeof raw === 'object') {
    const record = raw as Record<string, unknown>
    if (Array.isArray(record.items)) {
      return record.items as CategoryResponse[]
    }
    if (Array.isArray(record.data)) {
      return record.data as CategoryResponse[]
    }
  }
  return []
}

export const categoriesApi = {
  getCategories: async (signal?: AbortSignal): Promise<CategoryResponse[]> => {
    const response = await api.get<unknown>('/v1/categories/', { signal })
    return normalizeCategories(response.data)
  },

  getCategory: async (categoryId: string): Promise<CategoryResponse> => {
    const response = await api.get<CategoryResponse>(`/v1/categories/${categoryId}`)
    return response.data
  },

  createCategory: async (data: CategoryCreate): Promise<CategoryResponse> => {
    const response = await api.post<CategoryResponse>('/v1/categories/', data)
    return response.data
  },

  updateCategory: async (
    categoryId: string,
    data: Partial<CategoryCreate>
  ): Promise<CategoryResponse> => {
    const response = await api.put<CategoryResponse>(
      `/v1/categories/${categoryId}`,
      data
    )
    return response.data
  },

  deleteCategory: async (categoryId: string): Promise<void> => {
    await api.delete(`/v1/categories/${categoryId}`)
  },
}
