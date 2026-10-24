import { useQuery } from '@tanstack/react-query'
import type { OrderStatus, OrderSummary } from '../../types/api'
import { useMe } from '../auth/hooks'
import { fetchOrder, fetchOrders } from './api'

export const FINAL_STATUSES: OrderStatus[] = [
  'CONFIRMED',
  'INVENTORY_REJECTED',
  'CANCELLED',
  'PAYMENT_FAILED',
]

const POLL_INTERVAL_MS = 2_000
// The order is processed asynchronously (outbox → Debezium → SQS → inventory), so poll ~2 minutes, then stop
const MAX_POLLS = 60
const MAX_POLL_AGE_MS = POLL_INTERVAL_MS * MAX_POLLS

export const ORDERS_QUERY_KEY = ['orders'] as const

export function isFinalStatus(status: OrderStatus): boolean {
  return FINAL_STATUSES.includes(status)
}

export function useOrderStatus(orderId: string) {
  return useQuery({
    queryKey: ['orders', orderId],
    queryFn: () => fetchOrder(orderId),
    refetchInterval: (query) => {
      const status = query.state.data?.status
      if ((status && isFinalStatus(status)) || query.state.dataUpdateCount >= MAX_POLLS)
        return false
      return POLL_INTERVAL_MS
    },
  })
}

// Keep polling the history while a recently placed order is still in flight
function hasRecentOpenOrder(orders: OrderSummary[] | undefined): boolean {
  return (orders ?? []).some(
    (order) =>
      !isFinalStatus(order.status) && Date.now() - Date.parse(order.createdAt) < MAX_POLL_AGE_MS,
  )
}

export function useOrders() {
  const { data: user } = useMe()
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: fetchOrders,
    enabled: !!user,
    refetchInterval: (query) => (hasRecentOpenOrder(query.state.data) ? POLL_INTERVAL_MS : false),
  })
}
