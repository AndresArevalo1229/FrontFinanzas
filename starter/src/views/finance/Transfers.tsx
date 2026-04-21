import { useCallback, useEffect, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateTransfer,
    apiListAccounts,
    apiListTransfers,
} from '@/services/FinanceService'
import { normalizeApiError } from '@/services/apiError'
import { formatIso, toIsoOrUndefined } from '@/utils/dateTime'
import type { Account, AccountTransfer, Period } from '@/@types/finance'

const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const Transfers = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [accounts, setAccounts] = useState<Account[]>([])
    const [items, setItems] = useState<AccountTransfer[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const [fromAccountId, setFromAccountId] = useState('')
    const [toAccountId, setToAccountId] = useState('')
    const [amount, setAmount] = useState('0')
    const [description, setDescription] = useState('')
    const [transferredAt, setTransferredAt] = useState('')

    const [filterPeriod, setFilterPeriod] = useState<Period>('month')
    const [filterFrom, setFilterFrom] = useState('')
    const [filterTo, setFilterTo] = useState('')
    const [filterAnchorDate, setFilterAnchorDate] = useState('')
    const [filterAccountId, setFilterAccountId] = useState('')

    const loadData = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setAccounts([])
            setItems([])
            return
        }

        try {
            setLoading(true)
            const [nextAccounts, nextTransfers] = await Promise.all([
                apiListAccounts(),
                apiListTransfers({
                    period: filterPeriod,
                    from: toIsoOrUndefined(filterFrom),
                    to: toIsoOrUndefined(filterTo),
                    anchorDate: toIsoOrUndefined(filterAnchorDate),
                    accountId: filterAccountId || undefined,
                }),
            ])
            setAccounts(nextAccounts)
            setItems(nextTransfers)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [
        filterAccountId,
        filterAnchorDate,
        filterFrom,
        filterPeriod,
        filterTo,
        selectedWorkspaceId,
    ])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const handleCreate = async () => {
        if (!fromAccountId || !toAccountId || !transferredAt) {
            setMessage('Completa cuenta origen, destino y fecha.')
            return
        }

        try {
            setMessage('')
            await apiCreateTransfer({
                fromAccountId,
                toAccountId,
                amount: Number(amount),
                description: description || undefined,
                transferredAt: new Date(transferredAt).toISOString(),
            })
            await loadData()
            setMessage('Transferencia creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleApplyFilters = async () => {
        try {
            await loadData()
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Transferencias</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear transferencia</h5>
                    <div className="grid md:grid-cols-5 gap-2">
                        <select
                            className="input"
                            value={fromAccountId}
                            onChange={(event) => setFromAccountId(event.target.value)}
                        >
                            <option value="">Cuenta origen</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="input"
                            value={toAccountId}
                            onChange={(event) => setToAccountId(event.target.value)}
                        >
                            <option value="">Cuenta destino</option>
                            {accounts.map((account) => (
                                <option key={account.id} value={account.id}>
                                    {account.name}
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
                            type="datetime-local"
                            value={transferredAt}
                            onChange={(event) => setTransferredAt(event.target.value)}
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
                        Crear transferencia
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
                    </div>
                    <button
                        type="button"
                        className="button mt-2"
                        onClick={() => {
                            void handleApplyFilters()
                        }}
                        disabled={loading}
                    >
                        Aplicar filtros
                    </button>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay transferencias para mostrar.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Origen</th>
                                        <th>Destino</th>
                                        <th>Descripción</th>
                                        <th>Creado por</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((transfer) => (
                                        <tr key={transfer.id}>
                                            <td>{formatIso(transfer.transferredAt)}</td>
                                            <td>{transfer.amount}</td>
                                            <td>
                                                {transfer.fromAccount?.name ??
                                                    transfer.fromAccountId}
                                            </td>
                                            <td>
                                                {transfer.toAccount?.name ??
                                                    transfer.toAccountId}
                                            </td>
                                            <td>{transfer.description ?? '-'}</td>
                                            <td>
                                                {transfer.createdByUser
                                                    ? transfer.createdByUser.displayName
                                                    : '-'}
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

export default Transfers
