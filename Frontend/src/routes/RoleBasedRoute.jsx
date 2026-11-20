import { Navigate, Outlet } from 'react-router-dom'
import { useAppSelector } from '../app/hooks.js'
import { getRoleHome } from '../utils/roleHome.js'

export default function RoleBasedRoute({ roles }) {
  const user = useAppSelector((state) => state.auth.user)

  if (!roles.includes(user?.role)) {
    return <Navigate to={getRoleHome(user?.role)} replace />
  }

  return <Outlet />
}
