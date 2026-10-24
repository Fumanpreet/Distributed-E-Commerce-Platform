import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'
import { fetchProduct, fetchProducts, searchProducts } from './api'

export const productKeys = {
  list: (query: string) => ['products', 'list', query] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
}

export function useProducts(query: string) {
  const trimmed = query.trim()
  return useQuery({
    queryKey: productKeys.list(trimmed),
    queryFn: () => (trimmed ? searchProducts(trimmed) : fetchProducts()),
    placeholderData: keepPreviousData,
  })
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => fetchProduct(id),
    staleTime: 5 * 60_000,
  })
}

// Cart items only carry productId, so the cart page loads each product's details
export function useProductsByIds(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: productKeys.detail(id),
      queryFn: () => fetchProduct(id),
      staleTime: 5 * 60_000,
    })),
  })
}
