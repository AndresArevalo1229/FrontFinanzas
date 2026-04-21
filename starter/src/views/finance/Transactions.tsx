import { useCallback, useEffect, useMemo, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateTransaction,
    apiDeleteTransaction,
    apiListAccounts,
    apiListCategories,
    apiListTransactions,
    apiUpdateTransaction,
} from '@/services/FinanceService'
import { normalizeApiError } from '@/services/apiError'
import { formatIso, toIsoOrUndefined } from '@/utils/dateTime'
import type {
    Account,
    BudgetAlert,
    Category,
    TransactionItem,
    TransactionsQuery,
    TransactionType,
    Period,
} from '@/@types/finance'

const transactionTypes: TransactionType[] = ['INCOME', 'EXPENSE']
const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const Transactions = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [accounts, setAccounts] = useState<Account[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [items, setItems] = useState<TransactionItem[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [paginationLabel, setPaginationLabel] = useState('')
    const [lastAlerts, setLastAlerts] = useState<BudgetAlert[]>([])

    const [accountId, setAccountId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [type, setType] = useState<TransactionType>('EXPENSE')
    const [amount, setAmount] = useState('0')
    const [description, setDescription] = useState('')
    const [notes, setNotes] = useState('')
    const [occurredAt, setOccurredAt] = useState('')
    const [tags, setTags] = useState('')

    const [filterPeriod, setFilterPeriod] = useState<Period>('month')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [filterAnchorDate, setFilterAnchorDate] = useState('')
    const [filterType, setFilterType] = useState('')
    const [filterAccountId, setFilterAccountId] = useState('')
    const [filterCategoryId, setFilterCategoryId] = useState('')
    const [filterTag, setFilterTag] = useState('')
    const [page, setPage] = useState('1')
    const [pageSize, setPageSize] = useState('20')

    const expenseCategories = useMemo(
        () => categories.filter((category) => category.type === 'EXPENSE'),
        [categories],
    )
    const incomeCategories = useMemo(
        () => categories.filter((category) => category.type === 'INCOME'),
        [categories],
    )

    const categoriesForCreate = type === 'EXPENSE' ? expenseCategories : incomeCategories

    const loadSupportData = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setAccounts([])
            setCategories([])
            return
        }

        const [nextAccounts, nextCategories] = await Promise.all([
            apiListAccounts(),
            apiListCategories(),
        ])
        setAccounts(nextAccounts)
        setCategories(nextCategories)
    }, [selectedWorkspaceId])

    const loadTransactions = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setItems([])
            return
        }

        try {
            setLoading(true)
            const query: TransactionsQuery = {
                period: filterPeriod,
                from: toIsoOrUndefined(filterFrom),
                to: toIsoOrUndefined(filterTo),
                anchorDate: toIsoOrUndefined(filterAnchorDate),
                type: filterType ? (filterType as TransactionType) : undefined,
                accountId: filterAccountId || undefined,
                categoryId: filterCategoryId || undefined,
                tag: filterTag || undefined,
                page: Number(page) > 0 ? Number(page) : undefined,
                pageSize: Number(pageSize) > 0 ? Number(pageSize) : undefined,
            }

            const response = await apiListTransactions(query)
            setItems(response.items)
            setPaginationLabel(
                `Página ${response.pagination.page} / ${response.pagination.totalPages} | total: ${response.pagination.total}`,
            )
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [
        filterAccountId,
        filterAnchorDate,
        filterCategoryId,
        filterFrom,
        filterPeriod,
        filterTag,
        filterTo,
        filterType,
        page,
        pageSize,
        selectedWorkspaceId,
    ])

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setLoading(true)
                await loadSupportData()
                await loadTransactions()
            } catch (error) {
                const normalized = normalizeApiError(error)
                setMessage(normalized.message)
            } finally {
                setLoading(false)
            }
        }

        void bootstrap()
    }, [loadSupportData, loadTransactions])

    useEffect(() => {
        if (!categoryId) {
            return
        }

        const exists = categoriesForCreate.some((category) => category.id === categoryId)
        if (!exists) {
            setCategoryId('')
        }
    }, [categoriesForCreate, categoryId])

    const handleCreate = async () => {
        if (!accountId) {
            setMessage('Selecciona una cuenta.')
            return
        }

        if (!occurredAt) {
            setMessage('Selecciona la fecha y hora del movimiento.')
            return
        }

        try {
            setMessage('')
            setLastAlerts([])

            const response = await apiCreateTransaction({
                accountId,
                categoryId: categoryId || undefined,
                type,
                amount: Number(amount),
                description: description || undefined,
                notes: notes || undefined,
                occurredAt: new Date(occurredAt).toISOString(),
                tags: tags
                    .split(',')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
            })

            setLastAlerts(response.alerts)
            await loadTransactions()
            setMessage('Movimiento creado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleEdit = async (transaction: TransactionItem) => {
        const nextAmount = window.prompt('Nuevo monto entero', `${transaction.amount}`)
        if (!nextAmount) {
            return
        }

        const nextDescription = window.prompt(
            'Nueva descripción (vacío para null)',
            transaction.description ?? '',
        )

        try {
            setLastAlerts([])
            const response = await apiUpdateTransaction(transaction.id, {
                amount: Number(nextAmount),
                description:
                    nextDescription === null
                        ? undefined
                        : nextDescription.trim()
                          ? nextDescription
                          : null,
            })
            setLastAlerts(response.alerts)
            await loadTransactions()
            setMessage('Movimiento actualizado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleDelete = async (transactionId: string) => {
        try {
            await apiDeleteTransaction(transactionId)
            await loadTransactions()
            setMessage('Movimiento eliminado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Movimientos</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            {lastAlerts.length > 0 ? (
                <div className="text-sm rounded border border-amber-300 bg-amber-50 p-2">
                    <strong>Alertas de presupuesto:</strong>
                    <ul className="list-disc ml-4">
                        {lastAlerts.map((alert) => (
                            <li key={alert.budgetId}>
                                {alert.alertLevel} - categoría {alert.categoryId} -{' '}
                                {alert.usedPercent}%
                            </li>
                        ))}
                    </ul>
                </div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear movimiento</h5>
                    <div className="grid md:grid-cols-4 gap-2">
                        <select
                            className="input"
                            value={accountId}
                            onChange={(event) => setAccountId(event.target.value)}
                        >
                            <option value="">Cuenta</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value as TransactionType)
                            }
                        >
                            {transactionTypes.map((transactionType) => (
                                <option key={transactionType} value={transactionType}>
                                    {transactionType}
                                </option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={categoryId}
                            onChange={(event) => setCategoryId(event.target.value)}
                        >
                            <option value="">Sin categoría</option>
                            {categoriesForCreate.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>

                        <input
                            className="input"
                            placeholder="Monto"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value)}
                        />

                        <input
                            className="input"
                            placeholder="Descripción"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                        />

                        <input
                            className="input"
                            placeholder="Notas"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                        />

                        <input
                            className="input"
                            placeholder="Tags separadas por coma"
                            value={tags}
                            onChange={(event) => setTags(event.target.value)}
                        />

                        <input
                            className="input"
                            type="datetime-local"
                            value={occurredAt}
                            onChange={(event) => setOccurredAt(event.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="button mt-2"
                        onClick={() => {
                            void handleCreate()
                        }}
                        disabled={loading}
                    >
                        Crear movimiento
                    </button>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Filtros</h5>
                    <div className="grid md:grid-cols-5 gap-2">
                        <select
                            className="input"
                            value={filterPeriod}
                            onChange={(event) =>
                                setFilterPeriod(event.target.value as Period)
                            }
                        >
                            {periodOptions.map((periodOption) => (
                                <option key={periodOption} value={periodOption}>
                                    {periodOption}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            type="datetime-local"
                            value={filterFrom}
                            onChange={(event) => setFilterFrom(event.target.value)}
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={filterTo}
                            onChange={(event) => setFilterTo(event.target.value)}
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={filterAnchorDate}
                            onChange={(event) =>
                                setFilterAnchorDate(event.target.value)
                            }
                        />
                        <select
                            className="input"
                            value={filterType}
                            onChange={(event) => setFilterType(event.target.value)}
                        >
                            <option value="">Todos los tipos</option>
                            {transactionTypes.map((transactionType) => (
                                <option key={transactionType} value={transactionType}>
                                    {transactionType}
                                </option>
                            ))}
                        </select>

                        <select
                            className="input"
                            value={filterAccountId}
                            onChange={(event) =>
                                setFilterAccountId(event.target.value)
                            }
                        >
                            <option value="">Todas las cuentas</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="input"
                            value={filterCategoryId}
                            onChange={(event) =>
                                setFilterCategoryId(event.target.value)
                            }
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Tag"
                            value={filterTag}
                            onChange={(event) => setFilterTag(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Página"
                            value={page}
                            onChange={(event) => setPage(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Page size"
                            value={pageSize}
                            onChange={(event) => setPageSize(event.target.value)}
                        />
                    </div>

                    <button
                        type="button"
                        className="button mt-2"
                        onClick={() => {
                            void loadTransactions()
                        }}
                        disabled={loading}
                    >
                        Aplicar filtros
                    </button>

                    <p className="text-xs mt-2">{paginationLabel}</p>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay movimientos para los filtros seleccionados.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Tipo</th>
                                        <th>Monto</th>
                                        <th>Cuenta</th>
                                        <th>Categoría</th>
                                        <th>Descripción</th>
                                        <th>Tags</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((transaction) => (
                                        <tr key={transaction.id}>
                                            <td>{formatIso(transaction.occurredAt)}</td>
                                            <td>{transaction.type}</td>
                                            <td>{transaction.amount}</td>
                                            <td>
                                                {transaction.account?.name ??
                                                    transaction.accountId}
                                            </td>
                                            <td>
                                                {transaction.category?.name ??
                                                    transaction.categoryId ??
                                                    'Sin categoría'}
                                            </td>
                                            <td>{transaction.description ?? '-'}</td>
                                            <td>
                                                {transaction.tags
                                                    ?.map((tag) => tag.name)
                                                    .join(', ') || '-'}
                                            </td>
                                            <td className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleEdit(
                                                            transaction,
                                                        )
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleDelete(
                                                            transaction.id,
                                                        )
                                                    }}
                                                >
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </WorkspaceRequiredNotice>
        </div>
    )
}

export default Transactions
