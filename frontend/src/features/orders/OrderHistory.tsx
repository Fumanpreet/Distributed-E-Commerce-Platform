import { Link } from 'react-router'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../lib/api-client'
import { formatDateTime } from '../../lib/format'
import type { OrderStatus } from '../../types/api'
import { useOrders } from './hooks'

const STATUS_BADGES: Record<OrderStatus, { label: string; className: string }> = {
  PENDING_INVENTORY: { label: 'Processing', className: 'bg-amber-100 text-amber-800' },
  INVENTORY_RESERVED: { label: 'Items reserved', className: 'bg-indigo-100 text-indigo-800' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-green-100 text-green-800' },
  INVENTORY_REJECTED: { label: 'Out of stock', className: 'bg-red-100 text-red-700' },
  PAYMENT_FAILED: { label: 'Payment failed', className: 'bg-red-100 text-red-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-slate-200 text-slate-700' },
}

// Shown under the cart; renders nothing until the user has placed an order
export function OrderHistory() {
  const { data: orders, isPending, isError, error } = useOrders()

  if (isPending) return <Spinner label="Loading orders…" />
  // Keep it small: the cart above must stay usable when only the history fails
  if (isError)
    return (
      <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Couldn't load your orders: {getErrorMessage(error)}
      </p>
    )
  if (orders.length === 0) return null

  return (
    <section aria-labelledby="order-history-heading">
      <h2 id="order-history-heading" className="mb-4 text-xl font-semibold">
        Your orders
      </h2>
      <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
        {orders.map((order) => {
          const badge = STATUS_BADGES[order.status]
          return (
            <li key={order.orderId}>
              <Link
                to={`/orders/${encodeURIComponent(order.orderId)}`}
                className="flex flex-col gap-2 p-4 hover:bg-slate-50 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{formatDateTime(order.createdAt)}</p>
                  <p className="truncate text-sm text-slate-500">
                    {order.itemCount} {order.itemCount === 1 ? 'item' : 'items'} · Order{' '}
                    {order.orderId}
                  </p>
                </div>
                <span
                  className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${badge.className}`}
                >
                  {badge.label}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
