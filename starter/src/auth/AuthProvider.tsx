import { useRef, useImperativeHandle } from 'react'
import { useNavigate } from 'react-router'

import AuthContext from './AuthContext'
import appConfig from '@/configs/app.config'
import { REDIRECT_URL_KEY } from '@/constants/app.constant'
import { useSessionUser } from '@/store/authStore'
import { apiSignIn, apiSignOut, apiSignUp } from '@/services/AuthService'
import { normalizeApiError } from '@/services/apiError'
import type {
    SignInCredential,
    SignUpCredential,
    AuthResult,
    OauthSignInCallbackPayload,
    User,
    Token,
} from '@/@types/auth'
import type { ReactNode, Ref } from 'react'
import type { NavigateFunction } from 'react-router'

type AuthProviderProps = { children: ReactNode }

export type IsolatedNavigatorRef = {
    navigate: NavigateFunction
}

const IsolatedNavigator = ({ ref }: { ref: Ref<IsolatedNavigatorRef> }) => {
    const navigate = useNavigate()

    useImperativeHandle(ref, () => {
        return {
            navigate,
        }
    }, [navigate])

    return <></>
}

const resolveRedirectPath = (): string => {
    const search = window.location.search
    const params = new URLSearchParams(search)
    const redirectUrl = params.get(REDIRECT_URL_KEY)
    return redirectUrl || appConfig.authenticatedEntryPath
}

function AuthProvider({ children }: AuthProviderProps) {
    const signedIn = useSessionUser((state) => state.session.signedIn)
    const accessToken = useSessionUser((state) => state.session.accessToken)
    const refreshToken = useSessionUser((state) => state.session.refreshToken)
    const user = useSessionUser((state) => state.user)
    const hydrateFromAuthSuccess = useSessionUser(
        (state) => state.hydrateFromAuthSuccess,
    )
    const clearAuth = useSessionUser((state) => state.clearAuth)

    const authenticated = Boolean(signedIn && accessToken)

    const navigatorRef = useRef<IsolatedNavigatorRef>(null)

    const redirect = () => {
        navigatorRef.current?.navigate(resolveRedirectPath())
    }

    const handleSignIn = (
        tokens: Token,
        userData?: User,
        nextPath?: string,
    ) => {
        if (tokens.accessToken) {
            useSessionUser.getState().setTokens({
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken ?? '',
                tokenType: 'Bearer',
                expiresIn: '',
            })
        }

        if (userData) {
            useSessionUser.getState().setUser(userData)
        }

        navigatorRef.current?.navigate(nextPath || appConfig.authenticatedEntryPath)
    }

    const signIn = async (values: SignInCredential): AuthResult => {
        try {
            const resp = await apiSignIn(values)
            hydrateFromAuthSuccess(resp)
            redirect()
            return {
                status: 'success',
                message: '',
            }
        } catch (error) {
            const normalized = normalizeApiError(error)
            return {
                status: 'failed',
                message: normalized.message,
            }
        }
    }

    const signUp = async (values: SignUpCredential): AuthResult => {
        try {
            const resp = await apiSignUp(values)
            hydrateFromAuthSuccess(resp)
            redirect()
            return {
                status: 'success',
                message: '',
            }
        } catch (error) {
            const normalized = normalizeApiError(error)
            return {
                status: 'failed',
                message: normalized.message,
            }
        }
    }

    const signOut = async () => {
        try {
            if (refreshToken) {
                await apiSignOut(refreshToken)
            }
        } catch {
            // El backend es fuente de verdad; en cualquier error cerramos sesión local.
        } finally {
            clearAuth()
            navigatorRef.current?.navigate(appConfig.unAuthenticatedEntryPath)
        }
    }

    const oAuthSignIn = (
        callback: (payload: OauthSignInCallbackPayload) => void,
    ) => {
        callback({
            onSignIn: (tokens, oauthUser) => {
                handleSignIn(tokens, oauthUser)
            },
            redirect,
        })
    }

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                user,
                signIn,
                signUp,
                signOut,
                oAuthSignIn,
            }}
        >
            {children}
            <IsolatedNavigator ref={navigatorRef} />
        </AuthContext.Provider>
    )
}

export default AuthProvider
