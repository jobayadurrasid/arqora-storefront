import axios, { type InternalAxiosRequestConfig } from 'axios'
import config from '../config/config'

const api = axios.create({
  baseURL: config.api.baseURL || 'http://localhost:8010/api',
  timeout: config.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor: attach bearer token if exists
api.interceptors.request.use(
  (reqConfig: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && reqConfig.headers) {
      reqConfig.headers.Authorization = `Bearer ${token}`
    }
    return reqConfig
  },
  (error) => Promise.reject(error)
)

// Response interceptor: automatically refresh token on 401 if refresh token is available
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/v1/auth/')
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return api(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (!refreshToken) {
        isRefreshing = false
        return Promise.reject(error)
      }

      try {
        const { data } = await axios.post(
          `${config.api.baseURL || 'http://localhost:8010/api'}/v1/auth/refresh`,
          { refresh_token: refreshToken }
        )

        const newAccessToken = data.access_token
        localStorage.setItem('access_token', newAccessToken)
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token)
        }

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return api(originalRequest)
      } catch (refreshErr) {
        processQueue(refreshErr, null)
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth_user')
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api
