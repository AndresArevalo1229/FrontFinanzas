import { HttpAuthRepository } from '@/infrastructure/auth/http-auth.repository'
import { httpRequest } from '@/infrastructure/http/api-client'
import { ApiError } from '@/shared/errors/api-error'


vi.mock('@/infrastructure/http/api-client', () => ({
  httpRequest: vi.fn(),
}))

const mockedHttpRequest = vi.mocked(httpRequest)

describe('HttpAuthRepository', () => {
  beforeEach(() => {
    mockedHttpRequest.mockReset()
  })

  it('mapea login exitoso a AuthSession', async () => {
    mockedHttpRequest.mockResolvedValue({
      user: {
        id: 'u-1',
        email: 'admin@misfinanzas.local',
        displayName: 'Admin',
      },
      workspaces: [
        {
          id: 'w-1',
          name: 'Casa',
          baseCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          role: 'OWNER',
        },
      ],
      tokens: {
        accessToken: 'token-a',
        refreshToken: 'token-r',
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    })

    const repository = new HttpAuthRepository()
    const session = await repository.login({
      email: 'admin@misfinanzas.local',
      password: 'Admin12345!',
    })

    expect(session.user.email).toBe('admin@misfinanzas.local')
    expect(session.activeWorkspaceId).toBe('w-1')
  })

  it('propaga error tipado cuando login falla', async () => {
    mockedHttpRequest.mockRejectedValue(
      new ApiError({
        code: 'CREDENCIALES_INVALIDAS',
        message: 'Correo o contrasena invalida',
      }),
    )

    const repository = new HttpAuthRepository()

    await expect(
      repository.login({
        email: 'admin@misfinanzas.local',
        password: 'Admin12345!',
      }),
    ).rejects.toMatchObject({
      code: 'CREDENCIALES_INVALIDAS',
    })
  })
})
