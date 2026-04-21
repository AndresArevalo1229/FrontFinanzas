import axios from 'axios'
import appConfig from '@/configs/app.config'
import {
    REQUEST_HEADER_AUTH_KEY,
    REQUEST_HEADER_WORKSPACE_KEY,
    TOKEN_TYPE,
} from '@/constants/api.constant'
import { useSessionUser } from '@/store/authStore'
import type { ApiEnvelope } from '@/@types/api'
import type { RefreshSuccessData } from '@/@types/auth'
import type {
    AxiosError,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios'

const AxiosBase = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

const refreshClient = axios.create({
    timeout: 60000,
    baseURL: appConfig.apiPrefix,
})

const publicAuthEndpoints = [
    '/auth/login',
    '/auth/register',
    '/auth/password/forgot',
    '/auth/password/reset',
]

const shouldSkipTokenRefresh = (requestUrl: string): boolean => {
    return (
        publicAuthEndpoints.some((path) => requestUrl.includes(path)) ||
        requestUrl.includes('/auth/refresh')
    )
}

const clearSessionAndRedirect = (): void => {
    useSessionUser.getState().clearAuth()

    if (typeof window !== 'undefined' && window.location.pathname !== '/sign-in') {
        window.location.assign('/sign-in')
    }
}

const injectAuthHeaders = (
    config: InternalAxiosRequestConfig,
): InternalAxiosRequestConfig => {
    const state = useSessionUser.getState()

    if (state.session.accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] = `${TOKEN_TYPE}${state.session.accessToken}`
    }

    if (state.session.selectedWorkspaceId) {
        config.headers[REQUEST_HEADER_WORKSPACE_KEY] = state.session.selectedWorkspaceId
    }

    return config
}

const runRefreshTokenFlow = async (): Promise<string> => {
    const state = useSessionUser.getState()
    const refreshToken = state.session.refreshToken

    if (!refreshToken) {
        throw new Error('No refresh token disponible')
    }

    const response = await refreshClient.post<ApiEnvelope<RefreshSuccessData>>(
        '/auth/refresh',
        {
            refreshToken,
        },
    )

    const payload = response.data

    if (!payload.exito) {
        throw new Error(payload.mensaje)
    }

    useSessionUser.getState().hydrateFromAuthSuccess({
        user: payload.datos.user,
        workspaces: payload.datos.workspaces,
        tokens: payload.datos.tokens,
    })

    return payload.datos.tokens.accessToken
}

let pendingRefreshPromise: Promise<string> | null = null

const getRefreshPromise = () => {
    if (!pendingRefreshPromise) {
        pendingRefreshPromise = runRefreshTokenFlow().finally(() => {
            pendingRefreshPromise = null
        })
    }

    return pendingRefreshPromise
}

AxiosBase.interceptors.request.use((config) => injectAuthHeaders(config))

AxiosBase.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalConfig = error.config as
            | (AxiosRequestConfig & {
                  _retry?: boolean
              })
            | undefined

        const responseStatus = error.response?.status
        const requestUrl = originalConfig?.url ?? ''

        if (
            responseStatus !== 401 ||
            !originalConfig ||
            originalConfig._retry ||
            shouldSkipTokenRefresh(requestUrl)
        ) {
            return Promise.reject(error)
        }

        if (!useSessionUser.getState().session.refreshToken) {
            clearSessionAndRedirect()
            return Promise.reject(error)
        }

        originalConfig._retry = true

        try {
            const refreshedAccessToken = await getRefreshPromise()
            originalConfig.headers = originalConfig.headers ?? {}
            originalConfig.headers[REQUEST_HEADER_AUTH_KEY] =
                `${TOKEN_TYPE}${refreshedAccessToken}`

            return AxiosBase.request(originalConfig)
        } catch {
            clearSessionAndRedirect()
        }

        return Promise.reject(error)
    },
)

export default AxiosBase
