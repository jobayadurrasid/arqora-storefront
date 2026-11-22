import api from '@/lib/axios'
import type {
  CategoryCreate,
  CategoryResponse,
} from '@/types/api'

export const categoriesApi = {
  getCategories: async (): Promise<CategoryResponse[]> => {
    const response = await api.get<CategoryResponse[]>('/v1/categories/')
    return response.data
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
