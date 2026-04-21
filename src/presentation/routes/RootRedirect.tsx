import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export const RootRedirect = () => {
  const isHydrated = useAuthStore((state) => state.isHydrated)
  const session = useAuthStore((state) => state.session)

  if (!isHydrated) {
    return null
  }

  return <Navigate to={session ? ROUTES.app : ROUTES.authLogin} replace />
}
