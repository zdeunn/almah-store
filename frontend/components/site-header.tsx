'use client'

import { Menu, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useCart } from '@/components/cart-provider'
import Link from 'next/link'
import { usePathname } from 'next/navigation' // 👈 إضافة usePathname

const NAV_LINKS = [
  { label: 'وصلنا حديثاً', href: '/#collection' }, 
  { label: 'فساتين', href: '/#collection' },
  { label: 'من نحن', href: '/#about' },
]

export function SiteHeader() {
  const pathname = usePathname()
  const { count, openCheckout } = useCart() 

  // دالة الشعار (ALMAH)
  const handleLogoClick = (e: React.MouseEvent) => {
    if (pathname === '/') {
      e.preventDefault()
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  // دالة الروابط الداخلية (وصلنا حديثاً، فساتين، من نحن)
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === '/') {
      const targetId = href.replace('/#', '')
      const element = document.getElementById(targetId)
      if (element) {
        e.preventDefault()
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-800 bg-background/85 backdrop-blur">
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-3 items-center px-4 md:px-6">
        
        {/* 1. جهة اليمين */}
        <div className="flex items-center justify-start">
          {/* الجوال */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" aria-label="Open menu">
                    <Menu className="size-5" />
                  </Button>
                }
              />
              <SheetContent side="right" className="w-72 bg-background border-neutral-800 flex flex-col">
                <SheetHeader className="pt-4">
                  <SheetTitle className="font-serif text-2xl tracking-[0.3em] text-foreground text-center">
                    ALMAH
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1 px-2 text-right">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={(e) => handleNavClick(e, link.href)}
                      className="rounded-md px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-neutral-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* روابط Desktop */}
          <nav className="hidden gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* 2. المنتصف: الشعار الرئيسي */}
        <div className="flex items-center justify-center">
          <Link
            href="/"
            onClick={handleLogoClick}
            className="font-serif text-2xl font-semibold tracking-[0.35em] text-foreground md:text-3xl select-none"
          >
            ALMAH
          </Link>
        </div>

        {/* 3. جهة اليسار */}
        <div className="flex items-center justify-end">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-foreground hover:bg-neutral-800"
            aria-label={`Open cart, ${count} items`}
            onClick={openCheckout}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {count}
              </span>
            )}
          </Button>
        </div>

      </div>
    </header>
  )
}