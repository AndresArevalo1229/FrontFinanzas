import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'

import type { AuthSession } from '@/domain/auth/entities/auth-session'

interface AuthState {
  session: AuthSession | null
  activeWorkspaceId: string | null
}

interface AuthStoreState extends AuthState {
  isHydrated: boolean
  setSession: (session: AuthSession) => void
  clearSession: () => void
  setActiveWorkspaceId: (workspaceId: string) => void
  hasSession: () => boolean
}

export const AUTH_STORAGE_KEY = 'mis-finanzas-auth'

const initialAuthState: AuthState = {
  session: null,
  activeWorkspaceId: null,
}

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
}

const storage = createJSONStorage<AuthState>(() => {
  if (typeof window === 'undefined') {
    return noopStorage
  }

  return window.localStorage
})

export const useAuthStore = create<AuthStoreState>()(
  persist(
    (set, get) => ({
      ...initialAuthState,
      isHydrated: true,
      setSession: (session) => {
        set({
          session,
          activeWorkspaceId: session.activeWorkspaceId ?? session.workspaces[0]?.id ?? null,
        })
      },
      clearSession: () => {
        set({
          ...initialAuthState,
        })

        if (typeof window !== 'undefined') {
          window.localStorage.removeItem(AUTH_STORAGE_KEY)
        }
      },
      setActiveWorkspaceId: (workspaceId) => {
        set((state) => {
          if (!state.session) {
            return { activeWorkspaceId: workspaceId }
          }

          return {
            activeWorkspaceId: workspaceId,
            session: {
              ...state.session,
              activeWorkspaceId: workspaceId,
            },
          }
        })
      },
      hasSession: () => {
        const session = get().session
        return Boolean(session?.tokens.accessToken)
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage,
      partialize: (state) => ({
        session: state.session,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return
        }

        state.isHydrated = true
      },
    },
  ),
)

export const resetAuthStore = () => {
  useAuthStore.setState({
    ...initialAuthState,
    isHydrated: true,
  })
  useAuthStore.persist.clearStorage()
}
