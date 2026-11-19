export interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  address: string
}

// Payload expected by the backend (snake_case)
export interface RegisterPayload {
  first_name: string
  last_name: string
  email: string
  password: string
  address: string
}

// Generic API response structure for registration
export interface RegisterResponse {
  message?: string
  user?: {
    id: string | number
    email: string
    first_name: string
    last_name: string
    address?: string
  }
  [key: string]: unknown
}

export type RegisterFormErrors = Partial<
  Record<keyof RegisterFormValues | 'name' | 'general', string>
>
