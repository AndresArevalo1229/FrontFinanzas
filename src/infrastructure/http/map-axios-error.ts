import axios from 'axios'

import { ApiError } from '@/shared/errors/api-error'
import { isApiEnvelope } from '@/shared/types/api'

export const mapAxiosError = (error: unknown): ApiError => {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const payload = error.response?.data

    if (isApiEnvelope(payload) && !payload.exito) {
      return new ApiError({
        code: payload.error.codigo,
        message: payload.mensaje,
        details: payload.error.detalles,
        requestId: payload.meta.requestId,
        status,
      })
    }

    if (!error.response) {
      return new ApiError({
        code: 'SIN_CONEXION_BACKEND',
        message:
          'No se pudo conectar al backend. Verifica que este levantado en el puerto configurado.',
        details: null,
      })
    }

    return new ApiError({
      code: 'HTTP_ERROR',
      message: error.message,
      details: payload,
      status,
    })
  }

  return new ApiError({
    code: 'ERROR_DESCONOCIDO',
    message: 'Ocurrio un error inesperado',
    details: error,
  })
}
