import type { WorkspaceSummary } from './workspace'

export type SignInCredential = {
    email: string
    password: string
}

export type SignUpCredential = {
    userName: string
    email: string
    password: string
    workspaceName?: string
    baseCurrency?: string
    timezone?: string
}

export type ForgotPassword = {
    email: string
}

export type ResetPassword = {
    token: string
    newPassword: string
}

export type AuthRequestStatus = 'success' | 'failed' | ''

export type AuthResult = Promise<{
    status: AuthRequestStatus
    message: string
}>

export type AuthApiUser = {
    id: string
    email: string
    displayName: string
}

export type AuthTokens = {
    accessToken: string
    refreshToken: string
    tokenType: 'Bearer'
    expiresIn: string
}

export type AuthSuccessData = {
    user: AuthApiUser
    workspaces: WorkspaceSummary[]
    tokens: AuthTokens
}

export type RefreshSuccessData = {
    user: AuthApiUser
    workspaces: WorkspaceSummary[]
    tokens: AuthTokens
}

export type User = {
    id?: string | null
    userId?: string | null
    avatar?: string | null
    displayName?: string | null
    userName?: string | null
    email?: string | null
    authority?: string[]
}

export type Token = {
    accessToken: string
    refreshToken?: string
}

export type OauthSignInCallbackPayload = {
    onSignIn: (tokens: Token, user?: User) => void
    redirect: () => void
}
