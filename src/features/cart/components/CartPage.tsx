import { Link } from 'react-router'
import config from '@/config/config'
import { useCart, type CartItem } from '@/stores/cartContextDef'

export function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, clearCart } =
    useCart()

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold text-secondary">Your Cart is Empty</h1>
        <p className="mt-2 text-sm text-secondary/60">
          Looks like you haven&apos;t added any items to your bag yet.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block px-6 py-3 rounded-md bg-action text-action-foreground text-sm font-semibold hover:opacity-90 transition"
        >
          Explore Catalog
        </Link>
      </div>
    )
  }

  const estimatedTax = subtotal * 0.05
  const estimatedTotal = subtotal + estimatedTax

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between border-b border-secondary/10 pb-6 mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-secondary">
          Shopping Bag ({items.length})
        </h1>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-secondary/50 hover:text-secondary underline cursor-pointer"
        >
          Clear bag
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart Item List */}
        <div className="lg:col-span-8 space-y-6">
          {items.map(({ product, quantity }: CartItem) => {
            const priceNum =
              typeof product.price === 'string'
                ? parseFloat(product.price)
                : product.price
            const itemTotal = (isNaN(priceNum) ? 0 : priceNum) * quantity

            return (
              <div
                key={product.id}
                className="flex items-start sm:items-center justify-between gap-4 p-4 border border-secondary/15 rounded-xl bg-surface"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted border border-secondary/10 flex items-center justify-center font-bold text-sm text-secondary/40 uppercase shrink-0">
                    {product.name.slice(0, 2)}
                  </div>
                  <div>
                    <Link
                      to={`/products/${product.id}`}
                      className="text-sm font-semibold text-secondary hover:text-action"
                    >
                      {product.name}
                    </Link>
                    <p className="text-xs text-secondary/50 mt-0.5">
                      SKU: {product.sku}
                    </p>
                    <p className="text-xs font-semibold text-secondary mt-1">
                      {config.app.currency} {(isNaN(priceNum) ? 0 : priceNum).toFixed(2)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {/* Quantity controls */}
                  <div className="flex items-center border border-secondary/20 rounded-md">
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="px-2.5 py-1 text-xs font-bold text-secondary hover:bg-secondary/5 cursor-pointer"
                    >
                      −
                    </button>
                    <span className="px-3 py-1 text-xs font-semibold text-secondary">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="px-2.5 py-1 text-xs font-bold text-secondary hover:bg-secondary/5 cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  <span className="text-sm font-bold text-secondary min-w-[70px] text-right">
                    {config.app.currency} {itemTotal.toFixed(2)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label="Remove item"
                    className="text-xs text-secondary/40 hover:text-action cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Order Summary Panel */}
        <div className="lg:col-span-4">
          <div className="p-6 border border-secondary/15 rounded-xl bg-surface sticky top-24">
            <h2 className="text-base font-bold text-secondary uppercase tracking-wider mb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm border-b border-secondary/10 pb-4">
              <div className="flex justify-between text-secondary/70">
                <span>Subtotal</span>
                <span className="font-semibold text-secondary">
                  {config.app.currency} {subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-secondary/70">
                <span>Estimated Tax (5%)</span>
                <span className="font-semibold text-secondary">
                  {config.app.currency} {estimatedTax.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-secondary/70">
                <span>Shipping</span>
                <span className="font-semibold text-success">Free</span>
              </div>
            </div>

            <div className="flex justify-between items-baseline pt-4 text-base font-bold text-secondary mb-6">
              <span>Total</span>
              <span className="text-xl">{config.app.currency} {estimatedTotal.toFixed(2)}</span>
            </div>

            <Link
              to="/checkout"
              className="block w-full text-center py-3 px-4 rounded-md bg-action text-action-foreground font-bold text-sm uppercase tracking-wide hover:opacity-90 transition"
            >
              Proceed to Checkout
            </Link>

            <p className="mt-3 text-center text-[11px] text-secondary/50">
              Taxes calculated at checkout. Stripe &amp; bKash supported.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
