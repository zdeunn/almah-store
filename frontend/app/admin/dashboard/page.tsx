'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Package, ShoppingBag, LogOut, Plus, RefreshCw, Pencil, Trash2, X, Eye, EyeOff, Upload, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  getAdminOrders, 
  updateOrderStatus, 
  createAdminProduct, 
  getProducts,
  updateAdminProduct,
  deleteAdminProduct,
  uploadProductImages,
  deleteProductImage
} from '@/lib/api'
import { formatPrice } from '@/lib/format'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: { label: 'قيد الانتظار', className: 'bg-amber-500/15 text-amber-500' },
  paid: { label: 'تم الدفع', className: 'bg-indigo-500/15 text-indigo-500' },
  shipped: { label: 'تم الشحن', className: 'bg-blue-500/15 text-blue-500' },
  delivered: { label: 'تم التوصيل', className: 'bg-emerald-500/15 text-emerald-500' },
  cancelled: { label: 'ملغى', className: 'bg-rose-500/15 text-rose-500' },
}

export default function AdminDashboardPage() {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'orders' | 'products'>('orders')
  
  // الفلتر الفرعي الخاص بقسم المنتجات
  const [productFilter, setProductFilter] = useState<'active' | 'inactive'>('active')

  // Data States
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // New Product Form State
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [newProduct, setNewProduct] = useState({
    title: '',
    description: '',
    price: '',
    cost_price: '',
    stock: 10,
    image_url: '',
  })

  // Edit Product State
  const [editingProduct, setEditingProduct] = useState<any | null>(null)
  const [editFiles, setEditFiles] = useState<File[]>([])

  useEffect(() => {
    const storedToken = localStorage.getItem('admin_token')
    if (!storedToken) {
      router.push('/admin/login')
    } else {
      setToken(storedToken)
      loadData(storedToken)
    }
  }, [])

  async function loadData(authToken: string) {
    setLoading(true)
    try {
      const [ordersData, productsData] = await Promise.all([
        getAdminOrders(authToken).catch(() => []),
        getProducts(true).catch(() => []),
      ])
      setOrders(ordersData)
      setProducts(productsData)
    } catch (err) {
      toast.error('حدث خطأ أثناء تحميل البيانات')
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(orderId: number, newStatus: string) {
    if (!token) return
    try {
      await updateOrderStatus(orderId, newStatus, token)
      toast.success(`تم تحديث حالة الطلب #${orderId}`)
      loadData(token)
    } catch (err) {
      toast.error('فشل تحديث حالة الطلب')
    }
  }

  async function handleCreateProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    try {
      // 1. إنشاء المنتج أولاً
      const created = await createAdminProduct(
        {
          ...newProduct,
          price: parseFloat(newProduct.price),
          cost_price: newProduct.cost_price ? parseFloat(newProduct.cost_price) : 0.0,
          stock: parseInt(String(newProduct.stock)),
        },
        token
      )

      // 2. إذا تم تحديد صور مرفوعة، يتم رفعها وتخصيصها للمنتج الجديد
      if (selectedFiles.length > 0 && created?.id) {
        await uploadProductImages(created.id, selectedFiles, token)
      }

      toast.success('تمت إضافة المنتج بنجاح ✨')
      setShowAddProduct(false)
      setSelectedFiles([])
      setNewProduct({ title: '', description: '', price: '', cost_price: '', stock: 10, image_url: '' })
      loadData(token)
    } catch (err) {
      toast.error('فشلت إضافة المنتج')
    }
  }

  async function handleUpdateProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !editingProduct) return
    try {
      const payload: any = {}
      if (editingProduct.title) payload.title = editingProduct.title
      if (editingProduct.description !== undefined) payload.description = editingProduct.description
      if (editingProduct.price) payload.price = parseFloat(String(editingProduct.price))
      if (editingProduct.cost_price) payload.cost_price = parseFloat(String(editingProduct.cost_price))
      if (editingProduct.stock !== undefined) payload.stock = parseInt(String(editingProduct.stock))
      if (editingProduct.image_url) payload.image_url = editingProduct.image_url

      await updateAdminProduct(editingProduct.id, payload, token)

      // رفع الصور الجديدة الإضافية إذا وُجدت
      if (editFiles.length > 0) {
        await uploadProductImages(editingProduct.id, editFiles, token)
      }

      toast.success('تم تحديث بيانات المنتج بنجاح 👍')
      setEditingProduct(null)
      setEditFiles([])
      loadData(token)
    } catch (err) {
      toast.error('فشل تحديث المنتج')
    }
  }

  async function handleDeleteImage(imageId: number) {
    if (!token || !editingProduct) return
    try {
      await deleteProductImage(editingProduct.id, imageId, token)
      toast.success('تم حذف الصورة')
      setEditingProduct({
        ...editingProduct,
        images: editingProduct.images.filter((img: any) => img.id !== imageId),
      })
      loadData(token)
    } catch (err) {
      toast.error('فشل حذف الصورة')
    }
  }

  async function handleToggleActive(product: any) {
    if (!token) return
    try {
      await updateAdminProduct(product.id, { 
        ...product, 
        is_active: !product.is_active 
      }, token)
      toast.success(product.is_active ? 'تم إخفاء المنتج عن الزبائن' : 'تم تفعيل المنتج وإظهاره للزبائن')
      loadData(token)
    } catch (err) {
      toast.error('فشل تغيير حالة المنتج')
    }
  }

  async function handleDeleteProduct(productId: number) {
    if (!token) return
    if (!confirm('هل أنت تأكد من رغبتك في حذف هذا المنتج نهائياً؟')) return
    try {
      await deleteAdminProduct(productId, token)
      toast.success('تم حذف المنتج بنجاح')
      loadData(token)
    } catch (err) {
      toast.error('فشل حذف المنتج')
    }
  }

  function handleLogout() {
    localStorage.removeItem('admin_token')
    router.push('/admin/login')
  }

  const activeProducts = products.filter(p => p.is_active !== false)
  const inactiveProducts = products.filter(p => p.is_active === false)
  const displayedProducts = productFilter === 'active' ? activeProducts : inactiveProducts

  if (loading && !token) {
    return <div className="flex h-screen items-center justify-center bg-background text-foreground">جاري التحقق...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-border bg-card px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-serif text-2xl font-bold tracking-wider">ALMAH</h1>
          <span className="text-xs bg-accent/20 text-accent px-2.5 py-1 rounded-full font-medium">لوحة التحكم</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
          <LogOut className="size-4 ml-2" />
          تسجيل الخروج
        </Button>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-6 space-y-8">
        
        {/* Navigation Tabs */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'orders' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <ShoppingBag className="size-4" />
              الطلبات ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'products' ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-secondary'
              }`}
            >
              <Package className="size-4" />
              المنتجات ({products.length})
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => token && loadData(token)}>
            <RefreshCw className="size-4 ml-2" />
            تحديث
          </Button>
        </div>

        {/* Tab 1: Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <h2 className="text-lg font-serif font-semibold">طلبات الزبائن الحية</h2>
            <div className="overflow-x-auto rounded-xl border border-border bg-card">
              <table className="w-full text-right text-sm">
                <thead className="bg-secondary/40 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="p-4">رقم الطلب</th>
                    <th className="p-4">اسم الزبون</th>
                    <th className="p-4">رقم الهاتف</th>
                    <th className="p-4">العنوان / الولاية</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الإجمالي</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-muted-foreground">لا توجد طلبات مسجلة حتى الآن.</td>
                    </tr>
                  ) : (
                    orders.map((order) => {
                      const statusInfo = STATUS_CONFIG[order.status] || {
                        label: order.status,
                        className: 'bg-secondary text-muted-foreground',
                      }

                      return (
                        <tr key={order.id} className="hover:bg-secondary/20">
                          <td className="p-4 font-mono font-bold">#{order.id}</td>
                          <td className="p-4 font-medium">{order.user?.full_name || order.full_name || '—'}</td>
                          <td className="p-4 font-mono text-xs dir-ltr text-right">{order.user?.phone || order.phone || '—'}</td>
                          <td className="p-4 text-xs text-muted-foreground">{order.user?.wilaya || order.user?.address || order.wilaya || order.address || '—'}</td>
                          <td className="p-4 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ar-DZ')}</td>
                          <td className="p-4 font-semibold">{formatPrice(order.total_price)}</td>
                          <td className="p-4">
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${statusInfo.className}`}>
                              {statusInfo.label}
                            </span>
                          </td>
                          <td className="p-4 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, 'shipped')}>
                              تحديد كـ "شُحِن"
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleStatusChange(order.id, 'delivered')}>
                              تحديد كـ "تُم التوصيل"
                            </Button>
                            <Button size="sm" variant="outline" className="text-rose-500 hover:text-rose-600" onClick={() => handleStatusChange(order.id, 'cancelled')}>
                              إلغاء
                            </Button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Products */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-serif font-semibold">إدارة المنتجات</h2>
              <Button onClick={() => setShowAddProduct(!showAddProduct)}>
                <Plus className="size-4 ml-2" />
                إضافة منتج جديد
              </Button>
            </div>

            {/* الفلاتر الفرعية */}
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <button
                onClick={() => setProductFilter('active')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  productFilter === 'active'
                    ? 'bg-foreground text-background font-bold'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                }`}
              >
                المنتجات المعروضة ({activeProducts.length})
              </button>
              <button
                onClick={() => setProductFilter('inactive')}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                  productFilter === 'inactive'
                    ? 'bg-amber-500 text-white font-bold'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
                }`}
              >
                المنتجات المخفية ({inactiveProducts.length})
              </button>
            </div>

            {/* Form Add Product */}
            {showAddProduct && (
              <form onSubmit={handleCreateProduct} className="p-6 rounded-xl border border-border bg-card space-y-4">
                <h3 className="font-semibold mb-2">إضافة قطعة جديدة للتشكيلة</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>عنوان المنتج</Label>
                    <Input required value={newProduct.title} onChange={e => setNewProduct({...newProduct, title: e.target.value})} placeholder="فستان صيفي حريري" />
                  </div>
                  <div>
                    <Label>سعر البيع (د.ج)</Label>
                    <Input type="number" step="0.01" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="8500" />
                  </div>
                  <div>
                    <Label>سعر التكلفة (د.ج)</Label>
                    <Input type="number" step="0.01" required value={newProduct.cost_price} onChange={e => setNewProduct({...newProduct, cost_price: e.target.value})} placeholder="5000" />
                  </div>
                  <div>
                    <Label>المخزون المتوفر</Label>
                    <Input type="number" required value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <Label>رابط الصورة الرئيسية (رابط خارجي)</Label>
                    <Input value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} placeholder="/products/image.jpg" />
                  </div>

                  {/* رفع ملفات صور متعددة */}
                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Upload className="size-3.5" />
                      رفع صور متعددة للملف
                    </Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files))
                        }
                      }}
                      className="cursor-pointer text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label>وصف المنتج</Label>
                  <Input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="تفاصيل القماش والتصميم..." />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setShowAddProduct(false)}>إلغاء</Button>
                  <Button type="submit">حفظ ونشر المنتج</Button>
                </div>
              </form>
            )}

            {/* Edit Product Modal */}
            {editingProduct && (
              <form onSubmit={handleUpdateProduct} className="p-6 rounded-xl border-2 border-accent bg-card space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-semibold text-accent">تعديل المنتج #{editingProduct.id}</h3>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setEditingProduct(null)}>
                    <X className="size-4" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>عنوان المنتج</Label>
                    <Input required value={editingProduct.title || ''} onChange={e => setEditingProduct({...editingProduct, title: e.target.value})} />
                  </div>
                  <div>
                    <Label>سعر البيع (د.ج)</Label>
                    <Input type="number" step="0.01" required value={editingProduct.price || ''} onChange={e => setEditingProduct({...editingProduct, price: e.target.value})} />
                  </div>
                  <div>
                    <Label>سعر التكلفة (د.ج)</Label>
                    <Input type="number" step="0.01" value={editingProduct.cost_price || ''} onChange={e => setEditingProduct({...editingProduct, cost_price: e.target.value})} />
                  </div>
                  <div>
                    <Label>المخزون المتوفر</Label>
                    <Input type="number" required value={editingProduct.stock ?? 0} onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value)})} />
                  </div>
                  <div>
                    <Label>رابط الصورة المفردة (URL)</Label>
                    <Input value={editingProduct.image_url || ''} onChange={e => setEditingProduct({...editingProduct, image_url: e.target.value})} />
                  </div>

                  <div>
                    <Label className="flex items-center gap-1.5">
                      <Upload className="size-3.5" />
                      إضافة صور جديدة
                    </Label>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          setEditFiles(Array.from(e.target.files))
                        }
                      }}
                      className="cursor-pointer text-xs"
                    />
                  </div>
                </div>

                {/* معرض صور المنتج الحالية مع إمكانية الحذف */}
                {editingProduct.images && editingProduct.images.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <Label className="text-xs">الصور المرفوعة حالياً للمنتج:</Label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                      {editingProduct.images.map((img: any) => (
                        <div key={img.id} className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-lg border border-border group">
                          <img src={img.image_url.startsWith('http') || img.image_url.startsWith('/') ? img.image_url : `http://localhost:8000/${img.image_url}`} alt="" className="object-cover w-full h-full" />
                          <button
                            type="button"
                            onClick={() => handleDeleteImage(img.id)}
                            className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity"
                            title="حذف الصورة"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <Label>وصف المنتج</Label>
                  <Input value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="ghost" onClick={() => setEditingProduct(null)}>إلغاء</Button>
                  <Button type="submit">تحديث البيانات</Button>
                </div>
              </form>
            )}

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {displayedProducts.length === 0 ? (
                <div className="col-span-full py-12 text-center text-muted-foreground border border-dashed rounded-xl">
                  {productFilter === 'active' ? 'لا توجد منتجات معروضة حالياً.' : 'لا توجد منتجات مخفية حالياً.'}
                </div>
              ) : (
                displayedProducts.map((p) => {
                  const isActive = p.is_active ?? true
                  const imagesCount = p.images?.length || (p.image_url ? 1 : 0)

                  return (
                    <div 
                      key={p.id} 
                      className={`rounded-xl border bg-card p-4 flex justify-between items-center gap-4 transition-all ${
                        !isActive ? 'border-amber-500/40 bg-amber-500/5' : 'border-border'
                      }`}
                    >
                      <div className="flex gap-4 items-center">
                        <img src={p.image_url || p.images?.[0]?.image_url || '/placeholder.svg'} alt={p.title} className="size-20 object-cover rounded-lg bg-secondary" />
                        <div className="space-y-1">
                          <h4 className="font-semibold text-sm">{p.title}</h4>
                          <p className="text-xs text-muted-foreground">{formatPrice(p.price)}</p>
                          <div className="flex gap-2 items-center text-[10px]">
                            <span className="bg-secondary px-2 py-0.5 rounded text-muted-foreground">
                              المخزون: {p.stock ?? 0}
                            </span>
                            <span className="bg-secondary px-2 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                              <ImageIcon className="size-3" />
                              {imagesCount} صور
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2">
                        {/* زر الإخفاء والتفعيل */}
                        <Button 
                          size="icon" 
                          variant="outline" 
                          onClick={() => handleToggleActive(p)} 
                          title={isActive ? 'إخفاء المنتج عن الزبائن' : 'إعادة إظهار المنتج للزبائن'}
                          className={!isActive ? 'text-amber-500 border-amber-500/40 hover:bg-amber-500/10' : ''}
                        >
                          {isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                        </Button>

                        {/* زر التعديل */}
                        <Button size="icon" variant="outline" onClick={() => setEditingProduct(p)} title="تعديل">
                          <Pencil className="size-4" />
                        </Button>

                        {/* زر الحذف النهائي */}
                        <Button size="icon" variant="outline" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteProduct(p.id)} title="حذف نهائي">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}