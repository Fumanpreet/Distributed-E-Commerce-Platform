import { Link, useParams } from 'react-router'
import { Message } from '../../components/ui/Message'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../lib/api-client'
import type { OrderStatus } from '../../types/api'
import { isFinalStatus, useOrderStatus } from './hooks'

const STEPS: { status: OrderStatus; label: string }[] = [
  { status: 'PENDING_INVENTORY', label: 'Order placed' },
  { status: 'INVENTORY_RESERVED', label: 'Items reserved' },
  { status: 'CONFIRMED', label: 'Confirmed' },
]

const FAILURES: Partial<Record<OrderStatus, string>> = {
  INVENTORY_REJECTED: 'Some items are out of stock, so this order could not be completed.',
  PAYMENT_FAILED: 'Payment failed, so this order could not be completed.',
  CANCELLED: 'This order was cancelled.',
}

export function OrderStatusPage() {
  const { orderId = '' } = useParams()
  const { data: order, isPending, isError, error } = useOrderStatus(orderId)

  if (isPending) return <Spinner label="Loading order…" />
  if (isError)
    return (
      <Message tone="error" title="Couldn't load this order" description={getErrorMessage(error)} />
    )

  const failure = FAILURES[order.status]
  const currentStep = STEPS.findIndex((step) => step.status === order.status)

  return (
    <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-slate-200 bg-white p-8">
      <div>
        <h1 className="text-2xl font-semibold">
          {failure ? 'Order not completed' : 'Thanks for your order!'}
        </h1>
        <p className="mt-1 text-sm break-all text-slate-500">Order {order.orderId}</p>
      </div>

      {failure ? (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
          {failure}
        </p>
      ) : (
        <ol className="space-y-3" aria-label="Order progress">
          {STEPS.map((step, i) => {
            const done = i <= currentStep
            return (
              <li
                key={step.status}
                className="flex items-center gap-3"
                aria-current={i === currentStep ? 'step' : undefined}
              >
                <span
                  className={`flex size-7 items-center justify-center rounded-full text-sm font-semibold ${done ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                >
                  {done ? '✓' : i + 1}
                </span>
                <span className={done ? 'font-medium' : 'text-slate-500'}>{step.label}</span>
              </li>
            )
          })}
        </ol>
      )}

      {!isFinalStatus(order.status) && (
        <p className="text-sm text-slate-500" aria-live="polite">
          Processing your order… this page updates automatically.
        </p>
      )}

      <Link to="/" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
        Continue shopping
      </Link>
    </div>
  )
}
