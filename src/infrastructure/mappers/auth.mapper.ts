import type { AuthSession, AuthUser, TokenBundle } from '@/domain/auth/entities/auth-session'
import type { WorkspaceSummary } from '@/domain/workspace/entities/workspace-summary'

export interface AuthSuccessDto {
  user: AuthUser
  workspaces: WorkspaceSummary[]
  tokens: TokenBundle
}

export const mapAuthSuccessToSession = (dto: AuthSuccessDto): AuthSession => {
  return {
    user: dto.user,
    workspaces: dto.workspaces,
    tokens: dto.tokens,
    activeWorkspaceId: dto.workspaces[0]?.id ?? null,
  }
}
