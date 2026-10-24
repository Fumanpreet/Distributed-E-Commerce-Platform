import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { queryClient } from '../lib/query-client'

// Renders a page inside the same providers the app uses, at the given URL
export function renderRoute(element: ReactElement, { path = '/', url = '/' } = {}) {
  const router = createMemoryRouter(
    [
      { path, element },
      { path: '*', element: <p>Navigated away</p> },
    ],
    { initialEntries: [url] },
  )
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  )
}
