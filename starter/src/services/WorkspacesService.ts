import ApiService from './ApiService'

import type {
    WorkspaceInvite,
    WorkspaceJoinResult,
    WorkspaceMember,
    WorkspaceSettings,
    WorkspaceSummary,
} from '@/@types/workspace'

export interface CreateWorkspacePayload {
    name: string
    baseCurrency?: string
    timezone?: string
}

export interface JoinWorkspacePayload {
    code: string
}

export interface UpdateWorkspaceSettingsPayload {
    name?: string
    baseCurrency?: string
    timezone?: string
}

export async function apiCreateWorkspace(payload: CreateWorkspacePayload) {
    return ApiService.fetchDataWithAxios<WorkspaceSettings>({
        url: '/workspaces',
        method: 'post',
        data: payload,
    })
}

export async function apiListWorkspaces() {
    return ApiService.fetchDataWithAxios<WorkspaceSummary[]>({
        url: '/workspaces',
        method: 'get',
    })
}

export async function apiJoinWorkspaceByCode(payload: JoinWorkspacePayload) {
    return ApiService.fetchDataWithAxios<WorkspaceJoinResult>({
        url: '/workspaces/join',
        method: 'post',
        data: payload,
    })
}

export async function apiCreateWorkspaceInvite(workspaceId: string) {
    return ApiService.fetchDataWithAxios<WorkspaceInvite>({
        url: `/workspaces/${workspaceId}/invites`,
        method: 'post',
    })
}

export async function apiListWorkspaceMembers(workspaceId: string) {
    return ApiService.fetchDataWithAxios<WorkspaceMember[]>({
        url: `/workspaces/${workspaceId}/members`,
        method: 'get',
    })
}

export async function apiRemoveWorkspaceMember(
    workspaceId: string,
    userId: string,
) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/workspaces/${workspaceId}/members/${userId}`,
        method: 'delete',
    })
}

export async function apiUpdateWorkspaceSettings(
    workspaceId: string,
    payload: UpdateWorkspaceSettingsPayload,
) {
    return ApiService.fetchDataWithAxios<WorkspaceSettings>({
        url: `/workspaces/${workspaceId}/settings`,
        method: 'patch',
        data: payload,
    })
}
