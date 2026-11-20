import { useState, useEffect, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router'
import config from '@/config/config'
import { productsApi } from '@/features/products/api/products.api'
import { categoriesApi } from '@/features/categories/api/categories.api'
import { useCart } from '@/stores/cartContextDef'
import type { CategoryResponse, ProductResponse } from '@/types/api'

export function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [categories, setCategories] = useState<CategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const selectedCategory = searchParams.get('category') || ''
  const searchQuery = searchParams.get('q') || ''
  const page = parseInt(searchParams.get('page') || '1', 10)
  const [totalPages, setTotalPages] = useState(1)

  const { addToCart } = useCart()
  const [addedId, setAddedId] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchCategories = async () => {
      try {
        const data = await categoriesApi.getCategories()
        if (Array.isArray(data) && isMounted) {
          setCategories(data)
        }
      } catch (err) {
        console.error('Failed to load categories', err)
      }
    }
    fetchCategories()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchProducts = async () => {
      try {
        const data = await productsApi.getProducts({
          category_id: selectedCategory || null,
          search: searchQuery || null,
          page,
          page_size: 12,
          is_active: true,
        })
        if (isMounted) {
          setProducts(data.items || [])
          setTotalPages(data.total_pages || 1)
          setError(null)
        }
      } catch (err) {
        if (isMounted) {
          setError('Unable to load products from server. Please try again later.')
        }
        console.error(err)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchProducts()

    return () => {
      isMounted = false
    }
  }, [selectedCategory, searchQuery, page])

  const handleCategoryClick = (categoryId: string) => {
    setIsLoading(true)
    const params = new URLSearchParams(searchParams)
    if (categoryId) {
      params.set('category', categoryId)
    } else {
      params.delete('category')
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    const form = e.currentTarget
    const input = form.elements.namedItem('search') as HTMLInputElement
    const params = new URLSearchParams(searchParams)
    if (input.value.trim()) {
      params.set('q', input.value.trim())
    } else {
      params.delete('q')
    }
    params.set('page', '1')
    setSearchParams(params)
  }

  const handleAddToCart = (product: ProductResponse) => {
    addToCart(product, 1)
    setAddedId(product.id)
    setTimeout(() => setAddedId(null), 1500)
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Editorial Store Header */}
      <div className="border-b border-secondary/10 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-action">
            Curated Storefront
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-secondary mt-1">
            Everyday Essentials &amp; Apparel
          </h1>
          <p className="mt-2 text-sm text-secondary/60 max-w-xl">
            Designed with thoughtful minimalism. High performance craftsmanship
            for daily utility.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-auto">
          <input
            name="search"
            type="search"
            defaultValue={searchQuery}
            placeholder="Search products..."
            className="w-full md:w-64 px-3.5 py-2 text-sm bg-surface text-secondary placeholder:text-secondary/40 border border-secondary/20 rounded-md focus:outline-none focus:border-secondary transition"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-secondary text-secondary-foreground text-sm font-medium rounded-md hover:bg-secondary/80 transition cursor-pointer"
          >
            Search
          </button>
        </form>
      </div>

      {/* Category Pills Filter */}
      <div className="py-6 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => handleCategoryClick('')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition shrink-0 cursor-pointer ${
            !selectedCategory
              ? 'bg-secondary text-secondary-foreground'
              : 'bg-surface text-secondary border border-secondary/15 hover:border-secondary'
          }`}
        >
          All Items
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => handleCategoryClick(cat.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium uppercase tracking-wider transition shrink-0 cursor-pointer ${
              selectedCategory === cat.id
                ? 'bg-secondary text-secondary-foreground'
                : 'bg-surface text-secondary border border-secondary/15 hover:border-secondary'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products Grid State */}
      {isLoading ? (
        <div className="py-24 text-center">
          <div className="inline-block w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs text-secondary/60">Loading catalog...</p>
        </div>
      ) : error ? (
        <div className="py-16 text-center max-w-md mx-auto">
          <p className="text-sm text-action font-semibold">{error}</p>
          <button
            type="button"
            onClick={() => {
              setIsLoading(true)
              setError(null)
            }}
            className="mt-4 px-4 py-2 text-xs font-medium rounded-md bg-secondary text-secondary-foreground"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="py-24 text-center border border-secondary/10 rounded-xl bg-surface">
          <p className="text-base font-medium text-secondary">No products found</p>
          <p className="mt-1 text-xs text-secondary/50">
            Try adjusting your search or category filter.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <article
                key={product.id}
                className="group flex flex-col justify-between bg-surface border border-secondary/15 rounded-xl p-4 transition hover:border-secondary/40"
              >
                <div>
                  <Link
                    to={`/products/${product.id}`}
                    className="block aspect-square w-full rounded-lg bg-surface border border-secondary/10 overflow-hidden relative"
                  >
                    <div className="w-full h-full flex items-center justify-center bg-muted text-secondary/25 text-3xl font-bold tracking-widest uppercase">
                      {product.name.slice(0, 2)}
                    </div>
                    {product.stock <= 5 && product.stock > 0 && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-semibold bg-surface text-action border border-action">
                        Low Stock
                      </span>
                    )}
                  </Link>

                  <div className="mt-3.5">
                    <span className="text-[10px] uppercase tracking-wider text-secondary/45 font-semibold">
                      SKU: {product.sku}
                    </span>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="text-sm font-semibold text-secondary hover:text-action transition truncate">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-secondary/60 line-clamp-2 mt-1">
                      {product.description || 'Premium minimalist goods crafted for daily durability.'}
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-secondary/10 flex items-center justify-between">
                  <span className="text-base font-bold text-secondary">
                    {config.app.currency} {Number(product.price).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    disabled={product.stock === 0}
                    className="py-1.5 px-3.5 rounded-md text-xs font-semibold bg-action text-action-foreground hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
                  >
                    {addedId === product.id
                      ? '✓ Added'
                      : product.stock === 0
                      ? 'Sold Out'
                      : 'Add to Cart'}
                  </button>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  setIsLoading(true)
                  const params = new URLSearchParams(searchParams)
                  params.set('page', String(page - 1))
                  setSearchParams(params)
                }}
                className="px-3 py-1.5 rounded text-xs border border-secondary/20 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-secondary/60">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  setIsLoading(true)
                  const params = new URLSearchParams(searchParams)
                  params.set('page', String(page + 1))
                  setSearchParams(params)
                }}
                className="px-3 py-1.5 rounded text-xs border border-secondary/20 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
