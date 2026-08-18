import { MetadataRoute } from 'next'
import { getProducts } from '@/lib/api'

// إعادة توليد ملف الـ Sitemap كل 24 ساعة بدلاً من كل طلب
export const revalidate = 86400 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah-store.vercel.app'

  // 1. الصفحات الثابتة
  const staticRoutes = [
    { route: '', priority: 1.0, changeFrequency: 'daily' as const },
    { route: '/products', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/contact', priority: 0.5, changeFrequency: 'monthly' as const },
    { route: '/shipping-returns', priority: 0.3, changeFrequency: 'monthly' as const },
    { route: '/size-guide', priority: 0.3, changeFrequency: 'monthly' as const },
  ]

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }))

  // 2. صفحات المنتجات الديناميكية من الـ Backend
  let productPages: MetadataRoute.Sitemap = []

  try {
    const products = await getProducts()
    productPages = products.map((product) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: new Date((product as Record<string, any>).updated_at || Date.now()), // استخدام تاريخ التعديل الحقيقي للمنتج إن وجد
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch (err) {
    console.error('[sitemap] فشل جلب المنتجات من الـ backend:', err)
  }

  return [...staticPages, ...productPages]
}