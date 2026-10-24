import { apiClient } from '../../lib/api-client'
import type { Product } from '../../types/api'

export async function fetchProducts(): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/catalog/products')
  return data
}

export async function searchProducts(query: string): Promise<Product[]> {
  const { data } = await apiClient.get<Product[]>('/catalog/product/search', {
    params: { q: query },
  })
  return data
}

export async function fetchProduct(id: string): Promise<Product> {
  const { data } = await apiClient.get<Product>(`/catalog/product/${encodeURIComponent(id)}`)
  return data
}
