'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, Mail, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { adminLogin } from '@/lib/api'

export default function AdminLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const form = new FormData(e.currentTarget)
    const email = String(form.get('email') ?? '')
    const password = String(form.get('password') ?? '')

    try {
      const token = await adminLogin(email, password)
      
      // حفظ الـ Token في الـ LocalStorage لاستخدامه في طلبات الأدمين الأخرى
      localStorage.setItem('admin_token', token)
      
      toast.success('تم تسجيل الدخول بنجاح ✨')
      
      // التوجيه إلى لوحة التحكم الرئيسية
      router.push('/admin')
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول')
      toast.error('فشل الدخول')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-background text-foreground" dir="rtl">
      <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-8 shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-wider">ALMAH</h1>
          <p className="text-sm text-muted-foreground">لوحة تحكم المسؤول</p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-destructive/15 p-3 text-sm text-destructive border border-destructive/20">
            <ShieldAlert className="size-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">البريد الإلكتروني</Label>
            <div className="relative">
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="admin@almah.com"
                className="pl-4 pr-10 text-right"
              />
              <Mail className="absolute right-3 top-2.5 size-5 text-muted-foreground" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة السر</Label>
            <div className="relative">
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="pl-4 pr-10 text-right"
              />
              <Lock className="absolute right-3 top-2.5 size-5 text-muted-foreground" />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full rounded-full py-6 font-medium text-base"
            disabled={loading}
          >
            {loading ? 'جاري التحقق…' : 'تسجيل الدخول'}
          </Button>
        </form>
      </div>
    </div>
  )
}