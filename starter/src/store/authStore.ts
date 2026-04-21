import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

import type { AuthApiUser, AuthTokens, User } from '@/@types/auth'
import type { WorkspaceSummary } from '@/@types/workspace'

type SessionState = {
    signedIn: boolean
    accessToken: string
    refreshToken: string
    expiresIn: string
    selectedWorkspaceId: string | null
}

type AuthState = {
    session: SessionState
    user: User
    workspaces: WorkspaceSummary[]
}

type AuthActions = {
    setSelectedWorkspaceId: (workspaceId: string | null) => void
    setWorkspaces: (workspaces: WorkspaceSummary[]) => void
    setUser: (user: User) => void
    setTokens: (tokens: AuthTokens) => void
    hydrateFromAuthSuccess: (params: {
        user: AuthApiUser
        workspaces: WorkspaceSummary[]
        tokens: AuthTokens
    }) => void
    clearAuth: () => void
}

const initialState: AuthState = {
    session: {
        signedIn: false,
        accessToken: '',
        refreshToken: '',
        expiresIn: '',
        selectedWorkspaceId: null,
    },
    user: {
        id: null,
        userId: null,
        avatar: '',
        displayName: '',
        userName: '',
        email: '',
        authority: ['user'],
    },
    workspaces: [],
}

const mapAuthUserToViewUser = (user: AuthApiUser): User => ({
    id: user.id,
    userId: user.id,
    displayName: user.displayName,
    userName: user.displayName,
    email: user.email,
    avatar: '',
    authority: ['user'],
})

const resolveSelectedWorkspace = (
    currentSelectedWorkspaceId: string | null,
    workspaces: WorkspaceSummary[],
): string | null => {
    if (workspaces.length === 0) {
        return null
    }

    if (
        currentSelectedWorkspaceId &&
        workspaces.some((workspace) => workspace.id === currentSelectedWorkspaceId)
    ) {
        return currentSelectedWorkspaceId
    }

    return workspaces[0]?.id ?? null
}

export const useSessionUser = create<AuthState & AuthActions>()(
    persist(
        (set, get) => ({
            ...initialState,
            setSelectedWorkspaceId: (workspaceId) => {
                set((state) => ({
                    session: {
                        ...state.session,
                        selectedWorkspaceId: workspaceId,
                    },
                }))
            },
            setWorkspaces: (workspaces) => {
                const selectedWorkspaceId = resolveSelectedWorkspace(
                    get().session.selectedWorkspaceId,
                    workspaces,
                )

                set((state) => ({
                    workspaces,
                    session: {
                        ...state.session,
                        selectedWorkspaceId,
                    },
                }))
            },
            setUser: (user) => {
                set((state) => ({
                    user: {
                        ...state.user,
                        ...user,
                    },
                }))
            },
            setTokens: (tokens) => {
                set((state) => ({
                    session: {
                        ...state.session,
                        signedIn: true,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                    },
                }))
            },
            hydrateFromAuthSuccess: ({ user, workspaces, tokens }) => {
                const selectedWorkspaceId = resolveSelectedWorkspace(
                    get().session.selectedWorkspaceId,
                    workspaces,
                )

                set({
                    session: {
                        signedIn: true,
                        accessToken: tokens.accessToken,
                        refreshToken: tokens.refreshToken,
                        expiresIn: tokens.expiresIn,
                        selectedWorkspaceId,
                    },
                    user: mapAuthUserToViewUser(user),
                    workspaces,
                })
            },
            clearAuth: () => {
                set({
                    ...initialState,
                })
            },
        }),
        {
            name: 'sessionUserV1',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
