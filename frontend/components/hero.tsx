'use client'

import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Hero() {
  return (
    <section id="top" className="mx-auto max-w-6xl px-4 pt-8 md:px-6 md:pt-12">
      <div className="grid items-center gap-8 md:grid-cols-2 md:gap-12">
        {/* النصوص والتحكم */}
        <div className="order-2 md:order-1">
          <p className="text-sm font-medium uppercase tracking-[0.25em] text-accent text-center md:text-right">
            صيف 2026
          </p>
          <h1 className="mt-4 text-balance font-serif text-4xl font-medium leading-[1.15] text-foreground sm:text-5xl md:text-6xl text-center md:text-right">
            مجموعة الصيف الجديدة
          </h1>
          <p className="mt-5 max-w-md mx-auto md:mx-0 text-pretty leading-relaxed text-muted-foreground text-center md:text-right">
            قطع مريحة ومصممة بعناية للمرأة العصرية. اكتشفي الفساتين الانسيابية والبلوزات الأنيقة التي صممت خصيصاً لتتحرك معكِ بكل خفة.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3 justify-center md:justify-start">
            <Button
              render={<a href="#collection" />}
              nativeButton={false}
              size="lg"
              className="rounded-xl px-7 bg-foreground text-background hover:bg-foreground/90 font-medium"
            >
              <span>تسوقي المجموعة</span>
              <ArrowLeft className="size-4 mr-2" />
            </Button>
            <Button
              render={<a href="#about" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="rounded-xl px-7 border-neutral-800 text-foreground hover:bg-secondary font-medium"
            >
              قصتنا
            </Button>
          </div>
        </div>

        {/* صورة رئيسة واحدة بتركيز عالي وأداء مثالي للـ LCP */}
        <div className="order-1 md:order-2">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src="/products/the-algerian-culture.webp"
              alt="مجموعة الصيف الجديدة"
              fill
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  )
}