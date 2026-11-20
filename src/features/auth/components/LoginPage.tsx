import { useState, type FormEvent, type ChangeEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useAuth } from '@/stores/authContextDef'
import type { LoginRequest } from '../../../types/api'

export function LoginPage() {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: '',
  })
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCredentials((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: { email?: string; password?: string } = {}

    if (!credentials.email.trim()) {
      nextErrors.email = 'Email is required'
    }
    if (!credentials.password) {
      nextErrors.password = 'Password is required'
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await login(credentials)
      const storedUser = localStorage.getItem('auth_user')
      const parsedUser = storedUser ? JSON.parse(storedUser) : null
      if (parsedUser?.role === 'admin') {
        navigate('/admin', { replace: true })
      } else {
        navigate(redirect, { replace: true })
      }
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const msg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Invalid credentials. Please verify your email and password.'
        setErrors({ general: typeof msg === 'string' ? msg : 'Login failed.' })
      } else {
        setErrors({ general: 'Failed to sign in. Please try again.' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-[#ffffff] text-[#000000] flex flex-col">
      {/* Top Brand Link */}
      <header className="w-full px-4 pt-5 pb-2 sm:px-8 sm:pt-7 md:px-12">
        <Link
          to="/"
          className="inline-block text-2xl sm:text-3xl font-bold tracking-[0.22em] uppercase text-[#000000]"
        >
          A<span className="text-[#d07601]">R</span>QO
          <span className="text-[#d07601]">R</span>A
        </Link>
      </header>

      {/* Centered Sign-in card */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-8 sm:px-6">
        <main className="w-full max-w-md bg-[#ffffff] border border-[#000000]/15 rounded-xl p-6 sm:p-9">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-[#000000]">
              Sign In
            </h1>
            <p className="mt-1 text-sm text-[#000000]/60">
              Welcome back to Arqora Store.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {errors.general && (
              <div
                role="alert"
                className="p-3 rounded-md bg-[#d07601]/10 border border-[#d07601] text-xs font-semibold text-[#d07601]"
              >
                ⚠ {errors.general}
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-[#000000] mb-1.5"
              >
                Email Address <span className="text-[#d07601]">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="name@example.com"
                value={credentials.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition"
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#d07601]">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-medium text-[#000000] mb-1.5"
              >
                Password <span className="text-[#d07601]">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-3 pr-14 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2.5 text-xs text-[#000000]/60 hover:text-[#000000] cursor-pointer"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-[#d07601]">{errors.password}</p>
              )}
            </div>

            {/* Action button in Theme Orange */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#d07601] text-[#ffffff] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-[#000000]/60 pt-2">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-[#d07601] font-medium hover:underline"
              >
                Create account
              </Link>
            </p>
          </form>
        </main>
      </div>
    </div>
  )
}
