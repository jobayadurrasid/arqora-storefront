import { useMemo, useState } from 'react'
import type { OrderResponse } from '@/types/api'
import {
  buildSalesSeries,
  formatMoney,
  type SalesTimeframe,
} from '../../utils/adminAnalytics'

interface SalesTrendChartProps {
  orders: OrderResponse[]
  currency: string
}

export function SalesTrendChart({ orders, currency }: SalesTrendChartProps) {
  const [timeframe, setTimeframe] = useState<SalesTimeframe>('7d')
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue')
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  const series = useMemo(
    () => buildSalesSeries(orders, timeframe),
    [orders, timeframe]
  )

  const activePoint =
    hoveredIndex !== null && series[hoveredIndex] ? series[hoveredIndex] : null

  const totalPeriodRevenue = series.reduce((sum, p) => sum + p.revenue, 0)
  const totalPeriodOrders = series.reduce((sum, p) => sum + p.orders, 0)

  const maxValue = useMemo(() => {
    const rawMax = series.reduce(
      (max, p) => Math.max(max, metric === 'revenue' ? p.revenue : p.orders),
      0
    )
    if (rawMax <= 0) return metric === 'revenue' ? 100 : 5
    return rawMax * 1.15
  }, [series, metric])

  const width = 640
  const height = 240
  const padLeft = 56
  const padRight = 16
  const padTop = 18
  const padBottom = 34
  const plotWidth = width - padLeft - padRight
  const plotHeight = height - padTop - padBottom

  const barStep = series.length > 0 ? plotWidth / series.length : plotWidth
  const barWidth = Math.max(4, Math.min(28, barStep * 0.56))

  const linePoints = series
    .map((point, idx) => {
      const value = metric === 'revenue' ? point.revenue : point.orders
      const x = padLeft + idx * barStep + barStep / 2
      const y = padTop + plotHeight - (value / maxValue) * plotHeight
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const gridRatios = [0, 0.33, 0.66, 1]
  const labelStride =
    series.length <= 10 ? 1 : series.length <= 20 ? 3 : Math.ceil(series.length / 7)

  return (
    <section className="p-6 border border-secondary/15 rounded-xl bg-surface flex flex-col justify-between">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
            Sales Performance
          </h2>
          <div className="mt-1 flex items-baseline gap-3 flex-wrap">
            <span className="text-xl font-bold text-secondary">
              {activePoint
                ? metric === 'revenue'
                  ? formatMoney(activePoint.revenue, currency)
                  : `${activePoint.orders} order${activePoint.orders === 1 ? '' : 's'}`
                : metric === 'revenue'
                ? formatMoney(totalPeriodRevenue, currency)
                : `${totalPeriodOrders} order${totalPeriodOrders === 1 ? '' : 's'}`}
            </span>
            <span className="text-xs text-secondary/60">
              {activePoint
                ? `${activePoint.label} • ${activePoint.orders} orders (${formatMoney(activePoint.revenue, currency)})`
                : `${timeframe === '7d' ? 'Last 7 days' : timeframe === '30d' ? 'Last 30 days' : 'All recorded days'} • ${totalPeriodOrders} valid orders`}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Metric toggle */}
          <div className="flex items-center border border-secondary/15 p-0.5 rounded-lg bg-muted">
            <button
              type="button"
              onClick={() => setMetric('revenue')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                metric === 'revenue'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-secondary/70 hover:text-secondary'
              }`}
            >
              Revenue
            </button>
            <button
              type="button"
              onClick={() => setMetric('orders')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                metric === 'orders'
                  ? 'bg-secondary text-secondary-foreground'
                  : 'text-secondary/70 hover:text-secondary'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Timeframe toggle */}
          <div className="flex items-center border border-secondary/15 p-0.5 rounded-lg bg-muted">
            {(['7d', '30d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf)
                  setHoveredIndex(null)
                }}
                className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase transition cursor-pointer ${
                  timeframe === tf
                    ? 'bg-action text-action-foreground'
                    : 'text-secondary/70 hover:text-secondary'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Area */}
      {series.length === 0 ? (
        <div className="h-56 rounded-lg border border-secondary/10 bg-muted flex flex-col items-center justify-center text-center px-4">
          <p className="text-xs font-semibold text-secondary">
            No sales data recorded yet
          </p>
          <p className="mt-1 text-[11px] text-secondary/55">
            Completed and pending customer orders will appear on this chart.
          </p>
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Sales performance chart"
            className="w-full h-56 sm:h-64 select-none"
            onMouseLeave={() => setHoveredIndex(null)}
          >
            {/* Horizontal grid lines & Y labels */}
            {gridRatios.map((ratio) => {
              const y = padTop + plotHeight - ratio * plotHeight
              const tickVal = maxValue * ratio
              const tickLabel =
                metric === 'revenue'
                  ? tickVal >= 1000
                    ? `${(tickVal / 1000).toFixed(1)}k`
                    : tickVal.toFixed(0)
                  : Math.round(tickVal).toString()

              return (
                <g key={ratio}>
                  <line
                    x1={padLeft}
                    y1={y}
                    x2={width - padRight}
                    y2={y}
                    stroke="var(--theme-secondary)"
                    strokeOpacity={ratio === 0 ? 0.2 : 0.09}
                    strokeDasharray={ratio === 0 ? undefined : '4 4'}
                  />
                  <text
                    x={padLeft - 8}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="10"
                    fill="var(--theme-secondary)"
                    fillOpacity="0.55"
                  >
                    {tickLabel}
                  </text>
                </g>
              )
            })}

            {/* Bars */}
            {series.map((point, idx) => {
              const value = metric === 'revenue' ? point.revenue : point.orders
              const barHeight = Math.max(
                value > 0 ? 3 : 0,
                (value / maxValue) * plotHeight
              )
              const xCenter = padLeft + idx * barStep + barStep / 2
              const x = xCenter - barWidth / 2
              const y = padTop + plotHeight - barHeight
              const isHovered = hoveredIndex === idx
              const isDimmed = hoveredIndex !== null && !isHovered

              return (
                <g
                  key={point.dateKey}
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onFocus={() => setHoveredIndex(idx)}
                  tabIndex={0}
                  aria-label={`${point.label}: ${formatMoney(point.revenue, currency)}, ${point.orders} orders`}
                >
                  {/* Invisible full-height hit target */}
                  <rect
                    x={padLeft + idx * barStep}
                    y={padTop}
                    width={barStep}
                    height={plotHeight}
                    fill="transparent"
                  />
                  <rect
                    x={x}
                    y={y}
                    width={barWidth}
                    height={barHeight}
                    rx={3}
                    fill="var(--theme-action)"
                    fillOpacity={isDimmed ? 0.35 : 0.9}
                  />
                  {(idx % labelStride === 0 || idx === series.length - 1) && (
                    <text
                      x={xCenter}
                      y={height - 10}
                      textAnchor="middle"
                      fontSize="10"
                      fill="var(--theme-secondary)"
                      fillOpacity={isHovered ? 1 : 0.55}
                      fontWeight={isHovered ? 700 : 400}
                    >
                      {point.label}
                    </text>
                  )}
                </g>
              )
            })}

            {/* Subtle Trend Line & Nodes */}
            {series.length > 1 && (
              <>
                <polyline
                  fill="none"
                  stroke="var(--theme-secondary)"
                  strokeOpacity="0.45"
                  strokeWidth="1.5"
                  points={linePoints}
                  pointerEvents="none"
                />
                {series.map((point, idx) => {
                  const value = metric === 'revenue' ? point.revenue : point.orders
                  const cx = padLeft + idx * barStep + barStep / 2
                  const cy = padTop + plotHeight - (value / maxValue) * plotHeight
                  const isHovered = hoveredIndex === idx
                  return (
                    <circle
                      key={`dot-${point.dateKey}`}
                      cx={cx}
                      cy={cy}
                      r={isHovered ? 4 : 2.2}
                      fill="var(--theme-surface)"
                      stroke="var(--theme-secondary)"
                      strokeWidth={isHovered ? 2 : 1.5}
                      pointerEvents="none"
                    />
                  )
                })}
              </>
            )}
          </svg>
        </div>
      )}
    </section>
  )
}
