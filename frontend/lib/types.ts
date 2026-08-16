// Types mirror the FastAPI (OpenAPI) schema so the frontend stays in sync
// with the Python backend. See openapi: E-commerce MVP 1.0.0

export interface ProductImage {
  id: number
  product_id: number
  image_url: string
  is_primary?: boolean
  display_order?: number
}

export interface Product {
  id: number
  slug: string
  title: string
  description: string | null
  /** API returns price as a decimal string, e.g. "4500.00" */
  price: string
  stock: number
  image_url: string | null
  /** قائمة الصور المتعددة للمنتج */
  images?: ProductImage[]
}

export interface GuestCreate {
  name: string
  phone_number: string
  delivery_address: string
}

export interface OrderItemCreate {
  product_id: number
  quantity: number
}

export interface OrderCreate {
  total_price: string
  status?: OrderStatus
  items: OrderItemCreate[]
}

export interface OrderResponse {
  id: number
  user_id: number
  total_price: string
  status: OrderStatus
  created_at: string
  items: {
    id: number
    product_id: number
    quantity: number
  }[]
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'

/** Auth token returned by /auth/guest and /auth/login */
export interface AuthToken {
  access_token: string
  token_type?: string
}

export interface CartLine {
  product: Product
  quantity: number
}