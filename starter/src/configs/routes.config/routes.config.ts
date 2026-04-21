import { lazy } from 'react'
import authRoute from './authRoute'
import othersRoute from './othersRoute'
import type { Routes } from '@/@types/routes'

export const publicRoutes: Routes = [...authRoute]

export const protectedRoutes: Routes = [
    {
        key: 'home',
        path: '/home',
        component: lazy(() => import('@/views/Home')),
        authority: [],
    },
    {
        key: 'workspaces',
        path: '/workspaces',
        component: lazy(() => import('@/views/workspaces')),
        authority: [],
    },
    {
        key: 'finance.accounts',
        path: '/finance/accounts',
        component: lazy(() => import('@/views/finance/Accounts')),
        authority: [],
    },
    {
        key: 'finance.categories',
        path: '/finance/categories',
        component: lazy(() => import('@/views/finance/Categories')),
        authority: [],
    },
    {
        key: 'finance.transactions',
        path: '/finance/transactions',
        component: lazy(() => import('@/views/finance/Transactions')),
        authority: [],
    },
    {
        key: 'finance.transfers',
        path: '/finance/transfers',
        component: lazy(() => import('@/views/finance/Transfers')),
        authority: [],
    },
    {
        key: 'budgets',
        path: '/budgets',
        component: lazy(() => import('@/views/finance/Budgets')),
        authority: [],
    },
    {
        key: 'goals',
        path: '/goals',
        component: lazy(() => import('@/views/finance/Goals')),
        authority: [],
    },
    {
        key: 'reports.byCategory',
        path: '/reports/by-category',
        component: lazy(() => import('@/views/reports/ByCategoryReport')),
        authority: [],
    },
    {
        key: 'reports.cashflow',
        path: '/reports/cashflow',
        component: lazy(() => import('@/views/reports/CashflowReport')),
        authority: [],
    },
    ...othersRoute,
]
