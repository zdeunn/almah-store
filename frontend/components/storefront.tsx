'use client'

import { Hero } from '@/components/hero'
import { ProductGrid } from '@/components/product-grid'
import type { Product } from '@/lib/types'

export function Storefront({ products }: { products: Product[] }) {
  return (
      <div className="flex min-h-screen flex-col">
        <main className="flex-1">
          <Hero />
          <ProductGrid products={products} />
        </main>
      </div>
  )
}
