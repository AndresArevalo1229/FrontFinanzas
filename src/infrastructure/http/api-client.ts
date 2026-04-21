import { AxiosHeaders, type AxiosRequestConfig } from 'axios'
import axios from 'axios'

import { unwrapApiEnvelope } from '@/infrastructure/http/api-envelope'
import { mapAxiosError } from '@/infrastructure/http/map-axios-error'
import { useAuthStore } from '@/presentation/state/auth-store'
import { env } from '@/shared/config/env'

export const apiClient = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const state = useAuthStore.getState()
  const headers = AxiosHeaders.from(config.headers)

  const accessToken = state.session?.tokens.accessToken
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  const workspaceId = state.activeWorkspaceId
  if (workspaceId) {
    headers.set('x-workspace-id', workspaceId)
  }

  config.headers = headers
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    return {
      ...response,
      data: unwrapApiEnvelope(response.data, response.status),
    }
  },
  (error: unknown) => {
    return Promise.reject(mapAxiosError(error))
  },
)

export const httpRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request<T>(config)
  return response.data
}
