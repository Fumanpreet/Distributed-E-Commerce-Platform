import { apiClient } from '../../lib/api-client'
import type { Cart, CartItemRequest, CheckoutResponse } from '../../types/api'

export async function fetchCart(): Promise<Cart> {
  const { data } = await apiClient.get<Cart>('/cart')
  return data
}

// Backend caps the quantity at available inventory
export async function addCartItem(request: CartItemRequest): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>('/cart/item/add', request)
  return data
}

// Decrements by quantity, removes the item at 0
export async function removeCartItem(request: CartItemRequest): Promise<Cart> {
  const { data } = await apiClient.patch<Cart>('/cart/item/delete', request)
  return data
}

export async function checkout(): Promise<CheckoutResponse> {
  const { data } = await apiClient.post<CheckoutResponse>('/cart/checkout')
  return data
}
