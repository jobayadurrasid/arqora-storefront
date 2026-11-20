import api from '../../../lib/axios'
import type {
  LoginRequest,
  RefreshTokenRequest,
  TokenResponse,
  UserRegister,
  UserResponse,
} from '../../../types/api'

export const authApi = {
  register: async (data: UserRegister): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/v1/auth/register', data)
    return response.data
  },

  login: async (credentials: LoginRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/v1/auth/login', credentials)
    return response.data
  },

  refresh: async (payload: RefreshTokenRequest): Promise<TokenResponse> => {
    const response = await api.post<TokenResponse>('/v1/auth/refresh', payload)
    return response.data
  },

  getMe: async (): Promise<UserResponse> => {
    const response = await api.get<UserResponse>('/v1/auth/me')
    return response.data
  },
}
