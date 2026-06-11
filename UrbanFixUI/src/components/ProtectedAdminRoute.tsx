import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { isAdminAuthenticated } from '../lib/auth'

export function ProtectedAdminRoute() {
  const location = useLocation()

  if (!isAdminAuthenticated()) {
    return <Navigate replace state={{ from: location }} to="/admin/login" />
  }

  return <Outlet />
}
