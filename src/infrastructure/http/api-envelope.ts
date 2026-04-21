import { ApiError } from '@/shared/errors/api-error'
import { isApiEnvelope, type ApiEnvelope } from '@/shared/types/api'

export const unwrapApiEnvelope = <T>(payload: unknown, status?: number): T => {
  if (!isApiEnvelope<T>(payload)) {
    throw new ApiError({
      code: 'RESPUESTA_INVALIDA',
      message: 'El backend respondió con un formato inesperado',
      details: payload,
      status,
    })
  }

  const envelope = payload as ApiEnvelope<T>

  if (!envelope.exito) {
    throw new ApiError({
      code: envelope.error.codigo,
      message: envelope.mensaje,
      details: envelope.error.detalles,
      requestId: envelope.meta.requestId,
      status,
    })
  }

  return envelope.datos
}
