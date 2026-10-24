import { Link, NavLink } from 'react-router'
import { useMe } from '../../features/auth/hooks'
import { useCartCount } from '../../features/cart/hooks'
import { UserMenu } from './UserMenu'

export function Navbar() {
  const { data: user } = useMe()
  const cartCount = useCartCount()

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <nav
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4"
        aria-label="Main"
      >
        <Link to="/" className="text-lg font-bold text-indigo-700">
          ShopCore
        </Link>
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink
            to="/cart"
            className="relative rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Cart
            {cartCount > 0 && (
              <span
                className="ml-1.5 rounded-full bg-indigo-600 px-2 py-0.5 text-xs text-white"
                aria-label={`${cartCount} items`}
              >
                {cartCount}
              </span>
            )}
          </NavLink>
          {user ? (
            <UserMenu user={user} />
          ) : (
            <Link
              to="/login?redirect=/"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  )
}
