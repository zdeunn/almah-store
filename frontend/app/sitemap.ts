import { MetadataRoute } from 'next'
import path from 'path'
import { getProducts } from '@/lib/api'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop'

  // 1. الصفحات الثابتة
  const staticRoutes = ['', 'contact', 'shipping-returns', 'size-guide']

  const staticPages: MetadataRoute.Sitemap = staticRoutes.map((route) => {
    const routePath = route ? path.posix.join('/', route) : ''
    return {
      url: `${baseUrl}${routePath}`,
      lastModified: new Date(),
      changeFrequency: route === '' ? 'daily' : 'monthly',
      priority: route === '' ? 1.0 : route === 'contact' ? 0.5 : 0.3,
    }
  })

  // 2. صفحات المنتجات — بيانات حقيقية من الـ backend
  let productPages: MetadataRoute.Sitemap = []

  try {
    const products = await getProducts()
    productPages = products.map((product) => {
      const productPath = path.posix.join('products', product.slug)
      return {
        url: `${baseUrl}/${productPath}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      }
    })
  } catch (err) {
    console.error('[sitemap] فشل جلب المنتجات من الـ backend:', err)
    // نرجع sitemap بالصفحات الثابتة فقط، أحسن من نفهرس منتجات وهمية
  }

  return [...staticPages, ...productPages]
}