import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Toaster } from 'sonner'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { formatPrice } from '../../lib/format'
import { queryClient } from '../../lib/query-client'
import { CART_QUERY_KEY } from './hooks'
import { cart, orderSummary, server, user } from '../../test/server'
import { LoginPage } from '../auth/LoginPage'
import { ProtectedRoute } from '../auth/ProtectedRoute'
import { CartPage } from './CartPage'

function loggedIn() {
  server.use(http.get('*/api/auth/me', () => HttpResponse.json(user)))
}

function renderApp(url: string) {
  const router = createMemoryRouter(
    [
      { path: '/login', element: <LoginPage /> },
      { element: <ProtectedRoute />, children: [{ path: '/cart', element: <CartPage /> }] },
    ],
    { initialEntries: [url] },
  )
  const result = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster />
    </QueryClientProvider>,
  )
  return { router, ...result }
}

describe('CartPage', () => {
  it('shows the cart items, quantity and subtotal', async () => {
    loggedIn()
    server.use(http.get('*/api/cart', () => HttpResponse.json(cart)))
    renderApp('/cart')

    expect(await screen.findByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.getByLabelText('Quantity')).toHaveTextContent('2')
    expect(await screen.findByText(formatPrice(4998))).toBeInTheDocument()
  })

  it('shows the empty state', async () => {
    loggedIn()
    server.use(http.get('*/api/cart', () => HttpResponse.json({ ...cart, items: [] })))
    renderApp('/cart')

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
  })

  it('shows an error, and stays logged in, when the cart returns 5xx', async () => {
    loggedIn()
    queryClient.setQueryDefaults(CART_QUERY_KEY, { retryDelay: 1 })
    server.use(
      http.get('*/api/cart', () =>
        HttpResponse.json(
          { status: 502, message: 'A backend service is unavailable' },
          { status: 502 },
        ),
      ),
    )
    renderApp('/cart')

    expect(await screen.findByText("Couldn't load your cart")).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('login from /login?redirect=/cart lands on the cart, not back on the login form', async () => {
    let loggedInNow = false
    server.use(
      http.get('*/api/auth/me', () =>
        loggedInNow ? HttpResponse.json(user) : new HttpResponse(null, { status: 401 }),
      ),
      http.post('*/api/auth/login', () => {
        loggedInNow = true
        return HttpResponse.json(user)
      }),
      http.get('*/api/cart', () => HttpResponse.json(cart)),
    )
    renderApp('/login?redirect=/cart')

    await userEvent.type(await screen.findByLabelText('Email'), 'ann@example.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret12')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument()
  })

  it('bounces to login once with a session-expired message when /cart returns 401', async () => {
    loggedIn()
    server.use(http.get('*/api/cart', () => new HttpResponse(null, { status: 401 })))
    const { router } = renderApp('/cart')
    const visited: string[] = []
    router.subscribe((state) => visited.push(state.location.pathname + state.location.search))

    expect(await screen.findByLabelText('Email')).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
    expect(router.state.location.search).toBe('?redirect=%2Fcart')
    expect(
      await screen.findByText('Your session expired. Please sign in again.'),
    ).toBeInTheDocument()
    await new Promise((r) => setTimeout(r, 200))
    expect(screen.getAllByText('Your session expired. Please sign in again.')).toHaveLength(1)
    expect(visited.filter((v) => v.startsWith('/login'))).toHaveLength(1)
  })

  it('after checkout the cart is empty and the order shows its status underneath', async () => {
    loggedIn()
    let placed = false
    server.use(
      http.get('*/api/cart', () => HttpResponse.json(placed ? { ...cart, items: [] } : cart)),
      http.get('*/api/orders', () =>
        HttpResponse.json(placed ? [{ ...orderSummary, status: 'INVENTORY_RESERVED' }] : []),
      ),
      http.post('*/api/cart/checkout', () => {
        placed = true
        return HttpResponse.json({ orderId: 'o1', status: 'PENDING_INVENTORY' })
      }),
    )
    const { router } = renderApp('/cart')

    expect(await screen.findByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.queryByText('Your orders')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Checkout' }))

    expect(await screen.findByText('Your cart is empty')).toBeInTheDocument()
    expect(screen.queryByText('Blue denim jacket')).not.toBeInTheDocument()
    expect(await screen.findByText('Your orders')).toBeInTheDocument()
    expect(screen.getByText('Items reserved')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Order o1/ })).toHaveAttribute('href', '/orders/o1')
    expect(router.state.location.pathname).toBe('/cart')
  })
})
