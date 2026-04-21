import { useCallback, useMemo, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { useSessionUser } from '@/store/authStore'
import { apiGetDashboardSummary, type ReportsQuery } from '@/services/ReportsService'
import { normalizeApiError } from '@/services/apiError'
import { toIsoOrUndefined } from '@/utils/dateTime'
import type { DashboardSummary, Period } from '@/@types/finance'

const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const Home = () => {
    const selectedWorkspaceId = useSessionUser(
        (state) => state.session.selectedWorkspaceId,
    )
    const workspaces = useSessionUser((state) => state.workspaces)

    const selectedWorkspace = useMemo(() => {
        return workspaces.find((workspace) => workspace.id === selectedWorkspaceId)
    }, [selectedWorkspaceId, workspaces])

    const [summary, setSummary] = useState<DashboardSummary | null>(null)
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [period, setPeriod] = useState<Period>('month')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [anchorDate, setAnchorDate] = useState('')

    const handleLoad = useCallback(async () => {
        try {
            setIsLoading(true)
            setMessage('')

            const query: ReportsQuery = {
                period,
                from: toIsoOrUndefined(from),
                to: toIsoOrUndefined(to),
                anchorDate: toIsoOrUndefined(anchorDate),
            }

            const nextSummary = await apiGetDashboardSummary(query)
            setSummary(nextSummary)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setIsLoading(false)
        }
    }, [anchorDate, from, period, to])

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <h3 className="mb-1">Dashboard</h3>
                <p className="text-sm text-gray-500">
                    Workspace activo:{' '}
                    <span className="font-semibold">
                        {selectedWorkspace?.name || 'No seleccionado'}
                    </span>
                </p>
            </div>

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Filtros</h5>
                    <div className="grid md:grid-cols-4 gap-3">
                        <label className="flex flex-col gap-1 text-sm">
                            Periodo
                            <select
                                className="input"
                                value={period}
                                onChange={(event) =>
                                    setPeriod(event.target.value as Period)
                                }
                            >
                                {periodOptions.map((item) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            From
                            <input
                                className="input"
                                type="datetime-local"
                                value={from}
                                onChange={(event) => setFrom(event.target.value)}
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            To
                            <input
                                className="input"
                                type="datetime-local"
                                value={to}
                                onChange={(event) => setTo(event.target.value)}
                            />
                        </label>

                        <label className="flex flex-col gap-1 text-sm">
                            Anchor date
                            <input
                                className="input"
                                type="datetime-local"
                                value={anchorDate}
                                onChange={(event) => setAnchorDate(event.target.value)}
                            />
                        </label>
                    </div>

                    <button
                        className="btn btn-solid mt-3"
                        onClick={() => {
                            void handleLoad()
                        }}
                        disabled={isLoading}
                        type="button"
                    >
                        {isLoading ? 'Cargando...' : 'Cargar resumen'}
                    </button>

                    {message ? (
                        <div className="mt-3 text-sm text-red-600">{message}</div>
                    ) : null}
                </div>

                {summary ? (
                    <div className="border rounded p-4 bg-white dark:bg-gray-900">
                        <h5 className="mb-3">Resultado</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm mb-4">
                            <div>Saldo neto: {summary.saldoNeto}</div>
                            <div>Ingresos: {summary.ingresos}</div>
                            <div>Egresos: {summary.egresos}</div>
                            <div>Ahorro neto: {summary.ahorroNeto}</div>
                            <div>
                                Periodo from:{' '}
                                {new Date(summary.periodo.from).toLocaleString()}
                            </div>
                            <div>
                                Periodo to:{' '}
                                {new Date(summary.periodo.to).toLocaleString()}
                            </div>
                        </div>

                        <h6 className="mb-2">Top cuentas</h6>
                        <ul className="list-disc ml-5 text-sm">
                            {summary.topAccounts.map((account) => (
                                <li key={account.id}>
                                    {account.name} ({account.type}) - {account.balance}
                                </li>
                            ))}
                        </ul>
                    </div>
                ) : null}
            </WorkspaceRequiredNotice>
        </div>
    )
}

export default Home
