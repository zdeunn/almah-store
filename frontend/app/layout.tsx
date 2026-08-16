import { CartProvider } from '@/components/cart-provider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckoutDialog } from '@/components/checkout-dialog'
import { WebVitals } from './web-vitals' // 👈 1. تم استيراد المكون هنا

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop'),
  title: {
    default: 'ألما — ملابس نسائية عصرية وأنثوية',
    template: '%s | ألما',
  },
  description:
    'ألما هي علامة تجارية عصرية للملابس النسائية. اكتشفي المجموعة الصيفية الجديدة من الفساتين الأنيقة والبلوزات الحريرية مع ميزة الطلب السريع.',
  keywords: ['ملابس نسائية', 'فساتين صيفية', 'متجر ألبسة', 'بلوزات حرير', 'أزياء نسائية'],
  alternates: {
    canonical: './',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'ألما — ملابس نسائية عصرية',
    description: 'اكتشفي تشكيلة الفساتين والملابس النسائية الأنيقة من متجر ألما.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://almah.shop',
    siteName: 'ألما',
    locale: 'ar_DZ',
    type: 'website',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0a0a0a',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`dark bg-[#0a0a0a] ${inter.variable} ${cormorant.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="font-sans antialiased text-foreground bg-[#0a0a0a]">
        <WebVitals /> {/* 👈 2. تم إضافة المكون هنا لتتبع الأداء */}
        <CartProvider>
          <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </div>

          <CheckoutDialog />
          <Toaster position="bottom-center" />
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}