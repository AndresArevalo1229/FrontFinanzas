import { useCallback, useEffect, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateAccount,
    apiDeleteAccount,
    apiListAccounts,
    apiUpdateAccount,
} from '@/services/FinanceService'
import { normalizeApiError } from '@/services/apiError'
import type { Account, AccountType } from '@/@types/finance'

const accountTypes: AccountType[] = ['CASH', 'BANK', 'CARD', 'OTHER']

const Accounts = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [items, setItems] = useState<Account[]>([])
    const [name, setName] = useState('')
    const [type, setType] = useState<AccountType>('CASH')
    const [initialBalance, setInitialBalance] = useState('0')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const loadData = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setItems([])
            return
        }

        try {
            setLoading(true)
            const accounts = await apiListAccounts()
            setItems(accounts)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [selectedWorkspaceId])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const handleCreate = async () => {
        try {
            setMessage('')
            await apiCreateAccount({
                name,
                type,
                initialBalance: Number(initialBalance),
            })
            setName('')
            setInitialBalance('0')
            await loadData()
            setMessage('Cuenta creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleRename = async (account: Account) => {
        const nextName = window.prompt('Nuevo nombre de cuenta', account.name)
        if (!nextName || nextName.trim() === account.name) {
            return
        }

        try {
            await apiUpdateAccount(account.id, {
                name: nextName,
            })
            await loadData()
            setMessage('Cuenta actualizada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleToggleArchive = async (account: Account) => {
        try {
            await apiUpdateAccount(account.id, {
                isArchived: !account.isArchived,
            })
            await loadData()
            setMessage('Estado de cuenta actualizado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleDelete = async (accountId: string) => {
        try {
            await apiDeleteAccount(accountId)
            await loadData()
            setMessage('Cuenta eliminada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Cuentas</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear cuenta</h5>
                    <div className="grid md:grid-cols-4 gap-2">
                        <input
                            className="input"
                            placeholder="Nombre"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <select
                            className="input"
                            value={type}
                            onChange={(event) =>
                                setType(event.target.value as AccountType)
                            }
                        >
                            {accountTypes.map((accountType) => (
                                <option key={accountType} value={accountType}>
                                    {accountType}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Saldo inicial"
                            value={initialBalance}
                            onChange={(event) => setInitialBalance(event.target.value)}
                        />
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreate()
                            }}
                            disabled={loading || !name.trim()}
                        >
                            Crear
                        </button>
                    </div>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay cuentas registradas.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Tipo</th>
                                        <th>Saldo inicial</th>
                                        <th>Archivada</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((account) => (
                                        <tr key={account.id}>
                                            <td>{account.name}</td>
                                            <td>{account.type}</td>
                                            <td>{account.initialBalance}</td>
                                            <td>{account.isArchived ? 'Sí' : 'No'}</td>
                                            <td className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleRename(account)
                                                    }}
                                                >
                                                    Renombrar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleToggleArchive(
                                                            account,
                                                        )
                                                    }}
                                                >
                                                    {account.isArchived
                                                        ? 'Desarchivar'
                                                        : 'Archivar'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleDelete(account.id)
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

export default Accounts
