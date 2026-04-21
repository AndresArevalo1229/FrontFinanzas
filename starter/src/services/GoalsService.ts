import ApiService from './ApiService'

import type { GoalContribution, GoalItem, GoalStatus, Period } from '@/@types/finance'

export interface CreateGoalPayload {
    name: string
    targetAmount: number
    targetDate?: string
    notes?: string
}

export interface UpdateGoalPayload {
    name?: string
    targetAmount?: number
    targetDate?: string | null
    status?: GoalStatus
    notes?: string | null
}

export interface CreateContributionPayload {
    amount: number
    contributedAt: string
    notes?: string
    transactionId?: string
}

export interface GoalContributionsQuery {
    period?: Period
    from?: string
    to?: string
    anchorDate?: string
}

export async function apiCreateGoal(payload: CreateGoalPayload) {
    return ApiService.fetchDataWithAxios<GoalItem>({
        url: '/goals',
        method: 'post',
        data: payload,
    })
}

export async function apiListGoals() {
    return ApiService.fetchDataWithAxios<GoalItem[]>({
        url: '/goals',
        method: 'get',
    })
}

export async function apiUpdateGoal(goalId: string, payload: UpdateGoalPayload) {
    return ApiService.fetchDataWithAxios<GoalItem>({
        url: `/goals/${goalId}`,
        method: 'patch',
        data: payload,
    })
}

export async function apiDeleteGoal(goalId: string) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/goals/${goalId}`,
        method: 'delete',
    })
}

export async function apiCreateGoalContribution(
    goalId: string,
    payload: CreateContributionPayload,
) {
    return ApiService.fetchDataWithAxios<GoalContribution>({
        url: `/goals/${goalId}/contributions`,
        method: 'post',
        data: payload,
    })
}

export async function apiListGoalContributions(
    goalId: string,
    query?: GoalContributionsQuery,
) {
    return ApiService.fetchDataWithAxios<GoalContribution[]>({
        url: `/goals/${goalId}/contributions`,
        method: 'get',
        params: query,
    })
}
