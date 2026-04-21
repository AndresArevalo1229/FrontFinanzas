import { unwrapApiEnvelope } from '@/infrastructure/http/api-envelope'
import { ApiError } from '@/shared/errors/api-error'

describe('unwrapApiEnvelope', () => {
  it('retorna datos cuando exito=true', () => {
    const result = unwrapApiEnvelope<{ ok: boolean }>({
      exito: true,
      mensaje: 'OK',
      datos: { ok: true },
      meta: { requestId: 'req-1' },
      error: null,
    })

    expect(result.ok).toBe(true)
  })

  it('lanza ApiError cuando exito=false', () => {
    expect(() =>
      unwrapApiEnvelope({
        exito: false,
        mensaje: 'Token inválido',
        datos: null,
        meta: { requestId: 'req-2' },
        error: {
          codigo: 'TOKEN_INVALIDO',
          detalles: null,
        },
      }),
    ).toThrow(ApiError)
  })

  it('lanza ApiError cuando el contrato HTTP es inválido', () => {
    expect(() => unwrapApiEnvelope({ foo: 'bar' })).toThrow(ApiError)
  })
})
