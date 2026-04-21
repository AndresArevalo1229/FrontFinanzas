import { useSessionUser } from '@/store/authStore'
import {
    TOKEN_TYPE,
    REQUEST_HEADER_AUTH_KEY,
    REQUEST_HEADER_WORKSPACE_KEY,
} from '@/constants/api.constant'
import type { InternalAxiosRequestConfig } from 'axios'

const AxiosRequestIntrceptorConfigCallback = (
    config: InternalAxiosRequestConfig,
) => {
    const state = useSessionUser.getState()

    if (state.session.accessToken) {
        config.headers[REQUEST_HEADER_AUTH_KEY] =
            `${TOKEN_TYPE}${state.session.accessToken}`
    }

    if (state.session.selectedWorkspaceId) {
        config.headers[REQUEST_HEADER_WORKSPACE_KEY] =
            state.session.selectedWorkspaceId
    }

    return config
}

export default AxiosRequestIntrceptorConfigCallback
