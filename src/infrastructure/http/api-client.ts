import { AxiosHeaders, type AxiosRequestConfig, type RawAxiosResponseHeaders } from 'axios'
import axios from 'axios'

import { emitApiDebugEvent } from '@/infrastructure/http/api-debug'
import { unwrapApiEnvelope } from '@/infrastructure/http/api-envelope'
import { mapAxiosError } from '@/infrastructure/http/map-axios-error'
import { useAuthStore } from '@/presentation/state/auth-store'
import { env } from '@/shared/config/env'

const resolveMethod = (method?: string): string => {
  return (method ?? 'GET').toUpperCase()
}

const resolveEndpoint = (config: AxiosRequestConfig): string => {
  const rawUrl = config.url ?? '/'

  try {
    if (/^https?:\/\//i.test(rawUrl)) {
      const absolute = new URL(rawUrl)
      return `${absolute.pathname}${absolute.search}`
    }

    const normalizedBase = (config.baseURL ?? env.apiBaseUrl).replace(/\/+$/, '')
    const normalizedPath = rawUrl.startsWith('/') ? rawUrl : `/${rawUrl}`
    const absolute = new URL(`${normalizedBase}${normalizedPath}`)

    return `${absolute.pathname}${absolute.search}`
  } catch {
    return rawUrl
  }
}

const getRequestIdFromHeaders = (headers: AxiosHeaders | RawAxiosResponseHeaders): string | null => {
  const fromAxiosHeaders = AxiosHeaders.from(headers).get('x-request-id')

  if (typeof fromAxiosHeaders === 'string' && fromAxiosHeaders.length > 0) {
    return fromAxiosHeaders
  }

  return null
}

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
    const method = resolveMethod(response.config.method)
    const endpoint = resolveEndpoint(response.config)
    const requestId = getRequestIdFromHeaders(response.headers)

    emitApiDebugEvent({
      metodo: method,
      endpoint,
      status: response.status,
      exito: true,
      mensaje: 'Solicitud completada correctamente.',
      requestId,
    })

    return {
      ...response,
      data: unwrapApiEnvelope(response.data, response.status),
    }
  },
  (error: unknown) => {
    const typedError = mapAxiosError(error)

    if (axios.isAxiosError(error)) {
      const method = resolveMethod(error.config?.method)
      const endpoint = resolveEndpoint(error.config ?? {})
      const requestId =
        typedError.requestId ??
        (error.response?.headers
          ? getRequestIdFromHeaders(error.response.headers)
          : null)

      emitApiDebugEvent({
        metodo: method,
        endpoint,
        status: error.response?.status ?? null,
        exito: false,
        mensaje: typedError.message,
        requestId,
      })
    } else {
      emitApiDebugEvent({
        metodo: 'N/A',
        endpoint: 'N/A',
        status: null,
        exito: false,
        mensaje: typedError.message,
        requestId: typedError.requestId ?? null,
      })
    }

    return Promise.reject(typedError)
  },
)

export const httpRequest = async <T>(config: AxiosRequestConfig): Promise<T> => {
  const response = await apiClient.request<T>(config)
  return response.data
}
