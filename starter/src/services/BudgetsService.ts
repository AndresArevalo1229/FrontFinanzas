import ApiService from './ApiService'

import type { BudgetItem, BudgetSummary } from '@/@types/finance'

export interface CreateBudgetPayload {
    categoryId: string
    yearMonth?: string
    limitAmount: number
    notes?: string
}

export interface UpdateBudgetPayload {
    categoryId?: string
    yearMonth?: string
    limitAmount?: number
    notes?: string | null
}

export interface BudgetsQuery {
    yearMonth?: string
}

export async function apiCreateBudget(payload: CreateBudgetPayload) {
    return ApiService.fetchDataWithAxios<BudgetItem>({
        url: '/budgets',
        method: 'post',
        data: payload,
    })
}

export async function apiListBudgets(query?: BudgetsQuery) {
    return ApiService.fetchDataWithAxios<BudgetItem[]>({
        url: '/budgets',
        method: 'get',
        params: query,
    })
}

export async function apiUpdateBudget(budgetId: string, payload: UpdateBudgetPayload) {
    return ApiService.fetchDataWithAxios<BudgetItem>({
        url: `/budgets/${budgetId}`,
        method: 'patch',
        data: payload,
    })
}

export async function apiDeleteBudget(budgetId: string) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/budgets/${budgetId}`,
        method: 'delete',
    })
}

export async function apiGetBudgetsSummary(query?: BudgetsQuery) {
    return ApiService.fetchDataWithAxios<BudgetSummary>({
        url: '/budgets/summary',
        method: 'get',
        params: query,
    })
}
