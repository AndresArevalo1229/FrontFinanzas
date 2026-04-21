export interface ApiMeta {
  requestId: string
  [key: string]: unknown
}

export interface ApiErrorPayload {
  codigo: string
  detalles: unknown
}

export interface ApiSuccess<T> {
  exito: true
  mensaje: string
  datos: T
  meta: ApiMeta
  error: null
}

export interface ApiFailure {
  exito: false
  mensaje: string
  datos: null
  meta: ApiMeta
  error: ApiErrorPayload
}

export type ApiEnvelope<T> = ApiSuccess<T> | ApiFailure

export const isApiEnvelope = <T>(value: unknown): value is ApiEnvelope<T> => {
  if (!value || typeof value !== 'object') {
    return false
  }

  const candidate = value as Partial<ApiEnvelope<T>>

  return (
    typeof candidate.exito === 'boolean' &&
    typeof candidate.mensaje === 'string' &&
    typeof candidate.meta === 'object' &&
    candidate.meta !== null &&
    typeof (candidate.meta as Record<string, unknown>).requestId === 'string'
  )
}
