import { useCallback, useEffect, useMemo, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateBudget,
    apiDeleteBudget,
    apiGetBudgetsSummary,
    apiListBudgets,
    apiUpdateBudget,
} from '@/services/BudgetsService'
import { apiListCategories } from '@/services/FinanceService'
import { normalizeApiError } from '@/services/apiError'
import type { BudgetItem, BudgetSummary, Category } from '@/@types/finance'

const Budgets = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [categories, setCategories] = useState<Category[]>([])
    const [items, setItems] = useState<BudgetItem[]>([])
    const [summary, setSummary] = useState<BudgetSummary | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const [yearMonth, setYearMonth] = useState(
        new Date().toISOString().slice(0, 7),
    )
    const [categoryId, setCategoryId] = useState('')
    const [limitAmount, setLimitAmount] = useState('0')
    const [notes, setNotes] = useState('')

    const expenseCategories = useMemo(
        () => categories.filter((category) => category.type === 'EXPENSE'),
        [categories],
    )

    const loadData = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setItems([])
            setSummary(null)
            setCategories([])
            return
        }

        try {
            setLoading(true)
            const [nextCategories, budgets, nextSummary] = await Promise.all([
                apiListCategories(),
                apiListBudgets({ yearMonth }),
                apiGetBudgetsSummary({ yearMonth }),
            ])
            setCategories(nextCategories)
            setItems(budgets)
            setSummary(nextSummary)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [selectedWorkspaceId, yearMonth])

    useEffect(() => {
        void loadData()
    }, [loadData])

    const handleCreate = async () => {
        if (!categoryId) {
            setMessage('Selecciona categoría.')
            return
        }

        try {
            setMessage('')
            await apiCreateBudget({
                categoryId,
                yearMonth,
                limitAmount: Number(limitAmount),
                notes: notes || undefined,
            })
            await loadData()
            setMessage('Presupuesto creado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleUpdate = async (budget: BudgetItem) => {
        const nextLimit = window.prompt('Nuevo límite', `${budget.limitAmount}`)
        if (!nextLimit) {
            return
        }

        try {
            await apiUpdateBudget(budget.id, {
                limitAmount: Number(nextLimit),
            })
            await loadData()
            setMessage('Presupuesto actualizado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleDelete = async (budgetId: string) => {
        try {
            await apiDeleteBudget(budgetId)
            await loadData()
            setMessage('Presupuesto eliminado.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Presupuestos</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear presupuesto</h5>
                    <div className="grid md:grid-cols-5 gap-2">
                        <input
                            className="input"
                            placeholder="YYYY-MM"
                            value={yearMonth}
                            onChange={(event) => setYearMonth(event.target.value)}
                        />
                        <select
                            className="input"
                            value={categoryId}
                            onChange={(event) => setCategoryId(event.target.value)}
                        >
                            <option value="">Categoría EXPENSE</option>
                            {expenseCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Límite"
                            value={limitAmount}
                            onChange={(event) => setLimitAmount(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Notas"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                        />
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreate()
                            }}
                            disabled={loading}
                        >
                            Crear
                        </button>
                    </div>
                </div>

                {summary ? (
                    <div className="border rounded p-4 bg-white dark:bg-gray-900 text-sm">
                        <h5 className="mb-3">Resumen {summary.yearMonth}</h5>
                        <div className="grid md:grid-cols-3 gap-2">
                            <div>Total presupuestado: {summary.totalBudgeted}</div>
                            <div>Total gastado: {summary.totalSpent}</div>
                            <div>Total restante: {summary.totalRemaining}</div>
                            <div>Warning: {summary.warningCount}</div>
                            <div>Exceeded: {summary.exceededCount}</div>
                        </div>
                    </div>
                ) : null}

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">
                            No hay presupuestos para el mes indicado.
                        </p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>CategoryId</th>
                                        <th>YearMonth</th>
                                        <th>Limit</th>
                                        <th>Spent</th>
                                        <th>Remaining</th>
                                        <th>Used%</th>
                                        <th>Alert</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((budget) => (
                                        <tr key={budget.id}>
                                            <td>{budget.categoryId}</td>
                                            <td>{budget.yearMonth}</td>
                                            <td>{budget.limitAmount}</td>
                                            <td>{budget.progress.spentAmount}</td>
                                            <td>{budget.progress.remainingAmount}</td>
                                            <td>{budget.progress.usedPercent}</td>
                                            <td>{budget.progress.alertLevel}</td>
                                            <td className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleUpdate(budget)
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleDelete(budget.id)
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

export default Budgets
