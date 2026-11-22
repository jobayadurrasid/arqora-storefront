import { useState, type FormEvent } from 'react'
import { useNavigate, Link } from 'react-router'
import config from '@/config/config'
import { useAuth } from '@/stores/authContextDef'
import { useCart, type CartItem } from '@/stores/cartContextDef'
import { ordersApi } from '@/features/orders/api/orders.api'
import { paymentsApi } from '@/features/checkout/api/payments.api'
import type { PaymentProvider } from '@/types/api'

export function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart()
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const [shippingAddress, setShippingAddress] = useState(user?.address || '')
  const [provider, setProvider] = useState<PaymentProvider>('stripe')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-secondary/15 rounded-xl text-center bg-surface">
        <h2 className="text-xl font-bold text-secondary">Sign in to Checkout</h2>
        <p className="mt-2 text-sm text-secondary/60">
          Please log in to your Arqora account to place your order.
        </p>
        <Link
          to="/login?redirect=/checkout"
          className="mt-6 inline-block w-full py-2.5 px-4 rounded-md bg-action text-action-foreground font-semibold text-sm hover:opacity-90 transition"
        >
          Sign In
        </Link>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-secondary/15 rounded-xl text-center bg-surface">
        <h2 className="text-xl font-bold text-secondary">No Items to Checkout</h2>
        <p className="mt-2 text-sm text-secondary/60">Your cart is currently empty.</p>
        <Link
          to="/"
          className="mt-6 inline-block px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold"
        >
          Return to Store
        </Link>
      </div>
    )
  }

  const estimatedTax = subtotal * 0.05
  const estimatedTotal = subtotal + estimatedTax

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault()
    if (!shippingAddress.trim()) {
      setErrorMessage('Please provide a valid shipping address.')
      return
    }

    setErrorMessage(null)
    setIsSubmitting(true)

    try {
      // 1. Create order
      const orderPayload = {
        items: items.map((i: CartItem) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        shipping_address: shippingAddress.trim(),
      }

      const order = await ordersApi.createOrder(orderPayload)

      // 2. Initiate checkout payment with chosen provider
      const checkoutRes = await paymentsApi.checkout({
        order_id: order.id,
        provider,
        currency: config.app.currency,
        return_url: `${window.location.origin}/orders/${order.id}`,
      })

      clearCart()

      // 3. Handle provider redirect if returned
      if (checkoutRes.checkout_url) {
        window.location.href = checkoutRes.checkout_url
      } else {
        navigate(`/orders/${order.id}`)
      }
    } catch (err: unknown) {
      console.error(err)
      setErrorMessage(
        'Failed to process checkout. Please verify item quantities and address.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-secondary/10 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
          Checkout
        </h1>
        <p className="text-xs text-secondary/60 mt-1">
          Complete your purchase securely.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <form onSubmit={handlePlaceOrder} className="lg:col-span-7 space-y-6">
          {errorMessage && (
            <div
              role="alert"
              className="p-3.5 rounded-md bg-action/10 border border-action text-xs font-semibold text-action"
            >
              ⚠ {errorMessage}
            </div>
          )}

          {/* Customer Info */}
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
              1. Customer Information
            </h2>
            <div className="text-xs text-secondary/70 space-y-1">
              <p>
                <strong>Name:</strong> {user?.first_name} {user?.last_name}
              </p>
              <p>
                <strong>Email:</strong> {user?.email}
              </p>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
              2. Shipping Address <span className="text-action">*</span>
            </h2>
            <textarea
              rows={3}
              required
              value={shippingAddress}
              onChange={(e) => setShippingAddress(e.target.value)}
              placeholder="Full street address, apartment/suite, city, state, postal code"
              className="w-full px-3.5 py-2.5 text-sm bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
            />
          </div>

          {/* Payment Method Selection */}
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
              3. Payment Provider <span className="text-action">*</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition ${
                  provider === 'stripe'
                    ? 'border-secondary bg-muted'
                    : 'border-secondary/15 hover:border-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-secondary">
                    Stripe (Cards)
                  </span>
                  <input
                    type="radio"
                    name="provider"
                    value="stripe"
                    checked={provider === 'stripe'}
                    onChange={() => setProvider('stripe')}
                    className="accent-action"
                  />
                </div>
                <p className="mt-2 text-[11px] text-secondary/60">
                  Credit/Debit Card (Visa, Mastercard, Amex)
                </p>
              </label>

              <label
                className={`p-4 rounded-lg border cursor-pointer flex flex-col justify-between transition ${
                  provider === 'bkash'
                    ? 'border-secondary bg-muted'
                    : 'border-secondary/15 hover:border-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-secondary">
                    bKash
                  </span>
                  <input
                    type="radio"
                    name="provider"
                    value="bkash"
                    checked={provider === 'bkash'}
                    onChange={() => setProvider('bkash')}
                    className="accent-action"
                  />
                </div>
                <p className="mt-2 text-[11px] text-secondary/60">
                  Mobile Wallet payment gateway
                </p>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-6 rounded-md bg-action text-action-foreground font-bold text-sm tracking-wide uppercase hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
          >
            {isSubmitting ? 'Processing Order...' : `Pay ${config.app.currency} ${estimatedTotal.toFixed(2)}`}
          </button>
        </form>

        {/* Right side summary */}
        <div className="lg:col-span-5">
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
              Items ({items.length})
            </h2>

            <div className="divide-y divide-secondary/10 max-h-72 overflow-y-auto mb-4">
              {items.map(({ product, quantity }: CartItem) => (
                <div key={product.id} className="py-2.5 flex justify-between text-xs">
                  <div>
                    <span className="font-semibold text-secondary">
                      {product.name}
                    </span>
                    <span className="text-secondary/50 block">Qty: {quantity}</span>
                  </div>
                  <span className="font-bold text-secondary">
                    {config.app.currency} {(Number(product.price) * quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-t border-secondary/10 pt-4 text-xs text-secondary/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{config.app.currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Tax (5%)</span>
                <span>{config.app.currency} {estimatedTax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span>Shipping</span>
                <span>Free</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 border-t border-secondary/10 text-base font-bold text-secondary mt-3">
              <span>Total</span>
              <span className="text-xl">{config.app.currency} {estimatedTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
