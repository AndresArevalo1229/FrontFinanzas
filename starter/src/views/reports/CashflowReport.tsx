import { useCallback, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { apiGetCashflowReport, type ReportsQuery } from '@/services/ReportsService'
import { normalizeApiError } from '@/services/apiError'
import { toIsoOrUndefined } from '@/utils/dateTime'
import type { CashflowReport as CashflowReportType, Period } from '@/@types/finance'

const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const CashflowReport = () => {
    const [report, setReport] = useState<CashflowReportType | null>(null)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const [period, setPeriod] = useState<Period>('month')
    const [from, setFrom] = useState('')
    const [to, setTo] = useState('')
    const [anchorDate, setAnchorDate] = useState('')

    const handleLoad = useCallback(async () => {
        try {
            setLoading(true)
            setMessage('')
            const query: ReportsQuery = {
                period,
                from: toIsoOrUndefined(from),
                to: toIsoOrUndefined(to),
                anchorDate: toIsoOrUndefined(anchorDate),
            }
            const response = await apiGetCashflowReport(query)
            setReport(response)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [anchorDate, from, period, to])

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Reporte de cashflow</h3>

            {message ? (
                <div className="text-sm rounded border border-gray-300 p-2">{message}</div>
            ) : null}

            <WorkspaceRequiredNotice>
                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Filtros</h5>
                    <div className="grid md:grid-cols-4 gap-2">
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
                    <button
                        type="button"
                        className="button mt-2"
                        onClick={() => {
                            void handleLoad()
                        }}
                        disabled={loading}
                    >
                        {loading ? 'Cargando...' : 'Cargar reporte'}
                    </button>
                </div>

                <div className="border rounded p-4 bg-white dark:bg-gray-900">
                    <h5 className="mb-3">Serie diaria</h5>
                    {!report || report.serie.length === 0 ? (
                        <p className="text-sm text-gray-500">Sin resultados.</p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Ingresos</th>
                                        <th>Egresos</th>
                                        <th>Neto</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {report.serie.map((row) => (
                                        <tr key={row.fecha}>
                                            <td>{row.fecha}</td>
                                            <td>{row.ingresos}</td>
                                            <td>{row.egresos}</td>
                                            <td>{row.neto}</td>
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

export default CashflowReport
