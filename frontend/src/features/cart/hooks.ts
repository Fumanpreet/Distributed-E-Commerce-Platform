import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { Cart } from '../../types/api'
import { useMe } from '../auth/hooks'
import { ORDERS_QUERY_KEY } from '../orders/hooks'
import { addCartItem, checkout, fetchCart, removeCartItem } from './api'

export const CART_QUERY_KEY = ['cart'] as const

export function useCart() {
  const { data: user } = useMe()
  return useQuery({ queryKey: CART_QUERY_KEY, queryFn: fetchCart, enabled: !!user })
}

export function useCartCount(): number {
  const { data: cart } = useCart()
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0
}

// Both endpoints return the updated cart, so write it straight into the cache
function useCartMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<Cart>) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  })
}

export function useAddToCart() {
  return useCartMutation(addCartItem)
}

export function useRemoveFromCart() {
  return useCartMutation(removeCartItem)
}

export function useCheckout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: checkout,
    // The backend empties the cart once the order is created
    onSuccess: () => {
      queryClient.setQueryData<Cart>(CART_QUERY_KEY, (cart) => cart && { ...cart, items: [] })
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY })
      void queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY, exact: true })
    },
  })
}
