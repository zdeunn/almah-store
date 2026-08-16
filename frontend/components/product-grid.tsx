import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/types'

export function ProductGrid({ products }: { products: Product[] }) {
  return (
    <section id="collection" className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent">
            Shop
          </p>
          <h2 className="mt-2 font-serif text-3xl font-medium text-foreground md:text-4xl">
            New Arrivals
          </h2>
        </div>
        <p className="hidden text-sm text-muted-foreground sm:block">
          {products.length} pieces
        </p>
      </div>

      {products.length === 0 ? (
        <p className="py-16 text-center text-muted-foreground">
          No products available right now. Please check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  )
}
