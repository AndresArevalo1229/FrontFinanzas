import ApiService from './ApiService'
import { extractMetaAlerts } from './apiError'

import type {
    Account,
    AccountTransfer,
    AccountType,
    BudgetAlert,
    Category,
    Period,
    TransactionItem,
    TransactionListData,
    TransactionMutationResult,
    TransactionType,
} from '@/@types/finance'

export interface CreateAccountPayload {
    name: string
    type: AccountType
    initialBalance?: number
}

export interface UpdateAccountPayload {
    name?: string
    type?: AccountType
    isArchived?: boolean
}

export interface CreateCategoryPayload {
    name: string
    type: TransactionType
    color?: string
    icon?: string
}

export interface UpdateCategoryPayload {
    name?: string
    type?: TransactionType
    color?: string
    icon?: string
}

export interface CreateTransactionPayload {
    accountId: string
    categoryId?: string
    type: TransactionType
    amount: number
    description?: string
    notes?: string
    occurredAt: string
    tags?: string[]
}

export interface UpdateTransactionPayload {
    accountId?: string
    categoryId?: string | null
    type?: TransactionType
    amount?: number
    description?: string | null
    notes?: string | null
    occurredAt?: string
    tags?: string[]
}

export interface TransactionsQuery {
    period?: Period
    from?: string
    to?: string
    anchorDate?: string
    type?: TransactionType
    accountId?: string
    categoryId?: string
    tag?: string
    createdByUserId?: string
    page?: number
    pageSize?: number
}

export interface CreateTransferPayload {
    fromAccountId: string
    toAccountId: string
    amount: number
    description?: string
    transferredAt: string
}

export interface TransfersQuery {
    period?: Period
    from?: string
    to?: string
    anchorDate?: string
    accountId?: string
}

export async function apiCreateAccount(payload: CreateAccountPayload) {
    return ApiService.fetchDataWithAxios<Account>({
        url: '/accounts',
        method: 'post',
        data: payload,
    })
}

export async function apiListAccounts() {
    return ApiService.fetchDataWithAxios<Account[]>({
        url: '/accounts',
        method: 'get',
    })
}

export async function apiUpdateAccount(
    accountId: string,
    payload: UpdateAccountPayload,
) {
    return ApiService.fetchDataWithAxios<Account>({
        url: `/accounts/${accountId}`,
        method: 'patch',
        data: payload,
    })
}

export async function apiDeleteAccount(accountId: string) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/accounts/${accountId}`,
        method: 'delete',
    })
}

export async function apiCreateCategory(payload: CreateCategoryPayload) {
    return ApiService.fetchDataWithAxios<Category>({
        url: '/categories',
        method: 'post',
        data: payload,
    })
}

export async function apiListCategories() {
    return ApiService.fetchDataWithAxios<Category[]>({
        url: '/categories',
        method: 'get',
    })
}

export async function apiUpdateCategory(
    categoryId: string,
    payload: UpdateCategoryPayload,
) {
    return ApiService.fetchDataWithAxios<Category>({
        url: `/categories/${categoryId}`,
        method: 'patch',
        data: payload,
    })
}

export async function apiDeleteCategory(categoryId: string) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/categories/${categoryId}`,
        method: 'delete',
    })
}

export async function apiCreateTransaction(
    payload: CreateTransactionPayload,
): Promise<TransactionMutationResult> {
    const envelope = await ApiService.fetchEnvelopeWithAxios<TransactionItem>({
        url: '/transactions',
        method: 'post',
        data: payload,
    })

    return {
        transaction: envelope.datos,
        alerts: extractMetaAlerts(envelope) as BudgetAlert[],
    }
}

export async function apiListTransactions(query?: TransactionsQuery) {
    return ApiService.fetchDataWithAxios<TransactionListData>({
        url: '/transactions',
        method: 'get',
        params: query,
    })
}

export async function apiUpdateTransaction(
    transactionId: string,
    payload: UpdateTransactionPayload,
): Promise<TransactionMutationResult> {
    const envelope = await ApiService.fetchEnvelopeWithAxios<TransactionItem>({
        url: `/transactions/${transactionId}`,
        method: 'patch',
        data: payload,
    })

    return {
        transaction: envelope.datos,
        alerts: extractMetaAlerts(envelope) as BudgetAlert[],
    }
}

export async function apiDeleteTransaction(transactionId: string) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: `/transactions/${transactionId}`,
        method: 'delete',
    })
}

export async function apiCreateTransfer(payload: CreateTransferPayload) {
    return ApiService.fetchDataWithAxios<AccountTransfer>({
        url: '/transfers',
        method: 'post',
        data: payload,
    })
}

export async function apiListTransfers(query?: TransfersQuery) {
    return ApiService.fetchDataWithAxios<AccountTransfer[]>({
        url: '/transfers',
        method: 'get',
        params: query,
    })
}
