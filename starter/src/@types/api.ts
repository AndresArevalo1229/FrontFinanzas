export interface ApiMeta {
    requestId: string
    [key: string]: unknown
}

export interface ApiFailure {
    exito: false
    mensaje: string
    datos: null
    meta: ApiMeta
    error: {
        codigo: string
        detalles: unknown
    }
}

export interface ApiSuccess<TData> {
    exito: true
    mensaje: string
    datos: TData
    meta: ApiMeta
    error: null
}

export type ApiEnvelope<TData> = ApiSuccess<TData> | ApiFailure

export interface NormalizedApiError extends Error {
    status?: number
    code?: string
    details?: unknown
    requestId?: string
}
