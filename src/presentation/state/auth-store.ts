import { create } from 'zustand'

import type { AuthSession } from '@/domain/auth/entities/auth-session'

interface AuthStoreState {
  session: AuthSession | null
  activeWorkspaceId: string | null
  setSession: (session: AuthSession) => void
  clearSession: () => void
  setActiveWorkspaceId: (workspaceId: string) => void
  hasSession: () => boolean
}

const initialState = {
  session: null,
  activeWorkspaceId: null,
}

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  ...initialState,
  setSession: (session) => {
    set({
      session,
      activeWorkspaceId: session.activeWorkspaceId ?? session.workspaces[0]?.id ?? null,
    })
  },
  clearSession: () => {
    set({
      session: null,
      activeWorkspaceId: null,
    })
  },
  setActiveWorkspaceId: (workspaceId) => {
    set({ activeWorkspaceId: workspaceId })
  },
  hasSession: () => {
    const session = get().session
    return Boolean(session?.tokens.accessToken)
  },
}))

export const resetAuthStore = () => {
  useAuthStore.setState(initialState)
}
