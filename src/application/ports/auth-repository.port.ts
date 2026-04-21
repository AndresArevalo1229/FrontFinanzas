import type { AuthSession } from '@/domain/auth/entities/auth-session'

export interface LoginInput {
  email: string
  password: string
}

export interface AuthRepositoryPort {
  login(input: LoginInput): Promise<AuthSession>
  refresh(refreshToken: string): Promise<AuthSession>
  logout(refreshToken: string): Promise<void>
}
