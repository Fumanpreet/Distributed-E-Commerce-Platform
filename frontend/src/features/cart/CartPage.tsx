import { Link } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Message } from '../../components/ui/Message'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../lib/api-client'
import { formatPrice } from '../../lib/format'
import type { CartItem } from '../../types/api'
import { useProductsByIds } from '../catalog/hooks'
import { OrderHistory } from '../orders/OrderHistory'
import { useAddToCart, useCart, useCheckout, useRemoveFromCart } from './hooks'

export function CartPage() {
  return (
    <div className="space-y-10">
      <CartSection />
      <OrderHistory />
    </div>
  )
}

function CartSection() {
  const { data: cart, isPending, isError, error } = useCart()
  const items = cart?.items ?? []
  const productQueries = useProductsByIds(items.map((item) => item.productId))
  const checkoutMutation = useCheckout()

  if (isPending) return <Spinner label="Loading cart…" />
  if (isError)
    return (
      <Message tone="error" title="Couldn't load your cart" description={getErrorMessage(error)} />
    )
  if (items.length === 0) {
    return (
      <Message
        title="Your cart is empty"
        description="Find something you like and add it to your cart."
        action={
          <Link to="/" className="font-medium text-indigo-600 hover:underline">
            Browse products
          </Link>
        }
      />
    )
  }

  const pricesLoaded = productQueries.every((query) => query.data)
  const subtotal = items.reduce(
    (sum, item, i) => sum + (productQueries[i]?.data?.price ?? 0) * item.quantity,
    0,
  )

  // Stay on this page: the cart empties and the new order shows up in the history below
  const handleCheckout = () =>
    checkoutMutation.mutate(undefined, {
      onSuccess: () => toast.success('Order placed'),
      onError: (err) => toast.error(getErrorMessage(err, 'Checkout failed')),
    })

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Your cart</h1>
        <ul className="divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white">
          {items.map((item, i) => (
            <CartRow
              key={item.productId}
              item={item}
              name={productQueries[i]?.data?.description}
              price={productQueries[i]?.data?.price}
            />
          ))}
        </ul>
      </section>

      <aside className="h-fit space-y-4 rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Order summary</h2>
        <div className="flex justify-between text-sm">
          <span>Subtotal</span>
          <span className="font-semibold">{pricesLoaded ? formatPrice(subtotal) : '…'}</span>
        </div>
        <Button className="w-full" onClick={handleCheckout} isLoading={checkoutMutation.isPending}>
          Checkout
        </Button>
      </aside>
    </div>
  )
}

function CartRow({
  item,
  name,
  price,
}: {
  item: CartItem
  // undefined while the product details are still loading
  name?: string | undefined
  price?: number | undefined
}) {
  const addToCart = useAddToCart()
  const removeFromCart = useRemoveFromCart()
  const busy = addToCart.isPending || removeFromCart.isPending
  const onError = (err: unknown) => toast.error(getErrorMessage(err))

  const increment = () =>
    addToCart.mutate(
      { productId: item.productId, quantity: 1 },
      {
        onSuccess: (cart) => {
          const updated = cart.items.find((i) => i.productId === item.productId)
          if (updated && updated.quantity <= item.quantity) toast.info('No more stock available')
        },
        onError,
      },
    )
  const decrement = () =>
    removeFromCart.mutate({ productId: item.productId, quantity: 1 }, { onError })
  const remove = () =>
    removeFromCart.mutate({ productId: item.productId, quantity: item.quantity }, { onError })

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
      <div className="flex-1">
        <Link
          to={`/products/${encodeURIComponent(item.productId)}`}
          className="line-clamp-2 font-medium hover:text-indigo-700"
        >
          {name ?? 'Loading…'}
        </Link>
        {price !== undefined && <p className="text-sm text-slate-500">{formatPrice(price)} each</p>}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={decrement}
          disabled={busy}
          aria-label="Decrease quantity"
          className="px-3"
        >
          −
        </Button>
        <span className="w-8 text-center tabular-nums" aria-label="Quantity">
          {item.quantity}
        </span>
        <Button
          variant="secondary"
          onClick={increment}
          disabled={busy}
          aria-label="Increase quantity"
          className="px-3"
        >
          +
        </Button>
        <Button variant="ghost" onClick={remove} disabled={busy} className="text-red-600">
          Remove
        </Button>
      </div>
    </li>
  )
}
