import { useState } from 'react'
import type { OrderStatus } from '@/types/api'
import { formatMoney, type StatusSummary } from '../../utils/adminAnalytics'

interface OrderStatusChartProps {
  breakdown: StatusSummary[]
  totalOrders: number
  currency: string
}

const STATUS_CSS_VARS: Record<OrderStatus, string> = {
  paid: 'var(--theme-success)',
  pending: 'var(--theme-action)',
  cancelled: 'var(--theme-danger)',
  failed: 'var(--theme-secondary)',
}

export function OrderStatusChart({
  breakdown,
  totalOrders,
  currency,
}: OrderStatusChartProps) {
  const [hoveredStatus, setHoveredStatus] = useState<OrderStatus | null>(null)

  const radius = 64
  const circumference = 2 * Math.PI * radius
  const totalCountInSample = breakdown.reduce((sum, item) => sum + item.count, 0)

  const segments = breakdown.reduce<
    Array<StatusSummary & { dashArray: string; dashOffset: number }>
  >((acc, item) => {
    const previousFraction = acc.reduce(
      (sum, seg) =>
        sum + (totalCountInSample > 0 ? seg.count / totalCountInSample : 0),
      0
    )
    const fraction =
      totalCountInSample > 0 ? item.count / totalCountInSample : 0
    const length = fraction * circumference
    const offset = -previousFraction * circumference

    return [
      ...acc,
      {
        ...item,
        dashArray: `${length} ${circumference}`,
        dashOffset: offset,
      },
    ]
  }, [])

  const activeSummary = hoveredStatus
    ? breakdown.find((b) => b.status === hoveredStatus)
    : null

  return (
    <section className="p-6 border border-secondary/15 rounded-xl bg-surface flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
          Order Breakdown
        </h2>
        <p className="text-xs text-secondary/60 mt-0.5">
          Distribution by fulfillment &amp; payment status
        </p>
      </div>

      {/* Donut SVG */}
      <div className="my-6 flex items-center justify-center">
        <div className="relative w-44 h-44">
          <svg
            viewBox="0 0 180 180"
            role="img"
            aria-label="Order status distribution donut chart"
            className="w-full h-full -rotate-90"
            onMouseLeave={() => setHoveredStatus(null)}
          >
            <circle
              cx="90"
              cy="90"
              r={radius}
              fill="none"
              stroke="var(--theme-muted)"
              strokeWidth="18"
            />
            {totalCountInSample > 0 &&
              segments.map((seg) =>
                seg.count > 0 ? (
                  <circle
                    key={seg.status}
                    cx="90"
                    cy="90"
                    r={radius}
                    fill="none"
                    stroke={STATUS_CSS_VARS[seg.status]}
                    strokeOpacity={
                      hoveredStatus && hoveredStatus !== seg.status
                        ? 0.3
                        : seg.status === 'failed'
                        ? 0.55
                        : 1
                    }
                    strokeWidth={hoveredStatus === seg.status ? 22 : 18}
                    strokeDasharray={seg.dashArray}
                    strokeDashoffset={seg.dashOffset}
                    className="transition-all cursor-pointer"
                    onMouseEnter={() => setHoveredStatus(seg.status)}
                  />
                ) : null
              )}
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-2xl font-bold text-secondary">
              {activeSummary ? activeSummary.count : totalOrders}
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary/60">
              {activeSummary ? activeSummary.label : 'Total Orders'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {breakdown.map((item) => {
          const isHovered = hoveredStatus === item.status
          return (
            <div
              key={item.status}
              onMouseEnter={() => setHoveredStatus(item.status)}
              onMouseLeave={() => setHoveredStatus(null)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition cursor-pointer ${
                isHovered ? 'bg-muted' : 'hover:bg-muted/60'
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: STATUS_CSS_VARS[item.status],
                    opacity: item.status === 'failed' ? 0.55 : 1,
                  }}
                />
                <span className="font-semibold text-secondary">
                  {item.label}
                </span>
                <span className="text-secondary/50">({item.percentage}%)</span>
              </div>

              <div className="text-right">
                <span className="font-bold text-secondary mr-2">
                  {item.count}
                </span>
                <span className="text-[11px] text-secondary/55">
                  {formatMoney(item.revenue, currency)}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
