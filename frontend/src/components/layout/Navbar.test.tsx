import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { renderRoute } from '../../test/render'
import { cart, server, user } from '../../test/server'
import { Navbar } from './Navbar'

function loggedIn() {
  server.use(
    http.get('*/api/auth/me', () => HttpResponse.json(user)),
    http.get('*/api/cart', () => HttpResponse.json(cart)),
  )
}

async function openMenu() {
  const trigger = await screen.findByRole('button', { name: 'Account menu for Ann' })
  await userEvent.click(trigger)
  return trigger
}

describe('Navbar', () => {
  it('shows a Sign in link that returns to the homepage when logged out', async () => {
    renderRoute(<Navbar />)

    const link = await screen.findByRole('link', { name: 'Sign in' })
    expect(link).toHaveAttribute('href', '/login?redirect=/')
    expect(screen.queryByRole('button', { name: /Account menu/ })).not.toBeInTheDocument()
  })

  it('shows the account menu button instead of Sign in when logged in', async () => {
    loggedIn()
    renderRoute(<Navbar />)

    const trigger = await screen.findByRole('button', { name: 'Account menu for Ann' })
    expect(trigger).toBeVisible()
    expect(trigger).toHaveTextContent('Ann')
    expect(screen.queryByRole('link', { name: 'Sign in' })).not.toBeInTheDocument()
  })

  it('opens the menu with the name, email and Sign out', async () => {
    loggedIn()
    renderRoute(<Navbar />)

    const trigger = await openMenu()

    const menu = screen.getByRole('menu')
    expect(menu).toBeVisible()
    expect(menu).toHaveTextContent('ann@example.com')
    expect(screen.getByRole('menuitem', { name: 'Sign out' })).toBeVisible()
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
  })

  it('opens from the keyboard and focuses the first menu item', async () => {
    loggedIn()
    renderRoute(<Navbar />)

    const trigger = await screen.findByRole('button', { name: 'Account menu for Ann' })
    trigger.focus()
    await userEvent.keyboard('{Enter}')

    expect(await screen.findByRole('menuitem', { name: 'Sign out' })).toHaveFocus()
  })

  it('closes on Escape and returns focus to the trigger', async () => {
    loggedIn()
    renderRoute(<Navbar />)

    const trigger = await openMenu()
    await userEvent.keyboard('{Escape}')

    expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  it('signs out and shows Sign in again', async () => {
    let loggedOut = false
    server.use(
      http.get('*/api/auth/me', () =>
        loggedOut ? new HttpResponse(null, { status: 401 }) : HttpResponse.json(user),
      ),
      http.get('*/api/cart', () => HttpResponse.json(cart)),
      http.post('*/api/auth/logout', () => {
        loggedOut = true
        return new HttpResponse(null, { status: 204 })
      }),
    )
    renderRoute(<Navbar />)

    await openMenu()
    await userEvent.click(screen.getByRole('menuitem', { name: 'Sign out' }))

    expect(await screen.findByRole('link', { name: 'Sign in' })).toBeInTheDocument()
    expect(loggedOut).toBe(true)
    expect(screen.queryByRole('button', { name: /Account menu/ })).not.toBeInTheDocument()
  })

  it('closes when clicking outside the menu', async () => {
    loggedIn()
    renderRoute(<Navbar />)

    await openMenu()
    expect(screen.getByRole('menu')).toBeVisible()
    await userEvent.click(document.body)

    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
  })
})
