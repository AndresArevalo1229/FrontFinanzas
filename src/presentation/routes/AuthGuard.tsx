import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export const AuthGuard = () => {
  const hasSession = useAuthStore((state) => state.hasSession())

  if (!hasSession) {
    return <Navigate to={ROUTES.authLogin} replace />
  }

  return <Outlet />
}
