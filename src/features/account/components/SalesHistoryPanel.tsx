import { useMemo, useState } from 'react'
import type { OrderResponse, OrderStatus, ProductResponse } from '@/types/api'
import { formatMoney, toAmount } from '../utils/adminAnalytics'

interface SalesHistoryPanelProps {
  orders: OrderResponse[]
  productsById: Record<string, ProductResponse>
  currency: string
  isLoading: boolean
  onCancelOrder: (orderId: string) => Promise<void>
}

const STATUS_FILTERS: Array<{ value: 'all' | OrderStatus; label: string }> = [
  { value: 'all', label: 'All' },
  { value: 'paid', label: 'Paid' },
  { value: 'pending', label: 'Pending' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'failed', label: 'Failed' },
]

export function SalesHistoryPanel({
  orders,
  productsById,
  currency,
  isLoading,
  onCancelOrder,
}: SalesHistoryPanelProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  const filteredOrders = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    return orders.filter((order) => {
      if (statusFilter !== 'all' && order.status !== statusFilter) {
        return false
      }
      if (!query) return true
      return (
        order.order_number.toLowerCase().includes(query) ||
        order.shipping_address.toLowerCase().includes(query) ||
        order.id.toLowerCase().includes(query)
      )
    })
  }, [orders, searchQuery, statusFilter])

  const filteredRevenue = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status !== 'cancelled' && o.status !== 'failed')
        .reduce((sum, o) => sum + toAmount(o.total_amount), 0),
    [filteredOrders]
  )

  const handleCancelClick = async (orderId: string) => {
    setCancellingId(orderId)
    try {
      await onCancelOrder(orderId)
    } finally {
      setCancellingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="p-4 border border-secondary/15 rounded-xl bg-surface flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                statusFilter === f.value
                  ? 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-secondary/70 hover:text-secondary'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by order #, ID or address..."
          className="w-full md:w-72 px-3.5 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
        />
      </div>

      {/* Summary Strip */}
      <div className="flex flex-wrap items-center justify-between text-xs text-secondary/70 px-1 gap-2">
        <span>
          Showing <strong className="text-secondary">{filteredOrders.length}</strong>{' '}
          of {orders.length} orders
        </span>
        <span>
          Filtered active sales:{' '}
          <strong className="text-secondary">
            {formatMoney(filteredRevenue, currency)}
          </strong>
        </span>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="py-16 text-center text-xs text-secondary/60">
          Loading sales history...
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-10 border border-secondary/15 rounded-xl text-center bg-surface">
          <p className="text-sm font-semibold text-secondary">
            No matching orders found
          </p>
          <p className="mt-1 text-xs text-secondary/55">
            Try clearing your search or selecting a different status filter.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-xl bg-surface overflow-hidden">
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrderId === order.id
            const itemCount = (order.items || []).reduce(
              (sum, i) => sum + (i.quantity || 0),
              0
            )

            return (
              <div key={order.id} className="p-4 sm:p-5 transition hover:bg-muted/40">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="text-sm font-bold text-secondary">
                        Order #{order.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          order.status === 'paid'
                            ? 'bg-success/10 text-success border-success/30'
                            : order.status === 'cancelled' || order.status === 'failed'
                            ? 'bg-danger/10 text-danger border-danger/30'
                            : 'bg-action/10 text-action border-action/30'
                        }`}
                      >
                        {order.status}
                      </span>
                      <span className="text-xs text-secondary/55">
                        {new Date(order.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-secondary/65">
                      <span className="font-semibold text-secondary">Ship to:</span>{' '}
                      {order.shipping_address} • {itemCount}{' '}
                      {itemCount === 1 ? 'unit' : 'units'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-sm font-bold text-secondary">
                      {formatMoney(toAmount(order.total_amount), currency)}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedOrderId(isExpanded ? null : order.id)
                      }
                      className="px-3 py-1.5 rounded-md border border-secondary/20 text-xs font-semibold text-secondary hover:border-secondary transition cursor-pointer"
                    >
                      {isExpanded ? 'Hide Items' : 'View Items'}
                    </button>

                    {order.status === 'pending' && (
                      <button
                        type="button"
                        disabled={cancellingId === order.id}
                        onClick={() => handleCancelClick(order.id)}
                        className="px-3 py-1.5 rounded-md border border-danger/40 text-xs font-semibold text-danger hover:bg-danger hover:text-danger-foreground disabled:opacity-40 transition cursor-pointer"
                      >
                        {cancellingId === order.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Line Items */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-secondary/10 space-y-3">
                    <div className="rounded-lg border border-secondary/10 bg-primary divide-y divide-secondary/10">
                      {(order.items || []).length === 0 ? (
                        <p className="p-3 text-xs text-secondary/55">
                          No line items returned for this order.
                        </p>
                      ) : (
                        order.items.map((item) => {
                          const prod = productsById[item.product_id]
                          return (
                            <div
                              key={item.id}
                              className="p-3 flex items-center justify-between text-xs gap-4"
                            >
                              <div>
                                <span className="font-semibold text-secondary block">
                                  {prod?.name || `Product ${item.product_id}`}
                                </span>
                                <span className="text-secondary/55">
                                  {prod?.sku ? `SKU: ${prod.sku} • ` : ''}Qty:{' '}
                                  {item.quantity} ×{' '}
                                  {formatMoney(toAmount(item.unit_price), currency)}
                                </span>
                              </div>
                              <span className="font-bold text-secondary shrink-0">
                                {formatMoney(toAmount(item.subtotal), currency)}
                              </span>
                            </div>
                          )
                        })
                      )}
                    </div>

                    <div className="flex flex-wrap justify-end gap-6 text-xs text-secondary/70 px-1">
                      <span>
                        Subtotal:{' '}
                        <strong className="text-secondary">
                          {formatMoney(toAmount(order.subtotal), currency)}
                        </strong>
                      </span>
                      <span>
                        Tax:{' '}
                        <strong className="text-secondary">
                          {formatMoney(toAmount(order.tax), currency)}
                        </strong>
                      </span>
                      <span>
                        Total:{' '}
                        <strong className="text-secondary">
                          {formatMoney(toAmount(order.total_amount), currency)}
                        </strong>
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
