export type WorkspaceRole = 'OWNER' | 'MEMBER'

export interface WorkspaceSummary {
    id: string
    name: string
    baseCurrency: string
    timezone: string
    role: WorkspaceRole
    membersCount?: number
}

export interface WorkspaceSettings {
    id: string
    name: string
    baseCurrency: string
    timezone: string
}

export interface WorkspaceInvite {
    code: string
    expiresAt: string
    workspaceId: string
}

export interface WorkspaceMember {
    userId: string
    displayName: string
    email: string
    role: WorkspaceRole
    joinedAt: string
}

export interface WorkspaceJoinResult {
    workspaceId: string
    role: WorkspaceRole
}
