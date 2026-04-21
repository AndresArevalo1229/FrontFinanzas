import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/app/test/test-utils'
import { AppRoutes } from '@/presentation/routes/AppRoutes'
import { useAuthStore } from '@/presentation/state/auth-store'

describe('AppRoutes', () => {
  it('redirecciona a login cuando no hay sesión y se visita /app', async () => {
    renderWithProviders(<AppRoutes />, { route: '/app' })

    expect(await screen.findByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument()
  })

  it('redirecciona de / a /app cuando hay sesión', async () => {
    useAuthStore.getState().setSession({
      user: {
        id: 'u-1',
        email: 'demo@misfinanzas.local',
        displayName: 'Demo',
      },
      workspaces: [
        {
          id: 'w-1',
          name: 'Main',
          baseCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          role: 'OWNER',
        },
      ],
      tokens: {
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
      activeWorkspaceId: 'w-1',
    })

    renderWithProviders(<AppRoutes />, { route: '/' })

    expect(await screen.findByRole('heading', { name: /panel inicial/i })).toBeInTheDocument()
  })

  it('muestra 404 en rutas inexistentes', async () => {
    renderWithProviders(<AppRoutes />, { route: '/ruta-inexistente' })

    expect(await screen.findByRole('heading', { name: /ruta no encontrada/i })).toBeInTheDocument()
  })
})
