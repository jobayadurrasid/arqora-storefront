import { useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/features/auth/api/auth.api'
import { AuthContext } from './authContextDef'
import type { LoginRequest, UserRegister, UserResponse } from '@/types/api'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponse | null>(() => {
    const saved = localStorage.getItem('auth_user')
    return saved ? JSON.parse(saved) : null
  })
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('access_token')
  )
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const logout = useCallback(() => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('auth_user')
    setToken(null)
    setUser(null)
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const profile = await authApi.getMe()
      setUser(profile)
      localStorage.setItem('auth_user', JSON.stringify(profile))
    } catch {
      logout()
    }
  }, [logout])

  useEffect(() => {
    let isMounted = true
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token')
      if (storedToken) {
        setToken(storedToken)
        try {
          const profile = await authApi.getMe()
          if (isMounted) {
            setUser(profile)
            localStorage.setItem('auth_user', JSON.stringify(profile))
          }
        } catch {
          if (isMounted) {
            logout()
          }
        }
      }
      if (isMounted) {
        setIsLoading(false)
      }
    }
    initAuth()
    return () => {
      isMounted = false
    }
  }, [logout])

  const login = async (credentials: LoginRequest) => {
    const tokens = await authApi.login(credentials)
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    setToken(tokens.access_token)
    const profile = await authApi.getMe()
    setUser(profile)
    localStorage.setItem('auth_user', JSON.stringify(profile))
  }

  const register = async (data: UserRegister): Promise<UserResponse> => {
    const res = await authApi.register(data)
    return res
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
