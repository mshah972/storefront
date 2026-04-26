import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

const empty = { items: [], subtotal: '0.00' }

export function CartProvider({ children }) {
  const { user } = useAuth()
  const [cart, setCart] = useState(empty)
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(empty)
      return
    }
    setLoading(true)
    try {
      setCart(await api.cart())
    } catch {
      setCart(empty)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => { refresh() }, [refresh])

  const add = async (productId, quantity = 1) => {
    const next = await api.addToCart(productId, quantity)
    setCart(next)
  }
  const update = async (id, productId, quantity) => {
    const next = await api.updateCartItem(id, productId, quantity)
    setCart(next)
  }
  const remove = async (id) => {
    const next = await api.removeCartItem(id)
    setCart(next)
  }
  const clearLocal = () => setCart(empty)

  const count = cart.items.reduce((n, i) => n + i.quantity, 0)

  return (
    <CartContext.Provider
      value={{ cart, loading, count, refresh, add, update, remove, clearLocal }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
