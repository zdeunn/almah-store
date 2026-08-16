import { Storefront } from '@/components/storefront'
import { getProducts } from '@/lib/api'

// Products are fetched on the server (from the FastAPI backend when configured,
// otherwise from local sample data) and passed down to the client storefront.
export default async function Page() {
  const products = await getProducts()
  return <Storefront products={products} />
}
