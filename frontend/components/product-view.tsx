'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Truck, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/components/cart-provider'
import { formatPrice } from '@/lib/format'

import { ShoppingPlusIcon } from '@/components/product-card'
import { Product } from '@/lib/types'

interface ProductViewProps {
  product: Product
}

export function ProductView({ product }: ProductViewProps) {
  const { addItem, openCheckout } = useCart()

  // 1. تجميع واستخراج مسارات الصور المتاحة للمنتج
  const productImages = React.useMemo(() => {
    if (!product) return []

    if (product.images && product.images.length > 0) {
      return [...product.images]
        .sort((a, b) => {
          if (a.is_primary) return -1
          if (b.is_primary) return 1
          return (a.display_order || 0) - (b.display_order || 0)
        })
        .map((img) => img.image_url)
    }

    if (product.image_url) {
      return [product.image_url]
    }

    return ['/placeholder.svg']
  }, [product])

  const [selectedImage, setSelectedImage] = useState<string>('')

  React.useEffect(() => {
    if (productImages.length > 0) {
      setSelectedImage(productImages[0])
    }
  }, [productImages])

  const soldOut = product.stock <= 0

  const getFullImageUrl = (url: string) => {
    if (!url) return '/placeholder.svg'
    if (url.startsWith('http') || url.startsWith('/')) return url
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    return `${baseUrl}/${url}`
  }

  const activeImage = selectedImage || productImages[0]
  const currentIndex = productImages.indexOf(activeImage)

  // أزرار التنقل (التالي / السابق) - يتم تغيير الصورة الرئيسية مباشرة
  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % productImages.length
    setSelectedImage(productImages[nextIdx])
  }

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + productImages.length) % productImages.length
    setSelectedImage(productImages[prevIdx])
  }

  function handleAddToCart() {
    if (!product) return;

    addItem({ ...product, id: product.id!, image_url: activeImage })
    toast.success('تمت الإضافة إلى السلة', {
      description: product.title,
    })
  }

  function handleQuickBuy() {
    if (!product || !product.id) return;
    addItem({ ...product, image_url: activeImage })
    openCheckout()
  }

  return (
    <>
      {/* القسم العلوي: معرض الصور وتفاصيل المنتج */}
      <div className="grid gap-8 md:grid-cols-2">

        {/* جهة اليمين: معرض الصور التفاعلي مع أسهم للتنقل */}
        <div className="flex flex-col gap-4">
          
          <div className="relative group">
            {/* الصورة الرئيسية الكبيرة */}
            <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 shadow-sm">
              <Image
                src={getFullImageUrl(activeImage)}
                alt={product.title}
                fill
                priority
                className="object-cover transition-all duration-300 ease-in-out"
              />
            </div>

            {/* أزرار الأسهم */}
            {productImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                  aria-label="الصورة السابقة"
                >
                  <ChevronLeft className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-md transition-all opacity-80 group-hover:opacity-100 cursor-pointer"
                  aria-label="الصورة التالية"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          {/* شريط الصور المصغرة (Thumbnails) بالإطار الرمادي الأصلي */}
          {productImages.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 pt-1 scrollbar-none">
              {productImages.map((imgUrl, index) => {
                const isSelected = activeImage === imgUrl
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative aspect-square w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 bg-neutral-900 cursor-pointer ${
                      isSelected
                        ? 'border-foreground ring-2 ring-foreground/20 scale-95 opacity-100'
                        : 'border-neutral-800 opacity-60 hover:opacity-100 hover:border-neutral-700'
                    }`}
                  >
                    <Image
                      src={getFullImageUrl(imgUrl)}
                      alt={`${product.title} - صورة ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                )
              })}
            </div>
          )}

        </div>

        {/* جهة اليسار: تفاصيل المنتج وأزرار الشراء */}
        <div className="flex flex-col justify-center">
          <h1 className="font-serif text-3xl font-bold tracking-wide text-foreground text-right md:text-4xl">
            {product.title}
          </h1>

          <p className="mt-4 text-2xl font-semibold text-neutral-100 text-right">
            {formatPrice(product.price)}
          </p>

          <p className="mt-6 text-sm leading-relaxed text-muted-foreground text-right">
            {product.description}
          </p>

          {/* قسم الأزرار */}
          <div className="mt-8 grid grid-cols-[3fr_7fr] gap-4 w-full">

            <Button
              onClick={handleAddToCart}
              disabled={soldOut}
              size="lg"
              className="w-full rounded-xl bg-foreground py-6 text-background hover:bg-foreground/90 font-medium flex items-center justify-center gap-2 text-sm transition-all duration-250 disabled:bg-neutral-800 disabled:text-neutral-500 order-first"
            >
              <ShoppingPlusIcon className="size-5 shrink-0 stroke-[2.2]" />
              <span>أضف للسلة</span>
            </Button>

            <Button
              onClick={handleQuickBuy}
              disabled={soldOut}
              size="lg"
              variant="outline"
              className="w-full rounded-xl border-neutral-800 bg-neutral-950/20 py-6 text-foreground hover:bg-neutral-900 hover:text-foreground flex items-center justify-center text-base font-semibold transition-all duration-250 disabled:bg-neutral-800 disabled:text-neutral-500"
            >
              <span>شراء سريع</span>
            </Button>

          </div>

          {/* مميزات المتجر */}
          <div className="grid grid-cols-2 gap-4 pt-6">

            <div className="flex items-center justify-between rounded-xl border border-neutral-800 p-4 bg-neutral-900/30">
              <div className="text-right">
                <h4 className="text-xs font-medium text-foreground">توصيل سريع</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">لكل الولايات الجزائرية</p>
              </div>
              <Truck className="size-5 text-neutral-400 shrink-0" />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-neutral-800 p-4 bg-neutral-900/30">
              <div className="text-right">
                <h4 className="text-xs font-medium text-foreground">جودة مضمونة</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">فحص المنتج عند الاستلام</p>
              </div>
              <ShieldCheck className="size-5 text-neutral-400 shrink-0" />
            </div>

          </div>

        </div>
      </div>
    </>
  )
}