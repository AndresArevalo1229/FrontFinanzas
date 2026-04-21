import ApiService from './ApiService'
import endpointConfig from '@/configs/endpoint.config'
import type {
    AuthSuccessData,
    SignInCredential,
    SignUpCredential,
    ForgotPassword,
    ResetPassword,
    RefreshSuccessData,
} from '@/@types/auth'

export async function apiSignIn(data: SignInCredential) {
    return ApiService.fetchDataWithAxios<AuthSuccessData>({
        url: endpointConfig.signIn,
        method: 'post',
        data,
    })
}

export async function apiSignUp(data: SignUpCredential) {
    const payload = {
        email: data.email,
        password: data.password,
        displayName: data.userName,
        workspaceName: data.workspaceName,
        baseCurrency: data.baseCurrency,
        timezone: data.timezone,
    }

    return ApiService.fetchDataWithAxios<AuthSuccessData>({
        url: endpointConfig.signUp,
        method: 'post',
        data: payload,
    })
}

export async function apiSignOut(refreshToken: string) {
    return ApiService.fetchDataWithAxios({
        url: endpointConfig.signOut,
        method: 'post',
        data: {
            refreshToken,
        },
    })
}

export async function apiForgotPassword(data: ForgotPassword) {
    return ApiService.fetchDataWithAxios<{
        resetToken?: string
    }>({
        url: endpointConfig.forgotPassword,
        method: 'post',
        data,
    })
}

export async function apiResetPassword(data: ResetPassword) {
    return ApiService.fetchDataWithAxios<{
        ok: true
    }>({
        url: endpointConfig.resetPassword,
        method: 'post',
        data,
    })
}

export async function apiRefreshSession(refreshToken: string) {
    return ApiService.fetchDataWithAxios<RefreshSuccessData>({
        url: endpointConfig.refreshSession,
        method: 'post',
        data: {
            refreshToken,
        },
    })
}
