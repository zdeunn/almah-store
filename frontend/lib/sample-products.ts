import type { Product } from './types'

/**
 * Local fallback catalog used only until NEXT_PUBLIC_API_URL points at
 * the FastAPI backend. Shape matches the /products response exactly.
 */
export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 1,
    slug: 'marigold-embroidered-maxi',
    title: 'Marigold Embroidered Maxi',
    description: 'Hand-embroidered flowing maxi dress in a warm marigold tone.',
    price: '4500.00',
    stock: 12,
    image_url: '/products/damien-dufour-cL6jyW-Vc0U-unsplash.jpg',
    images: [
      {
        id: 101,
        product_id: 1,
        image_url: '/products/damien-dufour-cL6jyW-Vc0U-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 102,
        product_id: 1,
        image_url: '/products/dwayne-joe-yad8QcBssbg-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
      {
        id: 103,
        product_id: 1,
        image_url: '/products/faheem-ahmed-fQ-HiqyRFwk-unsplash.jpg',
        is_primary: false,
        display_order: 3,
      },
    ],
  },
  {
    id: 2,
    slug: 'sand-linen-wrap-dress',
    title: 'Sand Linen Wrap Dress',
    description: 'Breathable linen wrap dress cut for effortless summer days.',
    price: '3900.00',
    stock: 8,
    image_url: '/products/dwayne-joe-yad8QcBssbg-unsplash.jpg',
    images: [
      {
        id: 201,
        product_id: 2,
        image_url: '/products/dwayne-joe-yad8QcBssbg-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 202,
        product_id: 2,
        image_url: '/products/frank-flores-t3836YmTfw8-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
  {
    id: 3,
    slug: 'olive-satin-slip',
    title: 'Olive Satin Slip',
    description: 'A bias-cut satin slip dress in a muted olive green.',
    price: '4200.00',
    stock: 5,
    image_url: '/products/faheem-ahmed-fQ-HiqyRFwk-unsplash.jpg',
    images: [
      {
        id: 301,
        product_id: 3,
        image_url: '/products/faheem-ahmed-fQ-HiqyRFwk-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 302,
        product_id: 3,
        image_url: '/products/michael-lee-5Z9bgfRZLLE-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
  {
    id: 4,
    slug: 'white-cotton-summer-dress',
    title: 'White Cotton Summer Dress',
    description: 'Lightweight cotton dress with a relaxed, elegant silhouette.',
    price: '3500.00',
    stock: 20,
    image_url: '/products/frank-flores-t3836YmTfw8-unsplash.jpg',
    images: [
      {
        id: 401,
        product_id: 4,
        image_url: '/products/frank-flores-t3836YmTfw8-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 402,
        product_id: 4,
        image_url: '/products/valna-studio-mU88MlEFcoU-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
  {
    id: 5,
    slug: 'rust-silk-blouse-trousers',
    title: 'Rust Silk Blouse & Trousers',
    description: 'Terracotta silk blouse paired with tailored wide-leg trousers.',
    price: '5200.00',
    stock: 7,
    image_url: '/products/michael-lee-5Z9bgfRZLLE-unsplash.jpg',
    images: [
      {
        id: 501,
        product_id: 5,
        image_url: '/products/michael-lee-5Z9bgfRZLLE-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 502,
        product_id: 5,
        image_url: '/products/damien-dufour-cL6jyW-Vc0U-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
  {
    id: 6,
    slug: 'camel-wool-wrap-coat',
    title: 'Camel Wool Wrap Coat',
    description: 'A timeless camel wrap coat in soft brushed wool.',
    price: '7800.00',
    stock: 4,
    image_url: '/products/valna-studio-mU88MlEFcoU-unsplash.jpg',
    images: [
      {
        id: 601,
        product_id: 6,
        image_url: '/products/valna-studio-mU88MlEFcoU-unsplash.jpg',
        is_primary: true,
        display_order: 1,
      },
      {
        id: 602,
        product_id: 6,
        image_url: '/products/dwayne-joe-yad8QcBssbg-unsplash.jpg',
        is_primary: false,
        display_order: 2,
      },
    ],
  },
]