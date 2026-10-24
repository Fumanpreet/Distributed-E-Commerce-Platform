import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Button } from '../../components/ui/Button'
import { Message } from '../../components/ui/Message'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../lib/api-client'
import { formatPrice } from '../../lib/format'
import { useMe } from '../auth/hooks'
import { useAddToCart } from '../cart/hooks'
import { useProduct } from './hooks'

export function ProductDetailPage() {
  const { id = '' } = useParams()
  const { data: product, isPending, isError, error } = useProduct(id)
  const { data: user } = useMe()
  const addToCart = useAddToCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [quantity, setQuantity] = useState(1)

  if (isPending) return <Spinner />
  if (isError) {
    return (
      <Message
        tone="error"
        title="Product not available"
        description={getErrorMessage(error)}
        action={
          <Link to="/" className="text-indigo-600 hover:underline">
            Back to products
          </Link>
        }
      />
    )
  }

  const handleAdd = () => {
    if (!user) {
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`)
      return
    }
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => toast.success('Added to cart'),
        onError: (err) => toast.error(getErrorMessage(err, 'Could not add to cart')),
      },
    )
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div
        className="flex aspect-square items-center justify-center rounded-2xl bg-slate-100 text-8xl text-slate-300"
        aria-hidden
      >
        🛍️
      </div>
      <div className="space-y-5">
        <Link to="/" className="text-sm text-indigo-600 hover:underline">
          ← All products
        </Link>
        <h1 className="text-2xl font-semibold">{product.description}</h1>
        <p className="text-sm text-slate-500">{product.noOfReviews} reviews</p>
        <p className="text-3xl font-bold">{formatPrice(product.price)}</p>

        <div className="flex items-center gap-3">
          <label htmlFor="quantity" className="text-sm font-medium text-slate-700">
            Quantity
          </label>
          <select
            id="quantity"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>

        <Button onClick={handleAdd} isLoading={addToCart.isPending} className="w-full sm:w-auto">
          {user ? 'Add to cart' : 'Sign in to add to cart'}
        </Button>
      </div>
    </div>
  )
}
