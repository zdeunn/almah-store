import type {
  AuthToken,
  GuestCreate,
  OrderCreate,
  OrderResponse,
  Product,
  ProductImage,
} from './types'
import { SAMPLE_PRODUCTS } from './sample-products'

/**
 * Base URL of the Python FastAPI backend.
 * Set NEXT_PUBLIC_API_URL (e.g. http://localhost:8000) to connect.
 * When it is not set we fall back to local sample data so the UI still works.
 */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export const isBackendConfigured = API_BASE_URL.length > 0

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

/** Thin async fetch wrapper — single place to add headers, tokens, etc. */
async function request<T>(path: string, init?: RequestInit & { token?: string }): Promise<T> {
  const { token, headers, ...rest } = init ?? {}
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => res.statusText)
    throw new ApiError(res.status, detail || `Request failed: ${res.status}`)
  }

  // Some endpoints may return an empty body
  const text = await res.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/* ------------------------------------------------------------------ */
/* Products                                                           */
/* ------------------------------------------------------------------ */

export async function getProducts(includeInactive: boolean = false): Promise<Product[]> {
  if (!isBackendConfigured) return SAMPLE_PRODUCTS

  const endpoint = includeInactive 
    ? '/products?include_inactive=true' 
    : '/products'

  try {
    return await request<Product[]>(endpoint, { cache: 'no-store' })
  } catch (err) {
    console.log('[v0] getProducts failed, using sample data:', (err as Error).message)
    return SAMPLE_PRODUCTS
  }
}

export async function getProduct(id: number): Promise<Product | undefined> {
  if (!isBackendConfigured) return SAMPLE_PRODUCTS.find((p) => p.id === id)
  return request<Product>(`/products/${id}`, { cache: 'no-store' })
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isBackendConfigured) return SAMPLE_PRODUCTS.find((p) => p.slug === slug)

  try {
    // 👈 استخدام decode/encode لضمان سلامة النص العربي في الرابط
    const encodedSlug = encodeURIComponent(decodeURIComponent(slug))
    return await request<Product>(`/products/slug/${encodedSlug}`, { cache: 'no-store' })
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return undefined
    throw err
  }
}

/* ------------------------------------------------------------------ */
/* Guest checkout                                                     */
/* ------------------------------------------------------------------ */

export async function createGuest(guest: GuestCreate): Promise<AuthToken> {
  return request<AuthToken>('/auth/guest', {
    method: 'POST',
    body: JSON.stringify(guest),
  })
}

export async function createOrder(order: OrderCreate, token: string): Promise<OrderResponse> {
  return request<OrderResponse>('/orders', {
    method: 'POST',
    token,
    body: JSON.stringify(order),
  })
}

/**
 * Full guest checkout flow
 */
export async function guestCheckout(
  guest: GuestCreate,
  order: OrderCreate,
): Promise<OrderResponse> {
  if (!isBackendConfigured) {
    await new Promise((r) => setTimeout(r, 900))
    return {
      id: Math.floor(Math.random() * 100000),
      user_id: 0,
      total_price: order.total_price,
      status: 'pending',
      created_at: new Date().toISOString(),
      items: order.items.map((it, i) => ({
        id: i + 1,
        product_id: it.product_id,
        quantity: it.quantity,
      })),
    }
  }

  const { access_token } = await createGuest(guest)
  return createOrder(order, access_token)
}

export { ApiError }

/* ------------------------------------------------------------------ */
/* Admin Auth                                                         */
/* ------------------------------------------------------------------ */

export async function adminLogin(username: string, password: string): Promise<string> {
  const formData = new URLSearchParams()
  formData.append('username', username)
  formData.append('password', password)

  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!res.ok) {
    throw new Error('اسم المستخدم أو كلمة السر غير صحيحة')
  }

  const data = await res.json()
  return data.access_token
}

/* ------------------------------------------------------------------ */
/* Admin Management                                                  */
/* ------------------------------------------------------------------ */

// 1. جلب كافة الطلبات للـ Admin
export async function getAdminOrders(token: string) {
  return request<any[]>('/admin/orders', {
    token,
    cache: 'no-store',
  })
}

// 2. تحديث حالة الطلب
export async function updateOrderStatus(orderId: number, status: string, token: string) {
  return request<any>(`/admin/orders/${orderId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  })
}

// 3. إضافة منتج جديد
export async function createAdminProduct(productData: any, token: string) {
  return request<Product>('/admin/products', {
    method: 'POST',
    token,
    body: JSON.stringify(productData),
  })
}

/* ------------------------------------------------------------------ */
/* Admin Products Management                                          */
/* ------------------------------------------------------------------ */

export async function getAdminProducts(token: string): Promise<Product[]> {
  return request<Product[]>('/admin/products?include_inactive=true', {
    cache: 'no-store',
    token,
  })
}

export async function updateAdminProduct(
  productId: number,
  data: Partial<Product>,
  token: string
): Promise<Product> {
  return request<Product>(`/admin/products/${productId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(data),
  })
}

export async function deleteAdminProduct(productId: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('فشل حذف المنتج')
  }
}

/* ------------------------------------------------------------------ */
/* Product Images Upload Management (الجديد الخاص بالصور المتعددة)      */
/* ------------------------------------------------------------------ */

/**
 * رفع صور متعددة لمنتج معين
 */
export async function uploadProductImages(
  productId: number,
  files: File[],
  token: string
): Promise<ProductImage[]> {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('files', file)
  })

  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  if (!res.ok) {
    throw new Error('فشل رفع الصور للمنتج')
  }

  return res.json()
}

/**
 * حذف صورة محددة من صور المنتج
 */
export async function deleteProductImage(
  productId: number,
  imageId: number,
  token: string
): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/admin/products/${productId}/images/${imageId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!res.ok) {
    throw new Error('فشل حذف الصورة')
  }
}