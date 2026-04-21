import { Navigate, Route, Routes } from 'react-router-dom'

import { AppShellLayout } from '@/presentation/layouts/AppShellLayout'
import { AppHomePage } from '@/presentation/pages/app/AppHomePage'
import { LoginPage } from '@/presentation/pages/auth/LoginPage'
import { NotFoundPage } from '@/presentation/pages/NotFoundPage'
import { AuthGuard } from '@/presentation/routes/AuthGuard'
import { RootRedirect } from '@/presentation/routes/RootRedirect'
import { ROUTES } from '@/shared/constants/routes'

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path={ROUTES.root} element={<RootRedirect />} />
      <Route path={ROUTES.authLogin} element={<LoginPage />} />

      <Route element={<AuthGuard />}>
        <Route path={ROUTES.app} element={<AppShellLayout />}>
          <Route index element={<AppHomePage />} />
          <Route path="*" element={<Navigate to={ROUTES.app} replace />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}
