import { HttpHealthRepository } from '@/infrastructure/health/http-health.repository'
import { httpRequest } from '@/infrastructure/http/api-client'
import { ApiError } from '@/shared/errors/api-error'


vi.mock('@/infrastructure/http/api-client', () => ({
  httpRequest: vi.fn(),
}))

const mockedHttpRequest = vi.mocked(httpRequest)

describe('HttpHealthRepository', () => {
  beforeEach(() => {
    mockedHttpRequest.mockReset()
  })

  it('retorna estado de salud cuando la respuesta es correcta', async () => {
    mockedHttpRequest.mockResolvedValue({
      servicio: 'back_finanzas',
      estado: 'ok',
      fecha: '2026-01-01T00:00:00.000Z',
      dependencias: {
        baseDatos: 'ok',
      },
    })

    const repository = new HttpHealthRepository()
    const result = await repository.getHealth()

    expect(result.estado).toBe('ok')
    expect(mockedHttpRequest).toHaveBeenCalledWith({
      url: '/health',
      method: 'GET',
    })
  })

  it('propaga error tipado cuando la respuesta falla', async () => {
    mockedHttpRequest.mockRejectedValue(
      new ApiError({
        code: 'RESPUESTA_INVALIDA',
        message: 'Formato invalido',
      }),
    )

    const repository = new HttpHealthRepository()

    await expect(repository.getHealth()).rejects.toMatchObject({
      code: 'RESPUESTA_INVALIDA',
    })
  })
})
