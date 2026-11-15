import { useState, type FormEvent, type ChangeEvent } from 'react'
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

  const validate = (formValues: RegisterFormValues): RegisterFormErrors => {
    const nextErrors: RegisterFormErrors = {}

    const hasFirstName = formValues.firstName.trim().length > 0
    const hasLastName = formValues.lastName.trim().length > 0

    if (!hasFirstName && !hasLastName) {
      nextErrors.name = 'Please enter at least a first name or a last name.'
    }

    const emailTrimmed = formValues.email.trim()
    if (!emailTrimmed) {
      nextErrors.email = 'Email address is required.'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      nextErrors.email = 'Please enter a valid email address.'
    }

    if (!formValues.password) {
      nextErrors.password = 'Password is required.'
    } else if (formValues.password.length < 8) {
      nextErrors.password = 'Password must be at least 8 characters long.'
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
      if (name === 'firstName' || name === 'lastName') {
        delete next.name
      } else {
        delete next[name as keyof RegisterFormValues]
      }
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

    await new Promise((resolve) => setTimeout(resolve, 500))

    setIsSubmitting(false)
    setSubmittedUser(values)
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
    <div className="min-h-svh w-full bg-[#ffffff] text-[#000000] flex flex-col">
      {/* Top-Left Brand Header (in-flow so it never overlaps on mobile/short screens) */}
      <header className="w-full px-4 pt-5 pb-2 sm:px-8 sm:pt-7 md:px-12">
        <a
          href="/"
          onClick={(e) => e.preventDefault()}
          className="inline-block text-2xl sm:text-3xl font-bold tracking-[0.22em] uppercase text-[#000000]"
        >
          A
          <span className='text-[#d07601]'>R</span>QO<span className='text-[#d07601]'>R</span>A
        </a>
      </header>

      {/* Responsive Centered Form Container */}
      <div className="flex-1 w-full flex items-center justify-center px-4 py-6 sm:px-6 sm:py-10">
        <main className="w-full max-w-md bg-[#ffffff] border border-[#000000]/15 rounded-xl p-5 sm:p-8 md:p-9">
        {submittedUser ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center space-y-4 py-4"
          >
            <div className="mx-auto w-11 h-11 rounded-full bg-[#d07601] text-[#ffffff] flex items-center justify-center text-lg font-semibold">
              ✓
            </div>
            <h2 className="text-xl font-semibold text-[#000000]">
              Welcome, {displayName}
            </h2>
            <p className="text-sm text-[#000000]/65">
              Your account is registered with{' '}
              <span className="font-medium text-[#000000]">
                {submittedUser.email}
              </span>
              .
            </p>

            {submittedUser.address.trim() && (
              <div className="text-left p-3.5 rounded-lg border border-[#000000]/15 bg-[#ffffff]">
                <span className="block text-[11px] font-medium uppercase tracking-wider text-[#000000]/50 mb-1">
                  Shipping Address
                </span>
                <p className="text-sm text-[#000000]">
                  {submittedUser.address}
                </p>
              </div>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-md bg-[#d07601] text-[#ffffff] text-sm font-medium hover:opacity-90 transition cursor-pointer"
            >
              Back to Registration
            </button>
          </div>
        ) : (
          <>
            <header className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-[#000000]">
                Create Account
              </h1>
              <p className="mt-1 text-sm text-[#000000]/60">
                Enter your details below to register.
              </p>
            </header>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* First Name & Last Name */}
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-xs font-medium text-[#000000] mb-1.5"
                    >
                      First Name <span className="text-[#d07601]">*</span>
                    </label>
                    <input
                      id="firstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      placeholder="First name"
                      value={values.firstName}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className="w-full px-3 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-xs font-medium text-[#000000] mb-1.5"
                    >
                      Last Name <span className="text-[#d07601]">*</span>
                    </label>
                    <input
                      id="lastName"
                      name="lastName"
                      type="text"
                      autoComplete="family-name"
                      placeholder="Last name"
                      value={values.lastName}
                      onChange={handleChange}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      className="w-full px-3 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition"
                    />
                  </div>
                </div>

                {errors.name ? (
                  <p
                    id="name-error"
                    role="alert"
                    className="mt-1.5 text-xs text-[#d07601]"
                  >
                    {errors.name}
                  </p>
                ) : (
                  <p className="mt-1 text-[11px] text-[#000000]/50">
                    Either first name or last name is required.
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-xs font-medium text-[#000000] mb-1.5"
                >
                  Email <span className="text-[#d07601]">*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={values.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                  className="w-full px-3 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition"
                />
                {errors.email && (
                  <p
                    id="email-error"
                    role="alert"
                    className="mt-1.5 text-xs text-[#d07601]"
                  >
                    {errors.email}
                  </p>
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
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    value={values.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={
                      errors.password ? 'password-error' : undefined
                    }
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
                  <p
                    id="password-error"
                    role="alert"
                    className="mt-1.5 text-xs text-[#d07601]"
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
                    className="block text-xs font-medium text-[#000000]"
                  >
                    Address
                  </label>
                  <span className="text-[11px] text-[#000000]/45">
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
                  className="w-full px-3 py-2 text-sm bg-[#ffffff] text-[#000000] placeholder:text-[#000000]/35 border border-[#000000]/20 rounded-md focus:outline-none focus:border-[#000000] transition resize-none"
                />
              </div>

              {/* Simple Orange Button (#d07601) */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-2.5 px-4 rounded-md bg-[#d07601] text-[#ffffff] text-sm font-medium hover:opacity-90 disabled:opacity-50 transition cursor-pointer"
              >
                {isSubmitting ? 'Creating account...' : 'Create Account'}
              </button>

              <p className="text-center text-xs text-[#000000]/60 pt-2">
                Already have an account?{' '}
                <a
                  href="#sign-in"
                  onClick={(e) => e.preventDefault()}
                  className="text-[#d07601] font-medium hover:underline"
                >
                  Sign in
                </a>
              </p>
            </form>
          </>
        )}
        </main>
      </div>
    </div>
  )
}
