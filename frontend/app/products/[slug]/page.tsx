import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductBySlug, getProducts } from '@/lib/api'
import { ProductCard } from '@/components/product-card'
import { ProductView } from '@/components/product-view'
import { Product } from '@/lib/types'

export const dynamicParams = true

interface PageProps {
  params: Promise<{ slug: string }>
}

// 👇 توليد الصفحات وقت الـ build (Static Site Generation)
export async function generateStaticParams() {
  try{
    const products = await getProducts()
  return products.map((product) => ({
    slug: product.slug,
  }))
  }catch{
    return []
  }
  
}

// ISR: يعاود يولد الصفحة كل ساعة باش يبقى المخزون/السعر محدث بلا ما نعاود build كامل
export const revalidate = 3600

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) return { title: 'المنتج غير موجود' }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop'

  return {
    title: `${product.title} | تسوق الآن`,
    description: product.description,
    alternates: {
      canonical: `${siteUrl}/products/${product.slug}`,
    },
    openGraph: {
      title: product.title,
      description: product.description ?? 'وصف المنتج غير متوفر',
      images: product.image_url ? [{ url: product.image_url }] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
const { slug } = await params
  
  // فك ترميز الـ slug في حال احتوى على حروف عربية أو رموز
  const decodedSlug = decodeURIComponent(slug)
  const product = await getProductBySlug(decodedSlug)

  // قم بإزالة console.log بعد التأكد من النتيجة في الـ Terminal
  console.log("Fetched Product Slug:", decodedSlug, "Result:", product)

  if (!product) {
    notFound()
  }

  const allProducts = await getProducts()
  const relatedProducts = allProducts.filter((p) => p.id !== product.id).slice(0, 4)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop'
  const productUrl = `${siteUrl}/products/${product.slug}`

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description,
    image: product.image_url,
    sku: String(product.id),
    url: productUrl,
    brand: {
      '@type': 'Brand',
      name: 'ALMAH',
    },
    offers: {
      '@type': 'Offer',
      url: productUrl,
      price: String(product.price),
      priceCurrency: 'DZD',
      availability: product.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'الرئيسية', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'المنتجات', item: `${siteUrl}/products` },
      { '@type': 'ListItem', position: 3, name: product.title, item: productUrl },
    ],
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-6 md:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground transition-colors">الرئيسية</Link></li>
          <li>/</li>
          <li><Link href="/products" className="hover:text-foreground transition-colors">المنتجات</Link></li>
          <li>/</li>
          <li className="text-foreground font-medium truncate max-w-[200px]">{product.title}</li>
        </ol>
      </nav>

      <ProductView product={product} />

      <hr className="my-16 border-neutral-900" />

      <div className="space-y-8">
        <h2 className="text-right font-serif text-2xl font-bold tracking-wide text-foreground">
          قد يعجبك أيضاً
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </div>
  )
}