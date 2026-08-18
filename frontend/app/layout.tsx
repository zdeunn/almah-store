import { CartProvider } from '@/components/cart-provider'
import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Cormorant_Garamond } from 'next/font/google'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CheckoutDialog } from '@/components/checkout-dialog'
import { WebVitals } from './web-vitals'

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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://almah-store.vercel.app'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'ALMAH | ألما — ألبسة تقليدية جزائرية فاخرة وأزياء عصرية',
    template: '%s | ألما — ALMAH',
  },
  description:
    'متجر ALMAH (ألما) - أصالة الألبسة التقليدية الجزائرية الفاخرة المصنوعة يدوياً والعصرية. تشكيلات مميزة من الكاراكو، القفطان، القندورة، واللباس القبائلي مع طلب سريع وتوصيل لجميع الولايات والدفع عند الاستلام.',
  keywords: [
    'ألما',
    'ALMAH',
    'ألبسة تقليدية جزائرية',
    'كاراكو جزائري فاخر',
    'قندورة',
    'قفطان',
    'لباس قبائلي',
    'كاميزورا',
    'ملابس تقليدية مصنوعة يدويا',
    'أزياء نسائية الجزائر',
    'متجر ألبسة تقليدية'
  ],
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
    title: 'ALMAH | ألما — ألبسة تقليدية جزائرية فاخرة',
    description: 'اكتشفي تشكيلة الكاراكو، القفطان، والقندورة الفاخرة المصنوعة يدوياً من متجر ألما. طلب سريع وتوصيل لجميع الولايات مع الدفع عند الاستلام.',
    url: siteUrl,
    siteName: 'ألما — ALMAH',
    locale: 'ar_DZ',
    type: 'website',
  },
  icons:{
    icon: 'shopping-bag.svg',
    shortcut: 'shopping-bag.svg',
    apple: 'shopping-bag.svg',
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
  // كود البيانات المنظمة Structured Data لعناكب محركات البحث
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'OnlineStore',
    'name': 'ألما — ALMAH',
    'url': siteUrl,
    'description': 'متجر متخصّص في الألبسة التقليدية الجزائرية الفاخرة المصنوعة يدوياً والعصرية، يوفر ميزة الطلب السريع والتوصيل لكل الولايات والدفع عند الاستلام.',
    'currenciesAccepted': 'DZD',
    'paymentAccepted': 'Cash on Delivery',
    'priceRange': '$$$',
    'areaServed': {
      '@type': 'Country',
      'name': 'Algeria',
    },
  }

  return (
    <html 
      lang="ar" 
      dir="rtl" 
      className={`dark bg-[#0a0a0a] ${inter.variable} ${cormorant.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased text-foreground bg-[#0a0a0a]">
        <WebVitals />
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