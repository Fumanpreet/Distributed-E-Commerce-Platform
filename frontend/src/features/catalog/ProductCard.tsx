import { Link } from 'react-router'
import { formatPrice } from '../../lib/format'
import type { Product } from '../../types/api'

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${encodeURIComponent(product.id)}`}
      className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-md focus-visible:outline-2 focus-visible:outline-indigo-600"
    >
      <div
        className="mb-4 flex aspect-square items-center justify-center rounded-lg bg-slate-100 text-4xl text-slate-300"
        aria-hidden
      >
        🛍️
      </div>
      <h3 className="line-clamp-2 flex-1 text-sm font-medium text-slate-800 group-hover:text-indigo-700">
        {product.description}
      </h3>
      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-lg font-semibold">{formatPrice(product.price)}</span>
        <span className="text-xs text-slate-500">{product.noOfReviews} reviews</span>
      </div>
    </Link>
  )
}
