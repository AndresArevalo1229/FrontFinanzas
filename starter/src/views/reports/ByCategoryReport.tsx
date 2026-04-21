import { useCallback, useState } from 'react'

import WorkspaceRequiredNotice from '@/components/app/WorkspaceRequiredNotice'
import { apiGetByCategoryReport, type ReportsQuery } from '@/services/ReportsService'
import { normalizeApiError } from '@/services/apiError'
import { toIsoOrUndefined } from '@/utils/dateTime'
import type { ByCategoryRow, Period } from '@/@types/finance'

const periodOptions: Period[] = ['month', 'week', 'day', 'year', 'custom']

const ByCategoryReport = () => {
    const [items, setItems] = useState<ByCategoryRow[]>([])
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
            const response = await apiGetByCategoryReport(query)
            setItems(response)
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage(normalized.message)
        } finally {
            setLoading(false)
        }
    }, [anchorDate, from, period, to])

    return (
        <div className="p-4 flex flex-col gap-4">
            <h3>Reporte por categoría</h3>

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
                    <h5 className="mb-3">Resultados</h5>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">Sin resultados.</p>
                    ) : (
                        <div className="overflow-auto">
                            <table className="table-default w-full">
                                <thead>
                                    <tr>
                                        <th>Categoría</th>
                                        <th>Tipo</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => (
                                        <tr
                                            key={`${item.categoryId ?? 'none'}-${index}`}
                                        >
                                            <td>{item.categoryName}</td>
                                            <td>{item.type}</td>
                                            <td>{item.total}</td>
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

export default ByCategoryReport
