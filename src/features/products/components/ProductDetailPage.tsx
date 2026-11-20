import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router'
import config from '@/config/config'
import { productsApi } from '../api/products.api'
import { useCart } from '@/stores/cartContextDef'
import type { ProductResponse } from '../../../types/api'

export function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>()
  const [product, setProduct] = useState<ProductResponse | null>(null)
  const [recommendations, setRecommendations] = useState<ProductResponse[]>([])
  const [quantity, setQuantity] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState(false)

  const { addToCart } = useCart()

  useEffect(() => {
    if (!productId) return
    const fetchProduct = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await productsApi.getProduct(productId)
        setProduct(data)
        if (data.category_id) {
          const recs = await productsApi.getCategoryRecommendations(
            data.category_id,
            4
          )
          setRecommendations(recs.filter((p) => p.id !== data.id).slice(0, 3))
        }
      } catch (err) {
        setError('Failed to load product details.')
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProduct()
  }, [productId])

  const handleAdd = () => {
    if (!product) return
    addToCart(product, quantity)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-2 border-action border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-xs text-secondary/60">Loading product details...</p>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <h2 className="text-xl font-bold text-secondary">Product Not Found</h2>
        <p className="mt-2 text-sm text-secondary/60">
          {error || 'The requested product could not be located.'}
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-5 py-2.5 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold"
        >
          Return to Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="text-xs text-secondary/50 mb-8 flex items-center space-x-2">
        <Link to="/" className="hover:text-secondary">
          Catalog
        </Link>
        <span>/</span>
        <span className="text-secondary font-medium">{product.name}</span>
      </nav>

      {/* Main Product Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        {/* Visual Box */}
        <div className="aspect-square w-full rounded-2xl border border-secondary/15 bg-muted flex items-center justify-center p-8">
          <div className="text-center">
            <span className="text-6xl sm:text-8xl font-black text-secondary/15 uppercase tracking-widest">
              {product.name.slice(0, 3)}
            </span>
            <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-secondary/40">
              SKU: {product.sku}
            </p>
          </div>
        </div>

        {/* Info & Purchase Details */}
        <div className="flex flex-col justify-center">
          <span className="text-xs font-bold uppercase tracking-widest text-action">
            In Stock ({product.stock} units left)
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary tracking-tight mt-2">
            {product.name}
          </h1>
          <p className="text-2xl font-bold text-secondary mt-3">
            {config.app.currency} {Number(product.price).toFixed(2)}
          </p>

          <p className="mt-6 text-sm text-secondary/70 leading-relaxed">
            {product.description ||
              'A core staple crafted with precise tailoring and premium materials for daily aesthetic versatility.'}
          </p>

          {/* Quantity Selector & Add to Cart */}
          <div className="mt-8 pt-6 border-t border-secondary/10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <div className="flex items-center border border-secondary/20 rounded-md">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-3.5 py-2 text-sm font-bold text-secondary hover:bg-secondary/5 transition cursor-pointer"
              >
                −
              </button>
              <span className="px-4 py-2 text-sm font-semibold text-secondary min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() =>
                  setQuantity((q) => Math.min(product.stock, q + 1))
                }
                disabled={quantity >= product.stock}
                className="px-3.5 py-2 text-sm font-bold text-secondary hover:bg-secondary/5 disabled:opacity-30 transition cursor-pointer"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAdd}
              disabled={product.stock === 0}
              className="flex-1 py-3 px-6 rounded-md bg-action text-action-foreground font-bold text-sm tracking-wide uppercase hover:opacity-90 disabled:opacity-40 transition cursor-pointer"
            >
              {added
                ? '✓ Added to Cart'
                : product.stock === 0
                ? 'Out of Stock'
                : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Category Recommendations */}
      {recommendations.length > 0 && (
        <section className="mt-20 pt-10 border-t border-secondary/10">
          <h2 className="text-lg font-bold text-secondary mb-6">
            You might also like
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recommendations.map((rec) => (
              <Link
                key={rec.id}
                to={`/products/${rec.id}`}
                className="p-4 border border-secondary/15 rounded-xl hover:border-secondary/40 transition"
              >
                <div className="aspect-square rounded-md bg-muted flex items-center justify-center font-bold text-secondary/20 text-2xl">
                  {rec.name.slice(0, 2)}
                </div>
                <h3 className="mt-3 text-sm font-semibold text-secondary">
                  {rec.name}
                </h3>
                <p className="text-xs font-bold text-secondary mt-1">
                  {config.app.currency} {Number(rec.price).toFixed(2)}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
