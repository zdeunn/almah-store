'use client'

import { useState, useEffect, type FormEvent } from 'react'
import Image from 'next/image'
import { Check, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/components/cart-provider'
import { guestCheckout } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import wilayasData from '@/data/wilayas.json'
import communesData from '@/data/algeria.json'

type Status = 'idle' | 'submitting' | 'done'

export function CheckoutDialog() {
  const { lines, total, count, isCheckoutOpen, setCheckoutOpen, setQuantity, removeItem, clear } =
    useCart()
  const [status, setStatus] = useState<Status>('idle')
  const [orderId, setOrderId] = useState<number | null>(null)

  // الولايات والبلديات
  const [wilayas] = useState<any[]>(wilayasData)
  const [communes, setCommunes] = useState<any[]>([])
  const [selectedWilayaCode, setSelectedWilayaCode] = useState<string>('')
  const [selectedCommune, setSelectedCommune] = useState<string>('')
  const [wilayaSearch, setWilayaSearch] = useState<string>('')
  const [isWilayaOpen, setIsWilayaOpen] = useState(false)

  const normalizeArabic = (text: string) => {
    return text
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
  }

  const filteredWilayas = wilayas.filter((wilaya: any) => {
    const search = normalizeArabic(wilayaSearch)

    if (!search) return true

    const arabicName = normalizeArabic(
      String(wilaya.ar_name || '')
    )

    const frenchName = normalizeArabic(
      String(wilaya.name || '')
    )

    const code = String(wilaya.code || '')

    return (
      arabicName.startsWith(search) ||
      frenchName.startsWith(search) ||
      code.startsWith(search)
    )
  })

  // تحديث البلديات عند تغيير الولاية
  useEffect(() => {
    if (!selectedWilayaCode) {
      setCommunes([])
      return
    }

    const filteredCommunes = communesData.filter(
      (commune: any) =>
        String(commune.wilaya_id) === String(selectedWilayaCode)
    )

    setCommunes(filteredCommunes)
  }, [selectedWilayaCode])

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (lines.length === 0) return
    const form = new FormData(e.currentTarget)

    const wilayaObj = wilayas.find((w) => String(w.code) === String(selectedWilayaCode))
    const wilayaName = wilayaObj ? `${wilayaObj.code} - ${wilayaObj.ar_name || wilayaObj.name}` : ''
    const streetDetails = String(form.get('street_details') ?? '')
    const fullAddress = `${wilayaName} - ${selectedCommune} (${streetDetails})`

    setStatus('submitting')
    try {
      const order = await guestCheckout(
        {
          name: String(form.get('name') ?? ''),
          phone_number: String(form.get('phone') ?? ''),
          delivery_address: fullAddress,
        },
        {
          total_price: total.toFixed(2),
          items: lines.map((l) => ({
            product_id: l.product.id,
            quantity: l.quantity,
          })),
        },
      )
      setOrderId(order.id)
      setStatus('done')
      clear()
    } catch (err) {
      console.log('[v0] checkout failed:', (err as Error).message)
      toast.error('فشلت عملية الدفع', {
        description: 'يرجى المحاولة مرة أخرى بعد قليل.',
      })
      setStatus('idle')
    }
  }

  function handleOpenChange(open: boolean) {
    setCheckoutOpen(open)
    if (!open) {
      setTimeout(() => {
        setStatus('idle')
        setOrderId(null)
        setSelectedWilayaCode('')
        setSelectedCommune('')
      }, 200)
    }
  }

  return (
    <Dialog open={isCheckoutOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] gap-0 overflow-y-auto sm:max-w-lg text-right" dir="rtl">
        {status === 'done' ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent mb-4">
              <Check className="size-7" />
            </span>
            <DialogHeader className="mt-2">
              <DialogTitle className="font-serif text-2xl text-foreground">تم تأكيد طلبكِ بنجاح ✨</DialogTitle>
              <DialogDescription className="mt-2 text-muted-foreground leading-relaxed">
                شكراً لكِ لتسوقكِ من ألما! تم تسجيل طلبكِ {orderId ? `#${orderId}` : ''}. سيتصل بكِ فريق خدمة العملاء قريباً لتأكيد الشحن والتوصيل.
              </DialogDescription>
            </DialogHeader>
            <Button className="mt-6 rounded-full px-8" onClick={() => handleOpenChange(false)}>
              مواصلة التسوق
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-4">
              <DialogTitle className="font-serif text-2xl text-foreground">حقيبة التسوق الخاصة بكِ</DialogTitle>
              <DialogDescription>
                {count > 0
                  ? 'أتمي طلبكِ سريعاً كزائرة دون الحاجة لإنشاء حساب.'
                  : 'حقيبتكِ فارغة حالياً. أضيفي بعض القطع الأنيقة للبدء.'}
              </DialogDescription>
            </DialogHeader>

            {lines.length > 0 && (
              <div className="mt-4 flex flex-col gap-4 max-h-[240px] overflow-y-auto pl-2">
                {lines.map((line) => (
                  <div key={line.product.id} className="flex gap-4 items-center border-b border-border/40 pb-3">
                    <div className="relative size-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                      <Image
                        src={line.product.image_url || '/placeholder.svg'}
                        alt={line.product.title}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 flex-col justify-between h-full">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium leading-snug text-foreground">{line.product.title}</p>
                        <button
                          type="button"
                          aria-label={`إزالة ${line.product.title}`}
                          onClick={() => removeItem(line.product.id)}
                          className="text-muted-foreground transition-colors hover:text-destructive mr-auto"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-1 rounded-full border border-border">
                          <button
                            type="button"
                            aria-label="تقليل الكمية"
                            onClick={() => setQuantity(line.product.id, line.quantity - 1)}
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <Minus className="size-3.5" />
                          </button>
                          <span className="w-5 text-center text-sm tabular-nums text-foreground">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label="زيادة الكمية"
                            onClick={() => setQuantity(line.product.id, line.quantity + 1)}
                            className="flex size-7 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
                          >
                            <Plus className="size-3.5" />
                          </button>
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(Number.parseFloat(line.product.price) * line.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {lines.length > 0 ? (
              <form onSubmit={handleSubmit} className="mt-6">
                <div className="mb-6 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-medium text-muted-foreground">الإجمالي الإجمالي</span>
                  <span className="font-serif text-xl font-bold text-foreground">{formatPrice(total)}</span>
                </div>

                <div className="grid gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="name" className="text-sm text-foreground">الاسم الكامل</Label>
                    <Input id="name" name="name" required placeholder="أمنة بن علي" autoComplete="name" className="text-right" />
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="phone" className="text-sm text-foreground">رقم الهاتف</Label>
                    <Input
                      id="phone"
                      name="phone"
                      required
                      type="tel"
                      inputMode="tel"
                      placeholder="05… / 06… / 07…"
                      autoComplete="tel"
                      className="text-right"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-sm text-foreground">
                      الولاية
                    </Label>

                    <div className="relative">
                      <Input
                        type="text"
                        value={wilayaSearch}
                        onChange={(e) => {
                          setWilayaSearch(e.target.value)
                          setIsWilayaOpen(true)

                          if (selectedWilayaCode) {
                            setSelectedWilayaCode('')
                            setSelectedCommune('')
                          }
                        }}
                        onFocus={() => setIsWilayaOpen(true)}
                        placeholder="ابحث عن الولاية..."
                        autoComplete="off"
                        className="text-right"
                        dir="rtl"
                      />

                      {isWilayaOpen && (
                        <div
                          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-border bg-background shadow-lg"
                          dir="rtl"
                        >
                          {filteredWilayas.length > 0 ? (
                            filteredWilayas.map((wilaya: any) => (
                              <button
                                key={wilaya.code}
                                type="button"
                                className="flex w-full items-center justify-between px-3 py-3 text-right text-sm transition-colors hover:bg-accent/10"
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  setSelectedWilayaCode(String(wilaya.code))
                                  setWilayaSearch(
                                    `${wilaya.code} - ${wilaya.ar_name || wilaya.name}`
                                  )
                                  setIsWilayaOpen(false)
                                  setSelectedCommune('')
                                }}
                              >
                                <span>
                                  {wilaya.ar_name || wilaya.name}
                                </span>

                                <span className="text-muted-foreground">
                                  {wilaya.code}
                                </span>
                              </button>
                            ))
                          ) : (
                            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                              لا توجد ولاية مطابقة للبحث
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-1.5">
                    <Label className="text-sm text-foreground">البلدية</Label>
                    <select
                      required
                      disabled={!selectedWilayaCode}
                      value={selectedCommune}
                      onChange={(e) => setSelectedCommune(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-right focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="">
                        {selectedWilayaCode ? 'اختر البلدية...' : 'اختر الولاية أولاً'}
                      </option>
                      {communes.map((commune: any, index: number) => (
                        <option key={index} value={commune.ar_name || commune.name}>
                          {commune.ar_name || commune.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <Label htmlFor="street_details" className="text-sm text-foreground">الحي / الشارع / رقم المنزل</Label>
                    <Input
                      id="street_details"
                      name="street_details"
                      required
                      placeholder="مثال: حي الموز، عمارة 04، رقم 12"
                      className="text-right"
                    />
                  </div>
                </div>

                <DialogFooter className="mt-6">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-full font-medium"
                    disabled={status === 'submitting'}
                  >
                    {status === 'submitting'
                      ? 'جاري إرسال الطلب…'
                      : `تأكيد الطلب والدفع عند الاستلام · ${formatPrice(total)}`}
                  </Button>
                </DialogFooter>
              </form>
            ) : (
              <div className="mt-6 flex flex-col items-center gap-4 py-6 text-muted-foreground">
                <ShoppingBag className="size-8 animate-pulse" />
                <Button className="rounded-full px-8" onClick={() => handleOpenChange(false)}>
                  تصفح التشكيلة الصيفية
                </Button>
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}