import { useEffect, useState, type FormEvent } from 'react'
import { useSearchParams } from 'react-router'
import { SearchIcon } from '../../components/ui/icons'
import { Message } from '../../components/ui/Message'
import { Spinner } from '../../components/ui/Spinner'
import { getErrorMessage } from '../../lib/api-client'
import { useProducts } from './hooks'
import { ProductCard } from './ProductCard'

export function ProductListPage() {
  // The URL holds the committed search (survives refresh and back/forward).
  // The input edits a local draft that only reaches the URL on submit.
  const [searchParams, setSearchParams] = useSearchParams()
  const q = searchParams.get('q') ?? ''
  const [draft, setDraft] = useState(q)
  const { data: products, isPending, isError, error, isFetching } = useProducts(q)

  // Keep the box in sync when back/forward changes the URL
  useEffect(() => {
    setDraft(q)
  }, [q])

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const term = draft.trim()
    setSearchParams(term ? { q: term } : {})
    setDraft(term)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">{q ? `Results for “${q}”` : 'Products'}</h1>
        <form role="search" onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="search"
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value)
              // Clearing is the one change that doesn't wait for Enter: bring the full list back
              if (e.target.value === '' && q !== '') setSearchParams({})
            }}
            enterKeyHint="search"
            placeholder="Search products…"
            aria-label="Search products"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none sm:w-72"
          />
          <button
            type="submit"
            aria-label="Search"
            className="rounded-lg bg-indigo-600 px-3 text-white transition-colors hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <SearchIcon className="h-5 w-5" />
          </button>
        </form>
      </div>

      {isPending ? (
        <Spinner label="Loading products…" />
      ) : isError ? (
        <Message tone="error" title="Couldn't load products" description={getErrorMessage(error)} />
      ) : products.length === 0 ? (
        <Message title="No products found" description="Try a different search term." />
      ) : (
        <ul
          className={`grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 ${isFetching ? 'opacity-60' : ''}`}
        >
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
