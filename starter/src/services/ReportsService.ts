import ApiService from './ApiService'

import type {
    ByCategoryRow,
    CashflowReport,
    DashboardSummary,
    Period,
} from '@/@types/finance'

export interface ReportsQuery {
    period?: Period
    from?: string
    to?: string
    anchorDate?: string
}

export async function apiGetDashboardSummary(query?: ReportsQuery) {
    return ApiService.fetchDataWithAxios<DashboardSummary>({
        url: '/dashboard/summary',
        method: 'get',
        params: query,
    })
}

export async function apiGetByCategoryReport(query?: ReportsQuery) {
    return ApiService.fetchDataWithAxios<ByCategoryRow[]>({
        url: '/reports/by-category',
        method: 'get',
        params: query,
    })
}

export async function apiGetCashflowReport(query?: ReportsQuery) {
    return ApiService.fetchDataWithAxios<CashflowReport>({
        url: '/reports/cashflow',
        method: 'get',
        params: query,
    })
}
