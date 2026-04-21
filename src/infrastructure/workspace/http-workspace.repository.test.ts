import { httpRequest } from '@/infrastructure/http/api-client'
import { HttpWorkspaceRepository } from '@/infrastructure/workspace/http-workspace.repository'
import { ApiError } from '@/shared/errors/api-error'


vi.mock('@/infrastructure/http/api-client', () => ({
  httpRequest: vi.fn(),
}))

const mockedHttpRequest = vi.mocked(httpRequest)

describe('HttpWorkspaceRepository', () => {
  beforeEach(() => {
    mockedHttpRequest.mockReset()
  })

  it('retorna listado de workspaces cuando la respuesta es valida', async () => {
    mockedHttpRequest.mockResolvedValue([
      {
        id: 'w-1',
        name: 'Casa',
        baseCurrency: 'MXN',
        timezone: 'America/Mexico_City',
        role: 'OWNER',
      },
    ])

    const repository = new HttpWorkspaceRepository()
    const result = await repository.list()

    expect(result).toHaveLength(1)
    expect(mockedHttpRequest).toHaveBeenCalledWith({
      url: '/workspaces',
      method: 'GET',
    })
  })

  it('propaga error tipado cuando el backend responde con error', async () => {
    mockedHttpRequest.mockRejectedValue(
      new ApiError({
        code: 'TOKEN_INVALIDO',
        message: 'No autorizado',
      }),
    )

    const repository = new HttpWorkspaceRepository()

    await expect(repository.list()).rejects.toMatchObject({
      code: 'TOKEN_INVALIDO',
    })
  })
})
