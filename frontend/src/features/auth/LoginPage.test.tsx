import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/render'
import { server } from '../../test/server'
import { LoginPage } from './LoginPage'

describe('LoginPage', () => {
  it('validates the form before calling the backend', async () => {
    renderRoute(<LoginPage />, { path: '/login', url: '/login' })

    await userEvent.click(await screen.findByRole('button', { name: 'Sign in' }))

    expect(screen.getByText('Enter a valid email')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
  })

  it('shows the backend message on wrong credentials', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ status: 401, message: 'Invalid email or password' }, { status: 401 }),
      ),
    )
    renderRoute(<LoginPage />, { path: '/login', url: '/login' })

    await userEvent.type(await screen.findByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password')
  })

  it('posts form-encoded credentials and follows the redirect', async () => {
    let body = ''
    server.use(
      http.post('*/api/auth/login', async ({ request }) => {
        body = await request.text()
        return HttpResponse.json({ id: 1, email: 'a@b.com', name: 'Ann' })
      }),
    )
    renderRoute(<LoginPage />, { path: '/login', url: '/login?redirect=/cart' })

    await userEvent.type(await screen.findByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret1')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Navigated away')).toBeInTheDocument()
    expect(new URLSearchParams(body).get('username')).toBe('a@b.com')
  })

  it('lands on the homepage when the redirect is /', async () => {
    server.use(
      http.post('*/api/auth/login', () =>
        HttpResponse.json({ id: 1, email: 'a@b.com', name: 'Ann' }),
      ),
    )
    renderRoute(<LoginPage />, { path: '/login', url: '/login?redirect=/' })

    await userEvent.type(await screen.findByLabelText('Email'), 'a@b.com')
    await userEvent.type(screen.getByLabelText('Password'), 'secret1')
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }))

    expect(await screen.findByText('Navigated away')).toBeInTheDocument()
  })
})
