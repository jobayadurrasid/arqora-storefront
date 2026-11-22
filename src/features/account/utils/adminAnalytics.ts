import type {
  CategoryResponse,
  OrderResponse,
  OrderStatus,
  ProductResponse,
} from '@/types/api'

export type SalesTimeframe = '7d' | '30d' | 'all'

export interface SalesSeriesPoint {
  dateKey: string
  label: string
  revenue: number
  orders: number
}

export interface StatusSummary {
  status: OrderStatus
  label: string
  count: number
  revenue: number
  percentage: number
}

export interface CategoryStat {
  id: string
  name: string
  productCount: number
  stockUnits: number
  lowStockCount: number
}

export interface TopProductStat {
  productId: string
  name: string
  sku?: string
  unitsSold: number
  revenue: number
}

export interface DashboardMetrics {
  paidRevenue: number
  pendingRevenue: number
  totalSalesRevenue: number
  totalOrders: number
  avgOrderValue: number
  paidRate: number
  totalProducts: number
  activeProducts: number
  totalStockUnits: number
  inventoryValue: number
  lowStockProducts: ProductResponse[]
  outOfStockProducts: ProductResponse[]
  totalCategories: number
  activeCategories: number
  categoryDistribution: CategoryStat[]
  statusBreakdown: StatusSummary[]
  topProducts: TopProductStat[]
}

export function toAmount(value: string | number | null | undefined): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

export function formatMoney(amount: number, currency: string): string {
  const safe = Number.isFinite(amount) ? amount : 0
  return `${currency} ${safe.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function computeDashboardMetrics(
  products: ProductResponse[],
  productsTotal: number,
  categories: CategoryResponse[],
  orders: OrderResponse[],
  ordersTotal: number
): DashboardMetrics {
  const paidOrders = orders.filter((o) => o.status === 'paid')
  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const nonCancelledOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'failed'
  )

  const paidRevenue = paidOrders.reduce(
    (sum, o) => sum + toAmount(o.total_amount),
    0
  )
  const pendingRevenue = pendingOrders.reduce(
    (sum, o) => sum + toAmount(o.total_amount),
    0
  )
  const totalSalesRevenue = paidRevenue + pendingRevenue

  const totalOrdersCount = Math.max(ordersTotal, orders.length)
  const avgOrderValue =
    nonCancelledOrders.length > 0
      ? totalSalesRevenue / nonCancelledOrders.length
      : 0
  const paidRate =
    orders.length > 0
      ? Math.round((paidOrders.length / orders.length) * 100)
      : 0

  const totalProducts = Math.max(productsTotal, products.length)
  const activeProducts = products.filter((p) => p.is_active).length
  const totalStockUnits = products.reduce((sum, p) => sum + (p.stock || 0), 0)
  const inventoryValue = products.reduce(
    (sum, p) => sum + toAmount(p.price) * (p.stock || 0),
    0
  )
  const lowStockProducts = products.filter((p) => p.stock > 0 && p.stock <= 5)
  const outOfStockProducts = products.filter((p) => p.stock === 0)

  const totalCategories = categories.length
  const activeCategories = categories.filter((c) => c.is_active).length

  const categoryMap = new Map<string, CategoryStat>()
  for (const cat of categories) {
    categoryMap.set(cat.id, {
      id: cat.id,
      name: cat.name,
      productCount: 0,
      stockUnits: 0,
      lowStockCount: 0,
    })
  }

  for (const product of products) {
    const existing = categoryMap.get(product.category_id)
    if (existing) {
      existing.productCount += 1
      existing.stockUnits += product.stock || 0
      if (product.stock <= 5) {
        existing.lowStockCount += 1
      }
    } else {
      const uncategorized = categoryMap.get('uncategorized') || {
        id: 'uncategorized',
        name: 'Uncategorized',
        productCount: 0,
        stockUnits: 0,
        lowStockCount: 0,
      }
      uncategorized.productCount += 1
      uncategorized.stockUnits += product.stock || 0
      if (product.stock <= 5) {
        uncategorized.lowStockCount += 1
      }
      categoryMap.set('uncategorized', uncategorized)
    }
  }

  const categoryDistribution = Array.from(categoryMap.values()).sort(
    (a, b) => b.productCount - a.productCount
  )

  const statusMeta: Array<{ status: OrderStatus; label: string }> = [
    { status: 'paid', label: 'Paid' },
    { status: 'pending', label: 'Pending' },
    { status: 'cancelled', label: 'Cancelled' },
    { status: 'failed', label: 'Failed' },
  ]

  const statusBreakdown: StatusSummary[] = statusMeta.map(({ status, label }) => {
    const matching = orders.filter((o) => o.status === status)
    const count = matching.length
    const revenue = matching.reduce(
      (sum, o) => sum + toAmount(o.total_amount),
      0
    )
    const percentage =
      orders.length > 0 ? Math.round((count / orders.length) * 100) : 0
    return { status, label, count, revenue, percentage }
  })

  const productLookup = new Map<string, ProductResponse>()
  for (const p of products) {
    productLookup.set(p.id, p)
  }

  const topMap = new Map<string, TopProductStat>()
  for (const order of nonCancelledOrders) {
    for (const item of order.items || []) {
      const matched = productLookup.get(item.product_id)
      const current = topMap.get(item.product_id) || {
        productId: item.product_id,
        name: matched?.name || `Product ${item.product_id.slice(0, 8)}`,
        sku: matched?.sku,
        unitsSold: 0,
        revenue: 0,
      }
      current.unitsSold += item.quantity || 0
      current.revenue += toAmount(item.subtotal)
      topMap.set(item.product_id, current)
    }
  }

  const topProducts = Array.from(topMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  return {
    paidRevenue,
    pendingRevenue,
    totalSalesRevenue,
    totalOrders: totalOrdersCount,
    avgOrderValue,
    paidRate,
    totalProducts,
    activeProducts,
    totalStockUnits,
    inventoryValue,
    lowStockProducts,
    outOfStockProducts,
    totalCategories,
    activeCategories,
    categoryDistribution,
    statusBreakdown,
    topProducts,
  }
}

export function buildSalesSeries(
  orders: OrderResponse[],
  range: SalesTimeframe
): SalesSeriesPoint[] {
  const validOrders = orders.filter(
    (o) => o.status !== 'cancelled' && o.status !== 'failed'
  )

  const bucketMap = new Map<string, { revenue: number; orders: number; date: Date }>()
  for (const order of validOrders) {
    const parsedDate = new Date(order.created_at)
    if (Number.isNaN(parsedDate.getTime())) continue
    const key = toLocalDateKey(parsedDate)
    const entry = bucketMap.get(key) || {
      revenue: 0,
      orders: 0,
      date: new Date(
        parsedDate.getFullYear(),
        parsedDate.getMonth(),
        parsedDate.getDate()
      ),
    }
    entry.revenue += toAmount(order.total_amount)
    entry.orders += 1
    bucketMap.set(key, entry)
  }

  if (range === 'all') {
    return Array.from(bucketMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, entry]) => ({
        dateKey,
        label: formatShortDate(entry.date),
        revenue: entry.revenue,
        orders: entry.orders,
      }))
  }

  const days = range === '7d' ? 7 : 30
  const today = new Date()
  const series: SalesSeriesPoint[] = []

  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - offset)
    const key = toLocalDateKey(d)
    const entry = bucketMap.get(key)
    series.push({
      dateKey: key,
      label: formatShortDate(d),
      revenue: entry?.revenue || 0,
      orders: entry?.orders || 0,
    })
  }

  return series
}
