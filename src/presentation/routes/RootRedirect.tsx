import { Navigate } from 'react-router-dom'

import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export const RootRedirect = () => {
  const session = useAuthStore((state) => state.session)

  return <Navigate to={session ? ROUTES.app : ROUTES.authLogin} replace />
}
