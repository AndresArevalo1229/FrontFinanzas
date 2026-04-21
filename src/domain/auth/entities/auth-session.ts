import type { WorkspaceSummary } from '@/domain/workspace/entities/workspace-summary'

export interface TokenBundle {
  accessToken: string
  refreshToken: string
  tokenType: 'Bearer'
  expiresIn: string
}

export interface AuthUser {
  id: string
  email: string
  displayName: string
}

export interface AuthSession {
  user: AuthUser
  workspaces: WorkspaceSummary[]
  tokens: TokenBundle
  activeWorkspaceId: string | null
}
