import { apiClient } from '../../lib/api-client'
import type { Order, OrderSummary } from '../../types/api'

export async function fetchOrder(orderId: string): Promise<Order> {
  const { data } = await apiClient.get<Order>(`/orders/${encodeURIComponent(orderId)}`)
  return data
}

export async function fetchOrders(): Promise<OrderSummary[]> {
  const { data } = await apiClient.get<OrderSummary[]>('/orders')
  return data
}
