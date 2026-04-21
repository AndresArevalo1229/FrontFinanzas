import { useMemo, useState } from 'react'
import { Link, Outlet } from 'react-router-dom'

import { HttpAuthRepository } from '@/infrastructure/auth/http-auth.repository'
import { HttpWorkspaceRepository } from '@/infrastructure/workspace/http-workspace.repository'
import { Button } from '@/presentation/components/ui/button'
import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'
import { translateApiError } from '@/shared/errors/error-translator'

export const AppShellLayout = () => {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)
  const setSession = useAuthStore((state) => state.setSession)

  const authRepository = useMemo(() => new HttpAuthRepository(), [])
  const workspaceRepository = useMemo(() => new HttpWorkspaceRepository(), [])

  const [refreshing, setRefreshing] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('')

  const handleManualRefresh = async () => {
    if (!session?.tokens.refreshToken) {
      setRefreshMessage('No hay refresh token disponible para actualizar la sesion.')
      return
    }

    setRefreshing(true)
    setRefreshMessage('Refrescando sesion desde /api/v1/auth/refresh ...')

    try {
      const refreshedSession = await authRepository.refresh(session.tokens.refreshToken)
      setSession(refreshedSession)

      const workspaces = await workspaceRepository.list()
      const activeWorkspaceId =
        workspaces[0]?.id ?? refreshedSession.activeWorkspaceId ?? refreshedSession.workspaces[0]?.id ?? null

      setSession({
        ...refreshedSession,
        workspaces: workspaces.length > 0 ? workspaces : refreshedSession.workspaces,
        activeWorkspaceId,
      })

      setRefreshMessage('Sesion actualizada manualmente y workspace activo sincronizado.')
    } catch (error) {
      setRefreshMessage(translateApiError(error))
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="min-h-screen bg-app-gradient text-forest-900">
      <header className="border-b border-moss-300 bg-beige-100/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-midnight-700">Mis Finanzas</p>
            <h1 className="text-lg font-bold">Panel principal</h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.app}>Inicio</Link>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              type="button"
              onClick={handleManualRefresh}
              disabled={refreshing}
            >
              {refreshing ? 'Refrescando...' : 'Refrescar sesion'}
            </Button>
            <Button variant="secondary" size="sm" type="button" onClick={clearSession}>
              Cerrar sesion
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
        {refreshMessage ? (
          <p className="mb-4 rounded-xl border border-moss-300 bg-beige-100/80 px-3 py-2 text-sm text-forest-900">
            {refreshMessage}
          </p>
        ) : null}

        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-6xl px-4 pb-10 text-xs text-midnight-700 sm:px-6">
        Sesion activa: {session?.user.email ?? 'sin sesion'}
      </footer>
    </div>
  )
}
