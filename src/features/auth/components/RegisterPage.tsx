import { useState, type FormEvent, type ChangeEvent } from 'react'
import { isAxiosError } from 'axios'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/stores/authContextDef'
import { ThemeSwitcher } from '@/components/common/ThemeSwitcher'
import type { RegisterFormValues, RegisterFormErrors } from '../types/auth.types'

const initialValues: RegisterFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  address: '',
}

export function RegisterPage() {
  const [values, setValues] = useState<RegisterFormValues>(initialValues)
  const [errors, setErrors] = useState<RegisterFormErrors>({})
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedUser, setSubmittedUser] = useState<RegisterFormValues | null>(
    null
  )

  const { register } = useAuth()
  const navigate = useNavigate()

  const validate = (formValues: RegisterFormValues): RegisterFormErrors => {
    const nextErrors: RegisterFormErrors = {}

    const hasFirstName = formValues.firstName.trim().length > 0
    const hasLastName = formValues.lastName.trim().length > 0

    if (!hasFirstName) {
      nextErrors.firstName = 'First name is required.'
    }
    if (!hasLastName) {
      nextErrors.lastName = 'Last name is required.'
    }

    const emailTrimmed = formValues.email.trim()
    if (!emailTrimmed) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
    } else if (formValues.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters long.'
    }

    return nextErrors
  }

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))

    setErrors((prev) => {
      const next = { ...prev }
      delete next[name as keyof RegisterFormValues]
      delete next.general
      return next
    })
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const validationErrors = validate(values)

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await register({
        first_name: values.firstName.trim(),
        last_name: values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        address: values.address.trim() || null,
      })
      setSubmittedUser(values)
    } catch (err: unknown) {
      if (isAxiosError(err)) {
        const serverMessage =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Registration failed. Please check your details and try again.'
        setErrors((prev) => ({
          ...prev,
          general:
            typeof serverMessage === 'string'
              ? serverMessage
              : 'Validation error from server.',
        }))
      } else {
        setErrors((prev) => ({
          ...prev,
          general: 'An unexpected error occurred. Please try again.',
        }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = () => {
    setValues(initialValues)
    setErrors({})
    setSubmittedUser(null)
  }

  const displayName =
    [submittedUser?.firstName.trim(), submittedUser?.lastName.trim()]
      .filter(Boolean)
      .join(' ') || 'Valued Customer'

  return (
    <div className="min-h-svh w-full bg-primary text-secondary flex flex-col">
      {/* Top-Left Brand Header & Theme Switcher */}
      <header className="w-full px-4 pt-5 pb-2 sm:px-8 sm:pt-7 md:px-12 flex items-center justify-between">
        <Link
          to="/"
          className="inline-block text-2xl sm:text-3xl font-bold tracking-[0.22em] uppercase text-secondary"
        >
          A<span className="text-action">R</span>QO
          <span className="text-action">R</span>A
        </Link>
        <ThemeSwitcher />
      </header>

      {/* Responsive Centered Form Container */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <main className="w-full max-w-md bg-surface border border-secondary/15 rounded-xl p-5 sm:p-8 md:p-9">
          {submittedUser ? (
            <div
              role="status"
              aria-live="polite"
              className="text-center space-y-4 py-4"
            >
              <div className="mx-auto w-11 h-11 rounded-full bg-action text-action-foreground flex items-center justify-center text-lg font-semibold">
                ✓
              </div>
              <h2 className="text-xl font-semibold text-secondary">
                Welcome, {displayName}
              </h2>
              <p className="text-sm text-secondary/65">
                Your account is registered with{' '}
                <span className="font-medium text-secondary">
                  {submittedUser.email}
                </span>
                .
              </p>

              {submittedUser.address.trim() && (
                <div className="text-left p-3.5 rounded-lg border border-secondary/15 bg-surface">
                  <span className="block text-[11px] font-medium uppercase tracking-wider text-secondary/50 mb-1">
                    Shipping Address
                  </span>
                  <p className="text-sm text-secondary">
                    {submittedUser.address}
                  </p>
                </div>
              )}

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/login')}
                  className="w-full py-2.5 px-4 rounded-md bg-action text-action-foreground text-sm font-medium hover:opacity-90 transition cursor-pointer"
                >
                  Proceed to Sign In
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full py-2 px-4 rounded-md border border-secondary/15 text-xs text-secondary/70 hover:text-secondary cursor-pointer"
                >
                  Register Another Account
                </button>
              </div>
            </div>
          ) : (
            <>
              <header className="mb-6">
                <h1 className="text-2xl font-semibold tracking-tight text-secondary">
                  Create Account
                </h1>
                <p className="mt-1 text-sm text-secondary/60">
                  Enter your details below to register.
                </p>
              </header>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                {errors.general && (
                  <div
                    role="alert"
                    className="p-3 rounded-md bg-action/10 border border-action text-xs font-semibold text-action"
                  >
                    ⚠ {errors.general}
                  </div>
                )}

                {/* First Name & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium text-secondary mb-1.5"
                    >
                      First Name <span className="text-action">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={values.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/35 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition"
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-xs text-action">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium text-secondary mb-1.5"
                    >
                      Last Name <span className="text-action">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={values.lastName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/35 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition"
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-xs text-action">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-secondary mb-1.5"
                  >
                    Email <span className="text-action">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="name@example.com"
                    value={values.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/35 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition"
                  />
                  {errors.email && (
                    <p
                      id="email-error"
                      role="alert"
                      className="mt-1.5 text-xs text-action"
                    >
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-secondary mb-1.5"
                  >
                    Password <span className="text-action">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="At least 6 characters"
                      value={values.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-3 pr-14 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/35 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-2.5 text-xs text-secondary/60 hover:text-secondary cursor-pointer"
                    >
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                  {errors.password && (
                    <p
                      id="password-error"
                      role="alert"
                      className="mt-1.5 text-xs text-action"
                    >
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label
                      htmlFor="address"
                      className="block text-xs font-medium text-secondary"
                    >
                      Address
                    </label>
                    <span className="text-[11px] text-secondary/45">
                      Optional
                    </span>
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    rows={2}
                    autoComplete="street-address"
                    placeholder="Street, city, postal code"
                    value={values.address}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/35 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition resize-none"
                  />
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full mt-2 py-2.5 px-4 rounded-md bg-action text-action-foreground text-sm font-medium hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
                >
                  {isSubmitting ? 'Creating account...' : 'Create Account'}
                </button>

                <p className="text-center text-xs text-secondary/60 pt-2">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-action font-medium hover:underline"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
