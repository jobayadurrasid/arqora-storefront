export interface RegisterFormValues {
  firstName: string
  lastName: string
  email: string
  password: string
  address: string
}

export type RegisterFormErrors = Partial<
  Record<keyof RegisterFormValues | 'name', string>
>
