import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Route, Routes } from 'react-router-dom'

import { renderWithProviders } from '@/app/test/test-utils'
import { httpRequest } from '@/infrastructure/http/api-client'
import { AppHomePage } from '@/presentation/pages/app/AppHomePage'
import {
  LOGIN_INTRO_SESSION_KEY,
  LoginPage,
} from '@/presentation/pages/auth/LoginPage'
import { resetAuthStore, useAuthStore } from '@/presentation/state/auth-store'
import { ApiError } from '@/shared/errors/api-error'

vi.mock('@/infrastructure/http/api-client', () => ({
  httpRequest: vi.fn(),
}))

const mockedHttpRequest = vi.mocked(httpRequest)

const healthOk = {
  servicio: 'back_finanzas',
  estado: 'ok' as const,
  fecha: '2026-04-20T00:00:00.000Z',
  dependencias: {
    baseDatos: 'ok' as const,
  },
}

const renderLogin = () => {
  return renderWithProviders(
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/app" element={<AppHomePage />} />
    </Routes>,
    { route: '/auth/login' },
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    resetAuthStore()
    mockedHttpRequest.mockReset()
    window.sessionStorage.clear()
  })

  it('primera carga sin session key muestra splash y luego formulario', async () => {
    mockedHttpRequest.mockResolvedValueOnce(healthOk)

    renderLogin()

    expect(screen.getByTestId('login-splash')).toBeInTheDocument()

    expect(await screen.findByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByTestId('login-splash')).not.toBeInTheDocument()
    })
  })

  it('si ya existe session key, no muestra splash y renderiza login directo', async () => {
    mockedHttpRequest.mockResolvedValueOnce(healthOk)
    window.sessionStorage.setItem(LOGIN_INTRO_SESSION_KEY, 'true')

    renderLogin()

    expect(screen.queryByTestId('login-splash')).not.toBeInTheDocument()
    expect(await screen.findByRole('heading', { name: /iniciar sesion/i })).toBeInTheDocument()
  })

  it('al completar intro, guarda session key', async () => {
    mockedHttpRequest.mockResolvedValueOnce(healthOk)

    renderLogin()

    await waitFor(() => {
      expect(window.sessionStorage.getItem(LOGIN_INTRO_SESSION_KEY)).toBe('true')
    })
  })

  it('muestra aviso compacto de conexion y permite reintentar', async () => {
    const user = userEvent.setup()

    mockedHttpRequest
      .mockRejectedValueOnce(
        new ApiError({
          code: 'SIN_CONEXION_BACKEND',
          message: 'No se pudo conectar',
        }),
      )
      .mockResolvedValueOnce(healthOk)

    renderLogin()

    expect(
      await screen.findByText(/No pudimos conectar con el backend. Intenta de nuevo./i),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /reintentar/i }))

    await waitFor(() => {
      expect(mockedHttpRequest).toHaveBeenCalledTimes(2)
    })

    await waitFor(() => {
      expect(
        screen.queryByText(/No pudimos conectar con el backend. Intenta de nuevo./i),
      ).not.toBeInTheDocument()
    })
  })

  it('autentica, carga workspaces y redirige al panel', async () => {
    const user = userEvent.setup()

    mockedHttpRequest
      .mockResolvedValueOnce(healthOk)
      .mockResolvedValueOnce({
        user: {
          id: 'u-1',
          email: 'admin@misfinanzas.local',
          displayName: 'Administrador',
        },
        workspaces: [
          {
            id: 'w-login',
            name: 'Workspace Login',
            baseCurrency: 'MXN',
            timezone: 'America/Mexico_City',
            role: 'OWNER',
          },
        ],
        tokens: {
          accessToken: 'access-token',
          refreshToken: 'refresh-token',
          tokenType: 'Bearer',
          expiresIn: '15m',
        },
      })
      .mockResolvedValueOnce([
        {
          id: 'w-main',
          name: 'Workspace principal',
          baseCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          role: 'OWNER',
        },
      ])

    window.sessionStorage.setItem(LOGIN_INTRO_SESSION_KEY, 'true')
    renderLogin()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled()
    })

    await user.clear(screen.getByLabelText(/correo/i))
    await user.type(screen.getByLabelText(/correo/i), 'admin@misfinanzas.local')
    await user.type(screen.getByLabelText(/contrasena/i), 'Admin12345!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByRole('heading', { name: /panel inicial/i })).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user.email).toBe('admin@misfinanzas.local')
    expect(useAuthStore.getState().activeWorkspaceId).toBe('w-main')
  })

  it('muestra error traducido si login falla y reactiva boton', async () => {
    const user = userEvent.setup()

    mockedHttpRequest
      .mockResolvedValueOnce(healthOk)
      .mockRejectedValueOnce(
        new ApiError({
          code: 'CREDENCIALES_INVALIDAS',
          message: 'Credenciales invalidas',
        }),
      )

    window.sessionStorage.setItem(LOGIN_INTRO_SESSION_KEY, 'true')
    renderLogin()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled()
    })

    await user.type(screen.getByLabelText(/contrasena/i), 'Admin12345!')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    expect(await screen.findByText(/Correo o contrasena incorrectos\./i)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /entrar/i })).toBeEnabled()
    })
  })
})
