'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { CartLine, Product } from '@/lib/types'

interface CartContextValue {
  lines: CartLine[]
  count: number
  total: number
  isCheckoutOpen: boolean
  addItem: (product: Product) => void
  removeItem: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
  openCheckout: () => void
  setCheckoutOpen: (open: boolean) => void
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([])
  const [isCheckoutOpen, setCheckoutOpen] = useState(false)

  const addItem = useCallback((product: Product) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.product.id === product.id)
      if (existing) {
        return prev.map((l) =>
          l.product.id === product.id ? { ...l, quantity: l.quantity + 1 } : l,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
  }, [])

  const removeItem = useCallback((productId: number) => {
    setLines((prev) => prev.filter((l) => l.product.id !== productId))
  }, [])

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.product.id !== productId)
        : prev.map((l) => (l.product.id === productId ? { ...l, quantity } : l)),
    )
  }, [])

  const clear = useCallback(() => setLines([]), [])
  const openCheckout = useCallback(() => setCheckoutOpen(true), [])

  const value = useMemo<CartContextValue>(() => {
    const count = lines.reduce((sum, l) => sum + l.quantity, 0)
    const total = lines.reduce(
      (sum, l) => sum + Number.parseFloat(l.product.price) * l.quantity,
      0,
    )
    return {
      lines,
      count,
      total,
      isCheckoutOpen,
      addItem,
      removeItem,
      setQuantity,
      clear,
      openCheckout,
      setCheckoutOpen,
    }
  }, [lines, isCheckoutOpen, addItem, removeItem, setQuantity, clear, openCheckout])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within a CartProvider')
  return ctx
}