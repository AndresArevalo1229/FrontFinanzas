import { Navigate, Outlet } from 'react-router-dom'

import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export const AuthGuard = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const hasSession = useAuthStore((state) => state.hasSession())

  if (!isHydrated) {
    return null
  }

  if (!hasSession) {
    return <Navigate to={ROUTES.authLogin} replace />
  }

  return <Outlet />
}
