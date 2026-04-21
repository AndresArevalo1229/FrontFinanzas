export interface ApiDebugEvent {
  id: string
  fecha: string
  metodo: string
  endpoint: string
  status: number | null
  exito: boolean
  mensaje: string
  requestId: string | null
}

type ApiDebugListener = (event: ApiDebugEvent) => void

const listeners = new Set<ApiDebugListener>()

export const subscribeApiDebugEvents = (listener: ApiDebugListener): (() => void) => {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}

export const emitApiDebugEvent = (event: Omit<ApiDebugEvent, 'id' | 'fecha'>) => {
  const payload: ApiDebugEvent = {
    ...event,
    id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    fecha: new Date().toISOString(),
  }

  listeners.forEach((listener) => {
    listener(payload)
  })
}
