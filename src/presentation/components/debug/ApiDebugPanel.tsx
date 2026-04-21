import { useMemo } from 'react'

import { Button } from '@/presentation/components/ui/button'
import { Card } from '@/presentation/components/ui/card'
import { useApiDebugStore } from '@/presentation/state/api-debug-store'

interface ApiDebugPanelProps {
  title?: string
}

const formatDate = (value: string): string => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return date.toLocaleTimeString('es-MX')
}

export const ApiDebugPanel = ({ title = 'Panel de depuración API' }: ApiDebugPanelProps) => {
  const entries = useApiDebugStore((state) => state.entries)
  const clearEntries = useApiDebugStore((state) => state.clearEntries)

  const hasEntries = useMemo(() => entries.length > 0, [entries.length])

  return (
    <Card className="border-moss-300 bg-beige-100/90">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.14em] text-midnight-700">Trazabilidad</p>
          <h3 className="text-lg font-bold text-forest-900">{title}</h3>
        </div>
        <Button variant="secondary" size="sm" onClick={clearEntries}>
          Limpiar
        </Button>
      </div>

      {!hasEntries ? (
        <p className="mt-4 rounded-xl border border-moss-300 bg-white/70 p-3 text-sm text-forest-900">
          Aun no hay llamadas registradas. Al consumir endpoints, veras metodo, ruta, estado y
          requestId.
        </p>
      ) : null}

      <div className="mt-4 space-y-2">
        {entries.map((entry) => (
          <article
            key={entry.id}
            className="rounded-xl border border-moss-300 bg-white/80 p-3 text-sm text-forest-900"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-midnight-700 px-2 py-0.5 text-xs font-semibold text-beige-100">
                {entry.metodo}
              </span>
              <span className="font-semibold">{entry.endpoint}</span>
              <span
                className={
                  entry.exito
                    ? 'rounded-full bg-moss-500 px-2 py-0.5 text-xs font-semibold text-forest-900'
                    : 'rounded-full bg-rosy-400 px-2 py-0.5 text-xs font-semibold text-forest-900'
                }
              >
                {entry.exito ? 'EXITO' : 'ERROR'}
              </span>
            </div>

            <div className="mt-2 grid gap-1 text-xs text-forest-700 sm:grid-cols-2">
              <p>Hora: {formatDate(entry.fecha)}</p>
              <p>Status HTTP: {entry.status ?? 'N/D'}</p>
              <p>RequestId: {entry.requestId ?? 'N/D'}</p>
              <p>Mensaje: {entry.mensaje}</p>
            </div>
          </article>
        ))}
      </div>
    </Card>
  )
}
