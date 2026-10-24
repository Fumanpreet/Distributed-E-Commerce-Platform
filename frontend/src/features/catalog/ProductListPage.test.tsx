import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { queryClient } from '../../lib/query-client'
import { renderRoute } from '../../test/render'
import { products, server } from '../../test/server'
import { ProductListPage } from './ProductListPage'

// Records every search request so tests can assert how many were sent and with which term
let searchCalls: string[] = []
let listCalls = 0

beforeEach(() => {
  searchCalls = []
  listCalls = 0
  queryClient.clear()
  server.use(
    http.get('*/api/catalog/products', () => {
      listCalls++
      return HttpResponse.json(products)
    }),
    http.get('*/api/catalog/product/search', ({ request }) => {
      const q = new URL(request.url).searchParams.get('q') ?? ''
      searchCalls.push(q)
      return HttpResponse.json(products.filter((p) => p.description.toLowerCase().includes(q)))
    }),
  )
})

const box = () => screen.getByRole('searchbox', { name: 'Search products' })

describe('ProductListPage', () => {
  it('lists products from the catalog', async () => {
    renderRoute(<ProductListPage />)

    expect(await screen.findByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.getByText('White cotton shirt')).toBeInTheDocument()
  })

  it('sends no search request while typing', async () => {
    renderRoute(<ProductListPage />)
    await screen.findByText('Blue denim jacket')

    await userEvent.type(box(), 'lap')

    expect(box()).toHaveValue('lap')
    expect(screen.getByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()

    // Enter sends the first search; exactly one call proves typing sent none
    await userEvent.type(box(), '{Enter}')
    await screen.findByRole('heading', { name: 'Results for “lap”' })
    expect(searchCalls).toEqual(['lap'])
  })

  it('searches once on Enter', async () => {
    renderRoute(<ProductListPage />)
    await screen.findByText('Blue denim jacket')

    await userEvent.type(box(), 'shirt{Enter}')

    expect(await screen.findByRole('heading', { name: 'Results for “shirt”' })).toBeInTheDocument()
    await waitFor(() => expect(screen.queryByText('Blue denim jacket')).not.toBeInTheDocument())
    expect(screen.getByText('White cotton shirt')).toBeInTheDocument()
    expect(searchCalls).toEqual(['shirt'])
  })

  it('searches once when the Search button is clicked', async () => {
    renderRoute(<ProductListPage />)
    await screen.findByText('Blue denim jacket')

    await userEvent.type(box(), 'shirt')
    await userEvent.click(screen.getByRole('button', { name: 'Search' }))

    expect(await screen.findByRole('heading', { name: 'Results for “shirt”' })).toBeInTheDocument()
    expect(searchCalls).toEqual(['shirt'])
  })

  it('trims the term, and ignores Enter on an empty box', async () => {
    renderRoute(<ProductListPage />)
    await screen.findByText('Blue denim jacket')

    await userEvent.type(box(), '  shirt  {Enter}')
    await screen.findByRole('heading', { name: 'Results for “shirt”' })
    expect(searchCalls).toEqual(['shirt'])
    expect(box()).toHaveValue('shirt')

    await userEvent.clear(box())
    await screen.findByRole('heading', { name: 'Products' })
    await userEvent.type(box(), '   {Enter}')
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()

    // A real search afterwards; seeing only it proves the empty Enter sent nothing
    await userEvent.clear(box())
    await userEvent.type(box(), 'jacket{Enter}')
    await screen.findByRole('heading', { name: 'Results for “jacket”' })
    expect(searchCalls).toEqual(['shirt', 'jacket'])
  })

  it('shows all products again when the box is cleared after a search', async () => {
    renderRoute(<ProductListPage />)
    await screen.findByText('Blue denim jacket')
    await userEvent.type(box(), 'shirt{Enter}')
    await waitFor(() => expect(screen.queryByText('Blue denim jacket')).not.toBeInTheDocument())

    await userEvent.clear(box())

    expect(await screen.findByText('Blue denim jacket')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument()
    expect(searchCalls).toEqual(['shirt'])
  })

  it('pre-fills the box from ?q= and shows those results', async () => {
    renderRoute(<ProductListPage />, { url: '/?q=shirt' })

    expect(await screen.findByText('White cotton shirt')).toBeInTheDocument()
    expect(screen.queryByText('Blue denim jacket')).not.toBeInTheDocument()
    expect(box()).toHaveValue('shirt')
    expect(screen.getByRole('heading', { name: 'Results for “shirt”' })).toBeInTheDocument()
    expect(listCalls).toBe(0)
  })

  it('shows an error when the catalog is down', async () => {
    server.use(
      http.get('*/api/catalog/products', () =>
        HttpResponse.json({ message: 'Database unavailable' }, { status: 500 }),
      ),
    )
    renderRoute(<ProductListPage />)

    expect(await screen.findByRole('alert', {}, { timeout: 5000 })).toHaveTextContent(
      'Database unavailable',
    )
  })
})
