export type AccountType = 'CASH' | 'BANK' | 'CARD' | 'OTHER'
export type TransactionType = 'INCOME' | 'EXPENSE'
export type GoalStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELED'
export type Period = 'day' | 'week' | 'month' | 'year' | 'custom'
export type BudgetAlertLevel = 'OK' | 'WARNING' | 'EXCEEDED'

export interface UserLite {
    id: string
    displayName: string
    email: string
}

export interface Account {
    id: string
    workspaceId: string
    createdByUserId?: string | null
    name: string
    type: AccountType
    initialBalance: number
    isArchived: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
}

export interface Category {
    id: string
    workspaceId: string
    createdByUserId?: string | null
    name: string
    type: TransactionType
    color?: string | null
    icon?: string | null
    isSystem: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
}

export interface TransactionTag {
    id: string
    workspaceId: string
    name: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
}

export interface TransactionItem {
    id: string
    workspaceId: string
    accountId: string
    categoryId?: string | null
    createdByUserId: string
    type: TransactionType
    amount: number
    description?: string | null
    notes?: string | null
    occurredAt: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
    account?: Account
    category?: Category | null
    tags?: TransactionTag[]
    createdByUser?: UserLite
}

export interface PaginationData {
    page: number
    pageSize: number
    total: number
    totalPages: number
}

export interface TransactionListData {
    items: TransactionItem[]
    pagination: PaginationData
    range: {
        from: string
        to: string
    }
}

export interface BudgetAlert {
    budgetId: string
    categoryId: string
    yearMonth: string
    limitAmount: number
    spentAmount: number
    remainingAmount: number
    usedPercent: number
    alertLevel: Exclude<BudgetAlertLevel, 'OK'>
}

export interface TransactionMutationResult {
    transaction: TransactionItem
    alerts: BudgetAlert[]
}

export interface AccountTransfer {
    id: string
    workspaceId: string
    fromAccountId: string
    toAccountId: string
    amount: number
    description?: string | null
    transferredAt: string
    createdByUserId: string
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
    fromAccount?: Account
    toAccount?: Account
    createdByUser?: UserLite
}

export interface BudgetProgress {
    spentAmount: number
    remainingAmount: number
    usedPercent: number
    alertLevel: BudgetAlertLevel
}

export interface BudgetItem {
    id: string
    workspaceId: string
    categoryId: string
    yearMonth: string
    limitAmount: number
    notes?: string | null
    progress: BudgetProgress
}

export interface BudgetSummary {
    yearMonth: string
    totalBudgeted: number
    totalSpent: number
    totalRemaining: number
    warningCount: number
    exceededCount: number
}

export interface GoalItem {
    id: string
    workspaceId: string
    createdByUserId: string
    name: string
    targetAmount: number
    targetDate?: string | null
    status: GoalStatus
    notes?: string | null
    createdAt: string
    updatedAt: string
    currentAmount?: number
    progressPercent?: number
}

export interface GoalContribution {
    id: string
    workspaceId: string
    goalId: string
    createdByUserId: string
    transactionId?: string | null
    amount: number
    contributedAt: string
    notes?: string | null
    createdAt: string
    updatedAt: string
    createdByUser?: UserLite
    transaction?: {
        id: string
        amount: number
        type: TransactionType
        occurredAt: string
    } | null
}

export interface DashboardSummary {
    periodo: {
        from: string
        to: string
    }
    saldoNeto: number
    ingresos: number
    egresos: number
    ahorroNeto: number
    topAccounts: Array<{
        id: string
        name: string
        type: string
        balance: number
    }>
}

export interface ByCategoryRow {
    categoryId: string | null
    categoryName: string
    type: TransactionType
    total: number
}

export interface CashflowReport {
    periodo: {
        from: string
        to: string
    }
    serie: Array<{
        fecha: string
        ingresos: number
        egresos: number
        neto: number
    }>
}
