import { httpRequest } from '@/infrastructure/http/api-client'
import {
  mapAuthSuccessToSession,
  type AuthSuccessDto,
} from '@/infrastructure/mappers/auth.mapper'

import type { AuthRepositoryPort, LoginInput } from '@/application/ports/auth-repository.port'
import type { AuthSession } from '@/domain/auth/entities/auth-session'

export class HttpAuthRepository implements AuthRepositoryPort {
  async login(input: LoginInput): Promise<AuthSession> {
    const dto = await httpRequest<AuthSuccessDto>({
      url: '/auth/login',
      method: 'POST',
      data: input,
    })

    return mapAuthSuccessToSession(dto)
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const dto = await httpRequest<AuthSuccessDto>({
      url: '/auth/refresh',
      method: 'POST',
      data: {
        refreshToken,
      },
    })

    return mapAuthSuccessToSession(dto)
  }

  async logout(refreshToken: string): Promise<void> {
    await httpRequest<{ ok: boolean }>({
      url: '/auth/logout',
      method: 'POST',
      data: {
        refreshToken,
      },
    })
  }
}
