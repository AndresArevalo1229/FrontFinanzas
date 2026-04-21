import { mapAuthSuccessToSession } from '@/infrastructure/mappers/auth.mapper'

describe('mapAuthSuccessToSession', () => {
  it('mapea el DTO de auth a sesión de dominio', () => {
    const session = mapAuthSuccessToSession({
      user: {
        id: 'u-1',
        email: 'user@demo.com',
        displayName: 'User Demo',
      },
      workspaces: [
        {
          id: 'w-1',
          name: 'Main',
          baseCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          role: 'OWNER',
        },
      ],
      tokens: {
        accessToken: 'a',
        refreshToken: 'r',
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
    })

    expect(session.activeWorkspaceId).toBe('w-1')
    expect(session.user.displayName).toBe('User Demo')
    expect(session.tokens.tokenType).toBe('Bearer')
  })
})
