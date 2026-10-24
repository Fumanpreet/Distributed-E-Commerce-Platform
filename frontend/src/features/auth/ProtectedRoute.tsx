import { Navigate, Outlet, useLocation } from 'react-router'
import { Spinner } from '../../components/ui/Spinner'
import { useMe } from './hooks'

export function ProtectedRoute() {
  const { data: user, isPending } = useMe()
  const location = useLocation()

  if (isPending) return <Spinner />
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search)
    return <Navigate to={`/login?redirect=${redirect}`} replace />
  }
  return <Outlet />
}
