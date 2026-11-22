import { useState, useEffect } from 'react'
import { Link } from 'react-router'
import config from '@/config/config'
import { ordersApi } from '../api/orders.api'
import { useAuth } from '@/stores/authContextDef'
import type { OrderResponse } from '@/types/api'

export function OrdersPage() {
  const { isAuthenticated } = useAuth()
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(isAuthenticated)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) return

    let isMounted = true
    const fetchOrders = async () => {
      try {
        const data = await ordersApi.listOrders(1, 20)
        if (isMounted) {
          setOrders(data.items || [])
        }
      } catch (err) {
        console.error(err)
        if (isMounted) {
          setError('Failed to load orders.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchOrders()
    return () => {
      isMounted = false
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 border border-secondary/15 rounded-xl text-center bg-surface">
        <h2 className="text-xl font-bold text-secondary">Sign in to View Orders</h2>
        <p className="mt-2 text-sm text-secondary/60">
          Track and review your past order purchases.
        </p>
        <Link
          to="/login?redirect=/orders"
          className="mt-6 inline-block w-full py-2.5 px-4 rounded-md bg-action text-action-foreground font-semibold text-sm hover:opacity-90 transition"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="border-b border-secondary/10 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-secondary">
          My Orders
        </h1>
        <p className="text-xs text-secondary/60 mt-1">
          Review your order history, delivery statuses, and invoices.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-secondary/60">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12 text-sm text-action font-semibold">
          {error}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 border border-secondary/10 rounded-xl bg-surface">
          <h2 className="text-base font-semibold text-secondary">No Orders Yet</h2>
          <p className="text-xs text-secondary/50 mt-1">
            When you purchase items from Arqora, they will appear here.
          </p>
          <Link
            to="/"
            className="mt-5 inline-block px-4 py-2 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold"
          >
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 border border-secondary/15 rounded-xl bg-surface transition hover:border-secondary/30"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-secondary/10 gap-2">
                <div>
                  <span className="text-xs font-semibold text-secondary/50 uppercase tracking-wider">
                    Order #{order.order_number}
                  </span>
                  <p className="text-xs text-secondary/50 mt-0.5">
                    Placed on {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      order.status === 'paid'
                        ? 'bg-success/10 text-success border border-success/30'
                        : order.status === 'cancelled'
                        ? 'bg-danger/10 text-danger border border-danger/30'
                        : 'bg-action/10 text-action border border-action/30'
                    }`}
                  >
                    {order.status}
                  </span>
                  <Link
                    to={`/orders/${order.id}`}
                    className="text-xs font-semibold text-secondary underline hover:text-action"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row justify-between text-xs text-secondary/70 gap-2">
                <div>
                  <span className="font-semibold text-secondary">
                    Shipping Address:
                  </span>{' '}
                  {order.shipping_address}
                </div>
                <div>
                  <span className="font-semibold text-secondary">Total:</span>{' '}
                  <span className="text-sm font-bold text-secondary">
                    {config.app.currency} {Number(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
