import { useState, useEffect, useCallback, useMemo, type FormEvent } from 'react'
import { isAxiosError } from 'axios'
import config from '@/config/config'
import { productsApi } from '@/features/products/api/products.api'
import { categoriesApi } from '@/features/categories/api/categories.api'
import { ordersApi } from '@/features/orders/api/orders.api'
import {
  computeDashboardMetrics,
  formatMoney,
  toAmount,
} from '../utils/adminAnalytics'
import { SalesTrendChart } from './charts/SalesTrendChart'
import { OrderStatusChart } from './charts/OrderStatusChart'
import { CategoryInventoryChart } from './charts/CategoryInventoryChart'
import { SalesHistoryPanel } from './SalesHistoryPanel'
import type {
  CategoryCreate,
  CategoryResponse,
  OrderResponse,
  ProductCreate,
  ProductResponse,
} from '@/types/api'

type AdminTab = 'overview' | 'sales' | 'products' | 'categories'

export function AdminDashboardPage() {
  const currency = config.app.currency

  const [activeTab, setActiveTab] = useState<AdminTab>('overview')

  // Data states
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [productsTotal, setProductsTotal] = useState(0)
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [ordersTotal, setOrdersTotal] = useState(0)

  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [fetchWarning, setFetchWarning] = useState<string | null>(null)
  const [actionMessage, setActionMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  // Products tab filter
  const [productSearch, setProductSearch] = useState('')

  // Product Form state
  const initialProductForm: ProductCreate = {
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '',
    stock: 0,
    category_id: '',
    is_active: true,
  }
  const [productForm, setProductForm] = useState<ProductCreate>(initialProductForm)
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false)

  // Category Form state
  const initialCategoryForm: CategoryCreate = {
    name: '',
    slug: '',
    description: '',
    is_active: true,
  }
  const [categoryForm, setCategoryForm] = useState<CategoryCreate>(initialCategoryForm)
  const [isSubmittingCategory, setIsSubmittingCategory] = useState(false)

  const fetchAllAdminData = useCallback(async () => {
    const [catsResult, prodsResult, ordersResult] = await Promise.allSettled([
      categoriesApi.getCategories(),
      productsApi.getProducts({ page: 1, page_size: 100, is_active: null }),
      ordersApi.listOrders(1, 100),
    ])

    const failedParts: string[] = []

    if (catsResult.status === 'fulfilled') {
      const cats = Array.isArray(catsResult.value) ? catsResult.value : []
      setCategories(cats)
    } else {
      failedParts.push('categories')
    }

    if (prodsResult.status === 'fulfilled') {
      const items = prodsResult.value.items || []
      setProducts(items)
      setProductsTotal(prodsResult.value.total ?? items.length)
    } else {
      failedParts.push('products')
    }

    if (ordersResult.status === 'fulfilled') {
      const items = ordersResult.value.items || []
      setOrders(items)
      setOrdersTotal(ordersResult.value.total ?? items.length)
    } else {
      failedParts.push('orders')
    }

    if (failedParts.length > 0) {
      setFetchWarning(
        `Some data could not be loaded (${failedParts.join(', ')}). Check backend connection or permissions.`
      )
    } else {
      setFetchWarning(null)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const init = async () => {
      const [catsResult, prodsResult, ordersResult] = await Promise.allSettled([
        categoriesApi.getCategories(),
        productsApi.getProducts({ page: 1, page_size: 100, is_active: null }),
        ordersApi.listOrders(1, 100),
      ])

      if (!isMounted) return

      const failedParts: string[] = []

      if (catsResult.status === 'fulfilled') {
        const cats = Array.isArray(catsResult.value) ? catsResult.value : []
        setCategories(cats)
      } else {
        failedParts.push('categories')
      }

      if (prodsResult.status === 'fulfilled') {
        const items = prodsResult.value.items || []
        setProducts(items)
        setProductsTotal(prodsResult.value.total ?? items.length)
      } else {
        failedParts.push('products')
      }

      if (ordersResult.status === 'fulfilled') {
        const items = ordersResult.value.items || []
        setOrders(items)
        setOrdersTotal(ordersResult.value.total ?? items.length)
      } else {
        failedParts.push('orders')
      }

      if (failedParts.length > 0) {
        setFetchWarning(
          `Some data could not be loaded (${failedParts.join(', ')}). Check backend connection or permissions.`
        )
      }

      setIsLoading(false)
    }

    init()
    return () => {
      isMounted = false
    }
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      await fetchAllAdminData()
    } finally {
      setIsRefreshing(false)
    }
  }

  // Derived analytics & lookup maps
  const metrics = useMemo(
    () =>
      computeDashboardMetrics(
        products,
        productsTotal,
        categories,
        orders,
        ordersTotal
      ),
    [products, productsTotal, categories, orders, ordersTotal]
  )

  const categoriesById = useMemo(() => {
    const map: Record<string, CategoryResponse> = {}
    for (const c of categories) {
      map[c.id] = c
    }
    return map
  }, [categories])

  const productsById = useMemo(() => {
    const map: Record<string, ProductResponse> = {}
    for (const p of products) {
      map[p.id] = p
    }
    return map
  }, [products])

  const productCountByCategory = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const p of products) {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1
    }
    return counts
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (categoriesById[p.category_id]?.name || '').toLowerCase().includes(q)
    )
  }, [products, productSearch, categoriesById])

  const recentOrders = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 5),
    [orders]
  )

  // Helper auto-slug
  const generateSlug = (text: string) =>
    text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '')

  // Create Product handler
  const handleCreateProduct = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmittingProduct(true)
    setActionMessage(null)

    try {
      await productsApi.createProduct({
        ...productForm,
        name: productForm.name.trim(),
        slug: productForm.slug.trim() || generateSlug(productForm.name),
        sku: productForm.sku.trim().toUpperCase(),
        price: Number(productForm.price),
        stock: Number(productForm.stock),
      })
      setActionMessage({
        type: 'success',
        text: `Product "${productForm.name}" created successfully!`,
      })
      setProductForm(initialProductForm)
      await fetchAllAdminData()
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to create product'
        : 'Failed to create product'
      setActionMessage({
        type: 'error',
        text: typeof msg === 'string' ? msg : JSON.stringify(msg),
      })
    } finally {
      setIsSubmittingProduct(false)
    }
  }

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return
    try {
      await productsApi.deleteProduct(id)
      setActionMessage({ type: 'success', text: `Product "${name}" deleted.` })
      await fetchAllAdminData()
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail || 'Delete failed'
        : 'Delete failed'
      setActionMessage({
        type: 'error',
        text: typeof msg === 'string' ? msg : 'Delete failed',
      })
    }
  }

  // Create Category handler
  const handleCreateCategory = async (e: FormEvent) => {
    e.preventDefault()
    setIsSubmittingCategory(true)
    setActionMessage(null)

    try {
      await categoriesApi.createCategory({
        ...categoryForm,
        name: categoryForm.name.trim(),
        slug: categoryForm.slug.trim() || generateSlug(categoryForm.name),
      })
      setActionMessage({
        type: 'success',
        text: `Category "${categoryForm.name}" created successfully!`,
      })
      setCategoryForm(initialCategoryForm)
      await fetchAllAdminData()
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail ||
          err.response?.data?.message ||
          'Failed to create category'
        : 'Failed to create category'
      setActionMessage({
        type: 'error',
        text: typeof msg === 'string' ? msg : JSON.stringify(msg),
      })
    } finally {
      setIsSubmittingCategory(false)
    }
  }

  // Delete Category
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete category "${name}"?`))
      return
    try {
      await categoriesApi.deleteCategory(id)
      setActionMessage({ type: 'success', text: `Category "${name}" deleted.` })
      await fetchAllAdminData()
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail || 'Delete failed'
        : 'Delete failed'
      setActionMessage({
        type: 'error',
        text: typeof msg === 'string' ? msg : 'Delete failed',
      })
    }
  }

  // Cancel Order handler
  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return
    try {
      await ordersApi.cancelOrder(orderId)
      setActionMessage({ type: 'success', text: 'Order cancelled.' })
      await fetchAllAdminData()
    } catch (err: unknown) {
      const msg = isAxiosError(err)
        ? err.response?.data?.detail || 'Failed to cancel order'
        : 'Failed to cancel order'
      setActionMessage({
        type: 'error',
        text: typeof msg === 'string' ? msg : 'Failed to cancel order',
      })
    }
  }

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: `Sales History (${metrics.totalOrders})` },
    { id: 'products', label: `Products (${metrics.totalProducts})` },
    { id: 'categories', label: `Categories (${categories.length})` },
  ]

  const switchTab = (tab: AdminTab) => {
    setActiveTab(tab)
    setActionMessage(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Admin Header */}
      <div className="border-b border-secondary/10 pb-6 mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-action">
            Store Management &amp; Analytics
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight mt-1">
            Admin Dashboard
          </h1>
          <p className="text-xs text-secondary/60 mt-1">
            Monitor sales performance, order history, inventory health, products, and categories.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Tab switchers */}
          <div className="flex flex-wrap items-center gap-1 border border-secondary/15 p-1 rounded-lg bg-muted">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => switchTab(tab.id)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-secondary text-secondary-foreground'
                    : 'text-secondary/70 hover:text-secondary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || isLoading}
            className="px-3.5 py-2 rounded-lg border border-secondary/20 bg-surface text-xs font-semibold text-secondary hover:border-secondary disabled:opacity-50 transition cursor-pointer"
          >
            {isRefreshing ? 'Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Fetch Warning Banner */}
      {fetchWarning && (
        <div
          role="alert"
          className="mb-6 p-3.5 rounded-xl text-xs font-semibold border border-action bg-action/10 text-action flex items-center justify-between gap-4"
        >
          <span>⚠ {fetchWarning}</span>
          <button
            type="button"
            onClick={() => setFetchWarning(null)}
            className="underline cursor-pointer shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Global Action Banner */}
      {actionMessage && (
        <div
          role="alert"
          className={`mb-6 p-4 rounded-xl text-xs font-semibold border flex items-center justify-between ${
            actionMessage.type === 'success'
              ? 'bg-success/10 border-success text-success'
              : 'bg-action/10 border-action text-action'
          }`}
        >
          <span>{actionMessage.text}</span>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 0: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* 4 KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 border border-secondary/15 rounded-xl bg-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary/55">
                Paid Sales Revenue
              </span>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {isLoading ? '—' : formatMoney(metrics.paidRevenue, currency)}
              </p>
              <p className="mt-1 text-xs text-secondary/60">
                {metrics.paidRate}% paid • {formatMoney(metrics.pendingRevenue, currency)} pending
              </p>
            </div>

            <div className="p-5 border border-secondary/15 rounded-xl bg-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary/55">
                Total Orders
              </span>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {isLoading ? '—' : metrics.totalOrders}
              </p>
              <p className="mt-1 text-xs text-secondary/60">
                Avg order: {formatMoney(metrics.avgOrderValue, currency)}
              </p>
            </div>

            <div className="p-5 border border-secondary/15 rounded-xl bg-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary/55">
                Catalog Products
              </span>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {isLoading ? '—' : metrics.totalProducts}
              </p>
              <p className="mt-1 text-xs text-secondary/60">
                {metrics.totalStockUnits} units in stock •{' '}
                <span className={metrics.lowStockProducts.length > 0 ? 'text-action font-semibold' : ''}>
                  {metrics.lowStockProducts.length} low
                </span>{' '}
                /{' '}
                <span className={metrics.outOfStockProducts.length > 0 ? 'text-danger font-semibold' : ''}>
                  {metrics.outOfStockProducts.length} out
                </span>
              </p>
            </div>

            <div className="p-5 border border-secondary/15 rounded-xl bg-surface">
              <span className="text-[11px] font-bold uppercase tracking-wider text-secondary/55">
                Inventory Value &amp; Categories
              </span>
              <p className="mt-2 text-2xl font-bold text-secondary">
                {isLoading ? '—' : formatMoney(metrics.inventoryValue, currency)}
              </p>
              <p className="mt-1 text-xs text-secondary/60">
                {metrics.totalCategories} categories ({metrics.activeCategories} active)
              </p>
            </div>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8">
              <SalesTrendChart orders={orders} currency={currency} />
            </div>
            <div className="lg:col-span-4">
              <OrderStatusChart
                breakdown={metrics.statusBreakdown}
                totalOrders={metrics.totalOrders}
                currency={currency}
              />
            </div>
          </div>

          {/* Charts & Insights Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <CategoryInventoryChart categories={metrics.categoryDistribution} />
            </div>

            <div className="lg:col-span-5 p-6 border border-secondary/15 rounded-xl bg-surface space-y-6">
              {/* Inventory Alerts */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
                    Inventory Alerts
                  </h2>
                  <button
                    type="button"
                    onClick={() => switchTab('products')}
                    className="text-xs font-semibold text-action hover:underline cursor-pointer"
                  >
                    Manage Products →
                  </button>
                </div>

                {metrics.outOfStockProducts.length === 0 &&
                metrics.lowStockProducts.length === 0 ? (
                  <p className="p-3 rounded-lg bg-muted text-xs text-success font-medium">
                    ✓ All catalog items are well stocked.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {metrics.outOfStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 rounded-lg border border-danger/25 bg-danger/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-secondary truncate mr-2">
                          {p.name}
                        </span>
                        <span className="font-bold text-danger shrink-0">
                          Out of stock
                        </span>
                      </div>
                    ))}
                    {metrics.lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        className="px-3 py-2 rounded-lg border border-action/25 bg-action/5 flex items-center justify-between text-xs"
                      >
                        <span className="font-semibold text-secondary truncate mr-2">
                          {p.name}
                        </span>
                        <span className="font-bold text-action shrink-0">
                          {p.stock} left
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top Selling Products */}
              <div className="pt-5 border-t border-secondary/10">
                <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-3">
                  Top Selling Products
                </h2>
                {metrics.topProducts.length === 0 ? (
                  <p className="text-xs text-secondary/55">
                    Sales rankings will appear once orders are placed.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {metrics.topProducts.map((item, idx) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-xs gap-2"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-5 h-5 rounded-full bg-muted text-secondary font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-secondary truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-bold text-secondary">
                            {formatMoney(item.revenue, currency)}
                          </span>
                          <span className="text-secondary/50 ml-2">
                            ({item.unitsSold} sold)
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Sales History Preview */}
          <section className="border border-secondary/15 rounded-xl bg-surface overflow-hidden">
            <div className="p-5 border-b border-secondary/10 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
                  Recent Sales History
                </h2>
                <p className="text-xs text-secondary/60 mt-0.5">
                  Latest 5 customer orders
                </p>
              </div>
              <button
                type="button"
                onClick={() => switchTab('sales')}
                className="text-xs font-semibold text-action hover:underline cursor-pointer"
              >
                View all sales →
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-xs text-secondary/55">
                No sales orders recorded yet.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted text-secondary/60 uppercase text-[10px] tracking-wider">
                    <tr>
                      <th className="px-5 py-3 font-bold">Order #</th>
                      <th className="px-5 py-3 font-bold">Date</th>
                      <th className="px-5 py-3 font-bold">Items</th>
                      <th className="px-5 py-3 font-bold">Status</th>
                      <th className="px-5 py-3 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-secondary/10">
                    {recentOrders.map((order) => {
                      const units = (order.items || []).reduce(
                        (s, i) => s + (i.quantity || 0),
                        0
                      )
                      return (
                        <tr key={order.id} className="hover:bg-muted/40 transition">
                          <td className="px-5 py-3.5 font-bold text-secondary">
                            #{order.order_number}
                          </td>
                          <td className="px-5 py-3.5 text-secondary/65">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-secondary/65">
                            {units} {units === 1 ? 'unit' : 'units'}
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                                order.status === 'paid'
                                  ? 'bg-success/10 text-success border-success/30'
                                  : order.status === 'cancelled' ||
                                    order.status === 'failed'
                                  ? 'bg-danger/10 text-danger border-danger/30'
                                  : 'bg-action/10 text-action border-action/30'
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 font-bold text-secondary text-right">
                            {formatMoney(toAmount(order.total_amount), currency)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 1: SALES HISTORY */}
      {activeTab === 'sales' && (
        <SalesHistoryPanel
          orders={orders}
          productsById={productsById}
          currency={currency}
          isLoading={isLoading}
          onCancelOrder={handleCancelOrder}
        />
      )}

      {/* TAB 2: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Add Product Form */}
          <div className="lg:col-span-5">
            <div className="p-6 border border-secondary/15 rounded-xl bg-surface sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
                Add New Product
              </h2>

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Product Name <span className="text-action">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Minimalist Wool Trench"
                    value={productForm.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setProductForm((prev) => ({
                        ...prev,
                        name,
                        slug:
                          prev.slug === '' ||
                          prev.slug === generateSlug(prev.name)
                            ? generateSlug(name)
                            : prev.slug,
                      }))
                    }}
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Slug <span className="text-action">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="minimalist-wool-trench"
                      value={productForm.slug}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          slug: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      SKU <span className="text-action">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ARQ-TR-01"
                      value={productForm.sku}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          sku: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Price ({currency}) <span className="text-action">*</span>
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      placeholder="145.00"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          price: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary mb-1">
                      Stock Units <span className="text-action">*</span>
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="50"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm((prev) => ({
                          ...prev,
                          stock: parseInt(e.target.value, 10) || 0,
                        }))
                      }
                      className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Category <span className="text-action">*</span>
                  </label>
                  <select
                    required
                    value={productForm.category_id}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        category_id: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                  >
                    <option value="">Select a Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Short product highlights and specifications..."
                    value={productForm.description || ''}
                    onChange={(e) =>
                      setProductForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  className="w-full py-2.5 px-4 rounded-md bg-action text-action-foreground font-bold text-xs uppercase tracking-wide hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
                >
                  {isSubmittingProduct
                    ? 'Saving Product...'
                    : '+ Create Product'}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Products List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
                Catalog Items ({filteredProducts.length})
              </h2>
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Filter by name, SKU or category..."
                className="w-full sm:w-64 px-3 py-1.5 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
              />
            </div>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-secondary/60">
                Loading products...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-8 border border-secondary/15 rounded-xl text-center text-xs text-secondary/50 bg-muted">
                {products.length === 0
                  ? 'No products in the catalog yet. Use the form on the left to add your first product.'
                  : 'No products match your search filter.'}
              </div>
            ) : (
              <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-xl bg-surface">
                {filteredProducts.map((p) => {
                  const categoryName = categoriesById[p.category_id]?.name
                  const stockBadge =
                    p.stock === 0
                      ? {
                          label: 'Out of Stock',
                          cls: 'bg-danger/10 text-danger border-danger/30',
                        }
                      : p.stock <= 5
                      ? {
                          label: `Low Stock (${p.stock})`,
                          cls: 'bg-action/10 text-action border-action/30',
                        }
                      : {
                          label: `In Stock (${p.stock})`,
                          cls: 'bg-success/10 text-success border-success/30',
                        }

                  return (
                    <div
                      key={p.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-muted transition"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-secondary text-sm">
                            {p.name}
                          </span>
                          {categoryName && (
                            <span className="px-2 py-0.5 rounded bg-muted text-secondary/70 text-[10px] font-semibold">
                              {categoryName}
                            </span>
                          )}
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${stockBadge.cls}`}
                          >
                            {stockBadge.label}
                          </span>
                        </div>
                        <div className="flex items-center space-x-3 text-secondary/50 mt-1">
                          <span>SKU: {p.sku}</span>
                          <span>•</span>
                          <span className="font-semibold text-secondary">
                            {formatMoney(toAmount(p.price), currency)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-danger border border-danger/30 rounded hover:bg-danger hover:text-danger-foreground transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CATEGORIES */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Add Category Form */}
          <div className="lg:col-span-5">
            <div className="p-6 border border-secondary/15 rounded-xl bg-surface sticky top-24">
              <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
                Add New Category
              </h2>

              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Category Name <span className="text-action">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Footwear"
                    value={categoryForm.name}
                    onChange={(e) => {
                      const name = e.target.value
                      setCategoryForm((prev) => ({
                        ...prev,
                        name,
                        slug:
                          prev.slug === '' ||
                          prev.slug === generateSlug(prev.name)
                            ? generateSlug(name)
                            : prev.slug,
                      }))
                    }}
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Category Slug <span className="text-action">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="footwear"
                    value={categoryForm.slug}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        slug: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary mb-1">
                    Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional category description..."
                    value={categoryForm.description || ''}
                    onChange={(e) =>
                      setCategoryForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-xs bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingCategory}
                  className="w-full py-2.5 px-4 rounded-md bg-action text-action-foreground font-bold text-xs uppercase tracking-wide hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
                >
                  {isSubmittingCategory
                    ? 'Saving Category...'
                    : '+ Create Category'}
                </button>
              </form>
            </div>
          </div>

          {/* Existing Categories List */}
          <div className="lg:col-span-7">
            <h2 className="text-sm font-bold uppercase tracking-wider text-secondary mb-4">
              All Categories ({categories.length})
            </h2>

            {isLoading ? (
              <div className="py-16 text-center text-xs text-secondary/60">
                Loading categories...
              </div>
            ) : categories.length === 0 ? (
              <div className="p-8 border border-secondary/15 rounded-xl text-center text-xs text-secondary/50 bg-muted">
                No categories found. Create a category to organize your products.
              </div>
            ) : (
              <div className="divide-y divide-secondary/10 border border-secondary/15 rounded-xl bg-surface">
                {categories.map((c) => {
                  const catProdCount = productCountByCategory[c.id] || 0
                  return (
                    <div
                      key={c.id}
                      className="p-4 flex items-center justify-between text-xs hover:bg-muted transition"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-secondary text-sm">
                            {c.name}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-muted text-secondary/70 text-[10px] font-semibold">
                            {catProdCount}{' '}
                            {catProdCount === 1 ? 'product' : 'products'}
                          </span>
                        </div>
                        <span className="text-secondary/50 text-[11px]">
                          Slug: /{c.slug}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteCategory(c.id, c.name)}
                        className="px-2.5 py-1 text-[11px] font-semibold text-danger border border-danger/30 rounded hover:bg-danger hover:text-danger-foreground transition cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
