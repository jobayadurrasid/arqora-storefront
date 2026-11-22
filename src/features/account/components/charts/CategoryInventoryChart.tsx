import type { CategoryStat } from '../../utils/adminAnalytics'

interface CategoryInventoryChartProps {
  categories: CategoryStat[]
}

export function CategoryInventoryChart({
  categories,
}: CategoryInventoryChartProps) {
  const maxProducts = categories.reduce(
    (max, cat) => Math.max(max, cat.productCount),
    1
  )

  return (
    <section className="p-6 border border-secondary/15 rounded-xl bg-surface">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-secondary">
            Inventory by Category
          </h2>
          <p className="text-xs text-secondary/60 mt-0.5">
            Product count and stock units across categories
          </p>
        </div>
        <span className="text-xs font-semibold text-secondary/60">
          {categories.length} {categories.length === 1 ? 'category' : 'categories'}
        </span>
      </div>

      {categories.length === 0 ? (
        <div className="py-12 text-center rounded-lg border border-secondary/10 bg-muted text-xs text-secondary/55">
          No categories available yet. Create one in the Categories tab to organize inventory.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.map((cat) => {
            const widthPct =
              cat.productCount > 0
                ? Math.max(6, Math.round((cat.productCount / maxProducts) * 100))
                : 0

            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-secondary truncate">
                      {cat.name}
                    </span>
                    {cat.lowStockCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-action/10 text-action border border-action/30 shrink-0">
                        {cat.lowStockCount} low/out
                      </span>
                    )}
                  </div>
                  <span className="text-secondary/65 shrink-0">
                    <strong className="text-secondary">{cat.productCount}</strong>{' '}
                    {cat.productCount === 1 ? 'product' : 'products'} •{' '}
                    {cat.stockUnits} units
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-action transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
