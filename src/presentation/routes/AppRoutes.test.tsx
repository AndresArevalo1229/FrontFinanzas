import { screen } from '@testing-library/react'

import { renderWithProviders } from '@/app/test/test-utils'
import { httpRequest } from '@/infrastructure/http/api-client'
import { AppRoutes } from '@/presentation/routes/AppRoutes'
import { resetAuthStore, useAuthStore } from '@/presentation/state/auth-store'

vi.mock('@/infrastructure/http/api-client', () => ({
  httpRequest: vi.fn(),
}))

const mockedHttpRequest = vi.mocked(httpRequest)

const healthResponse = {
  servicio: 'back_finanzas',
  estado: 'ok',
  fecha: '2026-04-20T00:00:00.000Z',
  dependencias: {
    baseDatos: 'ok',
  },
}

describe('AppRoutes', () => {
  beforeEach(() => {
    resetAuthStore()
    mockedHttpRequest.mockReset()
    mockedHttpRequest.mockResolvedValue(healthResponse)
  })

  it('redirecciona a login cuando no hay sesion y se visita /app', async () => {
    renderWithProviders(<AppRoutes />, { route: '/app' })

    expect(await screen.findByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument()
  })

  it('redirecciona de / a /app cuando hay sesion', async () => {
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
