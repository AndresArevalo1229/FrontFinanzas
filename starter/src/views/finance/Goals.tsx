import { useCallback, useEffect, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import {
    apiCreateGoal,
    apiCreateGoalContribution,
    apiDeleteGoal,
    apiListGoalContributions,
    apiListGoals,
    apiUpdateGoal,
} from '@/services/GoalsService'
import { normalizeApiError } from '@/services/apiError'
import { formatIso, toIsoOrUndefined } from '@/utils/dateTime'
import type { GoalContribution, GoalItem, GoalStatus, Period } from '@/@types/finance'

const goalStatuses: GoalStatus[] = ['ACTIVE', 'COMPLETED', 'CANCELED']
const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const Goals = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )

    const [goals, setGoals] = useState<GoalItem[]>([])
    const [contributions, setContributions] = useState<GoalContribution[]>([])
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const [name, setName] = useState('')
    const [targetAmount, setTargetAmount] = useState('0')
    const [targetDate, setTargetDate] = useState('')
    const [notes, setNotes] = useState('')

    const [selectedGoalId, setSelectedGoalId] = useState('')
    const [contributionAmount, setContributionAmount] = useState('0')
    const [contributionDate, setContributionDate] = useState('')
    const [contributionNotes, setContributionNotes] = useState('')
    const [transactionId, setTransactionId] = useState('')

    const [period, setPeriod] = useState<Period>('month')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [anchorDate, setAnchorDate] = useState('')

    const loadGoals = useCallback(async () => {
        if (!selectedWorkspaceId) {
            setGoals([])
            return
        }

        const nextGoals = await apiListGoals()
        setGoals(nextGoals)

        if (!selectedGoalId && nextGoals[0]) {
            setSelectedGoalId(nextGoals[0].id)
        }
    }, [selectedGoalId, selectedWorkspaceId])

    const loadContributions = useCallback(async () => {
        if (!selectedWorkspaceId || !selectedGoalId) {
            setContributions([])
            return
        }

        const nextContributions = await apiListGoalContributions(selectedGoalId, {
            period,
            from: toIsoOrUndefined(from),
            to: toIsoOrUndefined(to),
            anchorDate: toIsoOrUndefined(anchorDate),
        })
        setContributions(nextContributions)
    }, [anchorDate, from, period, selectedGoalId, selectedWorkspaceId, to])

    useEffect(() => {
        const bootstrap = async () => {
            try {
                setLoading(true)
                await loadGoals()
            } catch (error) {
                const normalized = normalizeApiError(error)
                setMessage(normalized.message)
            } finally {
                setLoading(false)
            }
        }

        void bootstrap()
    }, [loadGoals])

    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true)
                await loadContributions()
            } catch (error) {
                const normalized = normalizeApiError(error)
                setMessage(normalized.message)
            } finally {
                setLoading(false)
            }
        }

        void load()
    }, [loadContributions])

    const handleCreateGoal = async () => {
        try {
            setMessage('')
            await apiCreateGoal({
                name,
                targetAmount: Number(targetAmount),
                targetDate: targetDate
                    ? new Date(targetDate).toISOString()
                    : undefined,
                notes: notes || undefined,
            })
            setName('')
            setTargetAmount('0')
            setTargetDate('')
            setNotes('')
            await loadGoals()
            setMessage('Meta creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleUpdateGoal = async (goal: GoalItem) => {
        const nextTargetAmount = window.prompt(
            'Nuevo monto objetivo',
            `${goal.targetAmount}`,
        )
        if (!nextTargetAmount) {
            return
        }

        const nextStatus = window.prompt(
            'Nuevo estado (ACTIVE, COMPLETED, CANCELED)',
            goal.status,
        )
        if (!nextStatus || !goalStatuses.includes(nextStatus as GoalStatus)) {
            return
        }

        try {
            await apiUpdateGoal(goal.id, {
                targetAmount: Number(nextTargetAmount),
                status: nextStatus as GoalStatus,
            })
            await loadGoals()
            setMessage('Meta actualizada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleDeleteGoal = async (goalId: string) => {
        try {
            await apiDeleteGoal(goalId)
            await loadGoals()
            if (selectedGoalId === goalId) {
                setSelectedGoalId('')
            }
            setMessage('Meta eliminada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    const handleCreateContribution = async () => {
        if (!selectedGoalId) {
            setMessage('Selecciona una meta.')
            return
        }

        if (!contributionDate) {
            setMessage('Selecciona fecha de aportación.')
            return
        }

        try {
            await apiCreateGoalContribution(selectedGoalId, {
                amount: Number(contributionAmount),
                contributedAt: new Date(contributionDate).toISOString(),
                notes: contributionNotes || undefined,
                transactionId: transactionId || undefined,
            })
            await loadContributions()
            setMessage('Aportación creada.')
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        }
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Metas</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Crear meta</h5>
                    <div className="grid md:grid-cols-4 gap-2">
                        <input
                            className="input"
                            placeholder="Nombre"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Monto objetivo"
                            value={targetAmount}
                            onChange={(event) => setTargetAmount(event.target.value)}
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={targetDate}
                            onChange={(event) => setTargetDate(event.target.value)}
                        />
                        <input
                            className="input"
                            placeholder="Notas"
                            value={notes}
                            onChange={(event) => setNotes(event.target.value)}
                        />
                    </div>
                    <button
                        type="button"
                        className="button mt-2"
                        onClick={() => {
                            void handleCreateGoal()
                        }}
                        disabled={loading}
                    >
                        Crear meta
                    </button>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Listado de metas</h5>
                    {goals.length === 0 ? (
                        <p className="text-sm text-gray-500">No hay metas registradas.</p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Nombre</th>
                                        <th>Objetivo</th>
                                        <th>Actual</th>
                                        <th>Progreso%</th>
                                        <th>Estado</th>
                                        <th>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {goals.map((goal) => (
                                        <tr key={goal.id}>
                                            <td>{goal.name}</td>
                                            <td>{goal.targetAmount}</td>
                                            <td>{goal.currentAmount ?? '-'}</td>
                                            <td>{goal.progressPercent ?? '-'}</td>
                                            <td>{goal.status}</td>
                                            <td className="flex gap-2">
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() =>
                                                        setSelectedGoalId(goal.id)
                                                    }
                                                >
                                                    {selectedGoalId === goal.id
                                                        ? 'Activa'
                                                        : 'Ver aportes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleUpdateGoal(goal)
                                                    }}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="button"
                                                    onClick={() => {
                                                        void handleDeleteGoal(goal.id)
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

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Aportaciones</h5>
                    <div className="grid md:grid-cols-4 gap-2 mb-2">
                        <select
                            className="input"
                            value={selectedGoalId}
                            onChange={(event) => setSelectedGoalId(event.target.value)}
                        >
                            <option value="">Selecciona meta</option>
                            {goals.map((goal) => (
                                <option key={goal.id} value={goal.id}>
                                    {goal.name}
                                </option>
                            ))}
                        </select>
                        <input
                            className="input"
                            placeholder="Monto"
                            value={contributionAmount}
                            onChange={(event) =>
                                setContributionAmount(event.target.value)
                            }
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={contributionDate}
                            onChange={(event) =>
                                setContributionDate(event.target.value)
                            }
                        />
                        <input
                            className="input"
                            placeholder="transactionId opcional"
                            value={transactionId}
                            onChange={(event) => setTransactionId(event.target.value)}
                        />
                        <input
                            className="input md:col-span-2"
                            placeholder="Notas"
                            value={contributionNotes}
                            onChange={(event) =>
                                setContributionNotes(event.target.value)
                            }
                        />
                        <select
                            className="input"
                            value={period}
                            onChange={(event) =>
                                setPeriod(event.target.value as Period)
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
                            value={from}
                            onChange={(event) => setFrom(event.target.value)}
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={to}
                            onChange={(event) => setTo(event.target.value)}
                        />
                        <input
                            className="input"
                            type="datetime-local"
                            value={anchorDate}
                            onChange={(event) => setAnchorDate(event.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void handleCreateContribution()
                            }}
                            disabled={loading}
                        >
                            Crear aportación
                        </button>
                        <button
                            type="button"
                            className="button"
                            onClick={() => {
                                void loadContributions()
                            }}
                            disabled={loading}
                        >
                            Recargar aportaciones
                        </button>
                    </div>

                    {contributions.length === 0 ? (
                        <p className="text-sm text-gray-500 mt-3">
                            No hay aportaciones para los filtros indicados.
                        </p>
                    ) : (
                        <div className="overflow-auto mt-3">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Monto</th>
                                        <th>Usuario</th>
                                        <th>Transacción</th>
                                        <th>Notas</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {contributions.map((contribution) => (
                                        <tr key={contribution.id}>
                                            <td>
                                                {formatIso(
                                                    contribution.contributedAt,
                                                )}
                                            </td>
                                            <td>{contribution.amount}</td>
                                            <td>
                                                {contribution.createdByUser
                                                    ?.displayName ?? '-'}
                                            </td>
                                            <td>
                                                {contribution.transaction?.id ??
                                                    '-'}
                                            </td>
                                            <td>{contribution.notes ?? '-'}</td>
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

export default Goals
