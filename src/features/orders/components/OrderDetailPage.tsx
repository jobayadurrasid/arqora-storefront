import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import config from '@/config/config'
import { ordersApi } from '../api/orders.api'
import type { OrderResponse } from '../../../types/api'

export function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCancelling, setIsCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!orderId) return
    const fetchOrder = async () => {
      setIsLoading(true)
      try {
        const data = await ordersApi.getOrder(orderId)
        setOrder(data)
      } catch (err) {
        console.error(err)
        setError('Failed to load order.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchOrder()
  }, [orderId])

  const handleCancel = async () => {
    if (!orderId || !window.confirm('Are you sure you want to cancel this order?'))
      return
    setIsCancelling(true)
    try {
      const updated = await ordersApi.cancelOrder(orderId)
      setOrder(updated)
    } catch (err) {
      alert('Could not cancel this order.')
      console.error(err)
    } finally {
      setIsCancelling(false)
    }
  }

  if (isLoading) {
    return (
      <div className="py-20 text-center">
        <div className="inline-block w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-secondary/60">Loading order...</p>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-secondary">Order Not Found</h2>
        <Link
          to="/orders"
          className="mt-4 inline-block px-4 py-2 bg-secondary text-secondary-foreground text-xs font-semibold rounded-md"
        >
          Back to Orders
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-secondary/10 gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-action">
            Order #{order.order_number}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary mt-1">
            Order Confirmation
          </h1>
          <p className="text-xs text-secondary/50 mt-1">
            Placed on {new Date(order.created_at).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              order.status === 'paid'
                ? 'bg-success/10 text-success'
                : order.status === 'cancelled'
                ? 'bg-danger/10 text-danger'
                : 'bg-action/10 text-action'
            }`}
          >
            {order.status}
          </span>
          {order.status === 'pending' && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-3 py-1 text-xs font-semibold rounded-md border border-danger text-danger hover:bg-danger hover:text-danger-foreground transition cursor-pointer"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
            Items Ordered
          </h2>

          <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-xl bg-surface">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="p-4 flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-semibold text-secondary">
                    Product ID: {item.product_id}
                  </p>
                  <p className="text-secondary/50 mt-0.5">
                    Qty: {item.quantity} × {config.app.currency} {Number(item.unit_price).toFixed(2)}
                  </p>
                </div>
                <span className="font-bold text-sm text-secondary">
                  {config.app.currency} {Number(item.subtotal).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 border border-secondary/15 rounded-xl bg-surface">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">
              Delivery Address
            </h3>
            <p className="text-xs text-secondary/70">{order.shipping_address}</p>
          </div>
        </div>

        {/* Invoice Summary */}
        <div>
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface space-y-3 text-xs">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-2">
              Payment Breakdown
            </h2>

            <div className="flex justify-between text-secondary/70">
              <span>Subtotal</span>
              <span className="font-semibold text-secondary">
                {config.app.currency} {Number(order.subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-secondary/70">
              <span>Tax</span>
              <span className="font-semibold text-secondary">
                {config.app.currency} {Number(order.tax).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-secondary/70">
              <span>Shipping</span>
              <span className="font-semibold text-success">Free</span>
            </div>

            <div className="pt-3 border-t border-secondary/10 flex justify-between items-baseline text-sm font-bold text-secondary">
              <span>Total</span>
              <span className="text-base">
                {config.app.currency} {Number(order.total_amount).toFixed(2)}
              </span>
            </div>
          </div>

          <div className="mt-4">
            <Link
              to="/orders"
              className="block w-full py-2.5 text-center text-xs font-semibold rounded-md border border-secondary/20 text-secondary hover:bg-secondary hover:text-secondary-foreground transition"
            >
              ← Back to All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
