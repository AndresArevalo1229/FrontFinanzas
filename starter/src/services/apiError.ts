import axios from 'axios'

import type { ApiFailure, ApiSuccess, NormalizedApiError } from '@/@types/api'

const isApiFailure = (value: unknown): value is ApiFailure => {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as Record<string, unknown>
    return (
        candidate.exito === false &&
        typeof candidate.mensaje === 'string' &&
        typeof candidate.error === 'object' &&
        candidate.error !== null
    )
}

const toErrorObject = (
    params: Partial<NormalizedApiError> & { message: string },
): NormalizedApiError => {
    const error = new Error(params.message) as NormalizedApiError
    error.status = params.status
    error.code = params.code
    error.details = params.details
    error.requestId = params.requestId
    return error
}

export const buildApiFailureError = (
    payload: ApiFailure,
    status?: number,
): NormalizedApiError => {
    const code = payload.error.codigo

    return toErrorObject({
        message: code ? `${payload.mensaje} (${code})` : payload.mensaje,
        status,
        code,
        details: payload.error.detalles,
        requestId: payload.meta.requestId,
    })
}

export const extractMetaAlerts = <TData>(payload: ApiSuccess<TData>) => {
    const rawAlerts = payload.meta.alertasPresupuesto
    return Array.isArray(rawAlerts) ? rawAlerts : []
}

export const normalizeApiError = (error: unknown): NormalizedApiError => {
    if (axios.isAxiosError(error)) {
        const status = error.response?.status
        const data = error.response?.data

        if (isApiFailure(data)) {
            return buildApiFailureError(data, status)
        }

        if (typeof data === 'object' && data !== null) {
            const generic = data as Record<string, unknown>
            const message =
                typeof generic.message === 'string'
                    ? generic.message
                    : typeof generic.mensaje === 'string'
                      ? generic.mensaje
                      : error.message || 'Error de red o servidor'

            return toErrorObject({
                message,
                status,
                details: generic,
            })
        }

        return toErrorObject({
            message: error.message || 'Error de red o servidor',
            status,
        })
    }

    if (error instanceof Error) {
        return error as NormalizedApiError
    }

    return toErrorObject({
        message: 'Ocurrió un error inesperado',
    })
}
