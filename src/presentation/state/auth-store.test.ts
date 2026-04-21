import {
  AUTH_STORAGE_KEY,
  resetAuthStore,
  useAuthStore,
} from '@/presentation/state/auth-store'

import type { AuthSession } from '@/domain/auth/entities/auth-session'

const sessionMock: AuthSession = {
  user: {
    id: 'u-1',
    email: 'demo@misfinanzas.local',
    displayName: 'Demo',
  },
  workspaces: [
    {
      id: 'w-1',
      name: 'Workspace Demo',
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
  activeWorkspaceId: null,
}

describe('auth-store', () => {
  beforeEach(() => {
    resetAuthStore()
  })

  it('guarda sesion y toma el primer workspace activo por default', () => {
    useAuthStore.getState().setSession(sessionMock)

    const state = useAuthStore.getState()

    expect(state.session?.user.email).toBe('demo@misfinanzas.local')
    expect(state.activeWorkspaceId).toBe('w-1')
    expect(state.hasSession()).toBe(true)
  })

  it('persiste sesion en localStorage', () => {
    useAuthStore.getState().setSession(sessionMock)

    const persisted = window.localStorage.getItem(AUTH_STORAGE_KEY)

    expect(persisted).toBeTruthy()
    expect(persisted).toContain('demo@misfinanzas.local')
    expect(persisted).toContain('access-token')
  })

  it('limpia sesion y storage', () => {
    useAuthStore.getState().setSession(sessionMock)
    useAuthStore.getState().clearSession()

    expect(useAuthStore.getState().session).toBeNull()
    expect(useAuthStore.getState().activeWorkspaceId).toBeNull()
    expect(window.localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull()
  })
})
