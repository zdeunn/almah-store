'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-provider'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'


// 1. أيقونة عربة التسوق المدمجة مع الزائد المصممة خصيصاً لتطابق صورتك وتجنب أخطاء المكتبة
export function ShoppingPlusIcon({ className, ...props }: React.ComponentProps<'svg'>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* عجلات العربة السفلى */}
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      
      {/* جسم العربة */}
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      
      {/* رمز الزائد (+) تم إنزاله قليلاً جداً إضافياً ليتوسط الفراغ تماماً */}
      <path d="M13.5 8.8v5M11 11.3h5" />
    </svg>
  )
}

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, openCheckout } = useCart()
  const soldOut = product.stock <= 0

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const handleAddToCart = () => {
    if (soldOut) return
    addItem(product)
    toast.success('تمت الإضافة إلى السلة', {
      description: product.title,
    })
  }

  const handleQuickBuy = () => {
    if (soldOut) return
    addItem(product)
    openCheckout()
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-neutral-900 bg-neutral-950/20 p-3 transition-all duration-350 hover:border-neutral-800 hover:bg-neutral-900/30">
      
      <Link href={`/products/${product.slug}`} 
      onClick={handleClick}
      className="flex-1 flex flex-col">
        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-neutral-900">
          <Image
            src={product.image_url ?? '/placeholder.svg'}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        </div>
        
        <div className="mt-4 space-y-1.5 text-right px-1">
          <h3 className="font-serif text-sm font-medium tracking-wide text-neutral-200 transition-colors duration-250 group-hover:text-foreground line-clamp-1">
            {product.title}
          </h3>
          <p className="font-sans text-xs font-semibold text-neutral-400">
            {formatPrice(Number(product.price))}
          </p>
        </div>
      </Link>

      <div className="mt-4 flex gap-2 w-full px-1">
        
        {/* زر الإضافة للسلة بالأيقونة المخصصة الجديدة */}
        <Button
          onClick={handleAddToCart}
          disabled={soldOut}
          size="sm"
          className="aspect-square h-9 w-9 rounded-lg bg-foreground p-0 text-background hover:bg-foreground/90 flex items-center justify-center transition-all duration-250 disabled:bg-neutral-800 disabled:text-neutral-500 shrink-0 order-first"
          aria-label="أضف للسلة"
        >
          <ShoppingPlusIcon className="size-5 shrink-0 stroke-[2.2]" />
        </Button>

        <Button
          onClick={handleQuickBuy}
          disabled={soldOut}
          size="sm"
          variant="outline"
          className="flex-1 h-9 rounded-lg border-neutral-800 bg-neutral-950/40 text-foreground hover:bg-neutral-900 hover:text-foreground flex items-center justify-center text-xs font-semibold transition-all duration-250 disabled:bg-neutral-800 disabled:text-neutral-500"
        >
          <span>{soldOut ? 'نفذت الكمية' : 'شراء سريع'}</span>
        </Button>

      </div>
      
    </div>
  )
}