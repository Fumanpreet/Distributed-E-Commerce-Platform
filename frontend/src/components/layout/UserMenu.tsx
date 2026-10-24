import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useLogout } from '../../features/auth/hooks'
import type { User } from '../../types/api'
import { ChevronDownIcon, UserIcon } from '../ui/icons'

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'

export function UserMenu({ user }: { user: User }) {
  // Remember the path the menu was opened on, so a route change closes it without an effect
  const [openedAt, setOpenedAt] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuId = useId()
  const logout = useLogout()
  const navigate = useNavigate()
  const location = useLocation()
  const open = openedAt === location.pathname
  const setOpen = (value: boolean) => setOpenedAt(value ? location.pathname : null)

  // Close on outside mousedown, only while open
  useEffect(() => {
    if (!open) return
    const onMouseDown = (event: MouseEvent) => {
      const target = event.target instanceof Node ? event.target : null
      if (!containerRef.current?.contains(target)) setOpenedAt(null)
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [open])

  // Focus the first menuitem when the menu opens
  useEffect(() => {
    if (open) containerRef.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
  }, [open])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false)
      triggerRef.current?.focus()
    }
  }

  // Tab out of the menu closes it
  const onBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (open && !event.currentTarget.contains(event.relatedTarget)) setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={`Account menu for ${user.name}`}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 ${focusRing}`}
      >
        <span className="flex size-8 items-center justify-center rounded-full bg-indigo-50 text-indigo-700">
          <UserIcon className="size-5" />
        </span>
        <span className="hidden max-w-40 truncate sm:inline">{user.name}</span>
        <ChevronDownIcon className="hidden size-4 text-slate-500 sm:block" />
      </button>
      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label="Account"
          className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white py-1 shadow-lg"
        >
          <div className="px-3 py-2">
            <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
            <p className="truncate text-xs text-slate-500">{user.email}</p>
          </div>
          <div className="my-1 border-t border-slate-200" role="separator" />
          <button
            type="button"
            role="menuitem"
            disabled={logout.isPending}
            // Stays open while pending so "Signing out…" shows; the menu unmounts once `me` clears
            onClick={() => logout.mutate(undefined, { onSettled: () => navigate('/') })}
            className={`block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 ${focusRing}`}
          >
            {logout.isPending ? 'Signing out…' : 'Sign out'}
          </button>
        </div>
      )}
    </div>
  )
}
