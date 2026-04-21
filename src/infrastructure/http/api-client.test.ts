
import { apiClient } from '@/infrastructure/http/api-client'
import { useAuthStore } from '@/presentation/state/auth-store'

import type { ApiError } from '@/shared/errors/api-error'
import type { AxiosRequestConfig, AxiosResponse } from 'axios'

describe('apiClient', () => {
  it('inyecta Authorization y x-workspace-id cuando hay sesión', async () => {
    useAuthStore.getState().setSession({
      user: {
        id: 'u-1',
        email: 'demo@misfinanzas.local',
        displayName: 'Demo',
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
        accessToken: 'token-123',
        refreshToken: 'refresh-123',
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
      activeWorkspaceId: 'w-1',
    })

    let capturedConfig: AxiosRequestConfig | undefined

    const adapter = async (
      config: AxiosRequestConfig,
    ): Promise<AxiosResponse<{ ok: boolean }>> => {
      capturedConfig = config

      return {
        data: {
          exito: true,
          mensaje: 'OK',
          datos: { ok: true },
          meta: { requestId: 'req-1' },
          error: null,
        } as unknown as { ok: boolean },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    const response = await apiClient.get<{ ok: boolean }>('/health', { adapter })

    expect(response.data.ok).toBe(true)
    expect(capturedConfig?.headers?.Authorization).toBe('Bearer token-123')
    expect(capturedConfig?.headers?.['x-workspace-id']).toBe('w-1')
  })

  it('propaga ApiError tipado cuando el backend responde exito=false', async () => {
    const adapter = async (config: AxiosRequestConfig): Promise<AxiosResponse<unknown>> => {
      return {
        data: {
          exito: false,
          mensaje: 'No autorizado',
          datos: null,
          meta: { requestId: 'req-2' },
          error: {
            codigo: 'TOKEN_INVALIDO',
            detalles: null,
          },
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config,
      }
    }

    await expect(apiClient.get('/secure', { adapter })).rejects.toMatchObject<ApiError>({
      code: 'TOKEN_INVALIDO',
      message: 'No autorizado',
      requestId: 'req-2',
    })
  })
})
