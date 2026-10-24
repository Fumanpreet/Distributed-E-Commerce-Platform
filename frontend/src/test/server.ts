import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import type { Cart, OrderSummary, Product, User } from '../types/api'

export const products: Product[] = [
  { id: 'p1', description: 'Blue denim jacket', noOfReviews: 12, price: 2499 },
  { id: 'p2', description: 'White cotton shirt', noOfReviews: 3, price: 999 },
]

export const user: User = { id: 1, email: 'ann@example.com', name: 'Ann' }

export const cart: Cart = {
  cartId: 'c1',
  items: [{ productId: 'p1', quantity: 2 }],
  createdAt: null,
  updatedAt: null,
}

export const orderSummary: OrderSummary = {
  orderId: 'o1',
  status: 'PENDING_INVENTORY',
  itemCount: 2,
  createdAt: '2026-10-16T10:00:00Z',
  updatedAt: '2026-10-16T10:00:00Z',
}

// Default handlers: a logged-out visitor browsing the catalog. Override per test with server.use(...)
export const server = setupServer(
  http.get('*/api/auth/me', () => new HttpResponse(null, { status: 401 })),
  http.get('*/api/orders', () => HttpResponse.json([])),
  http.get('*/api/catalog/products', () => HttpResponse.json(products)),
  http.get('*/api/catalog/product/search', ({ request }) => {
    const q = new URL(request.url).searchParams.get('q')?.toLowerCase() ?? ''
    return HttpResponse.json(products.filter((p) => p.description.toLowerCase().includes(q)))
  }),
  http.get('*/api/catalog/product/:id', ({ params: { id } }) => {
    const product = products.find((p) => p.id === id)
    return product ? HttpResponse.json(product) : new HttpResponse(null, { status: 404 })
  }),
)
