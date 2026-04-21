import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { HttpAuthRepository } from '@/infrastructure/auth/http-auth.repository'
import { HttpHealthRepository } from '@/infrastructure/health/http-health.repository'
import { HttpWorkspaceRepository } from '@/infrastructure/workspace/http-workspace.repository'
import { Button } from '@/presentation/components/ui/button'
import { Card } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'
import { translateApiError } from '@/shared/errors/error-translator'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo valido'),
  password: z.string().min(8, 'Minimo 8 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>
type UiStatus = 'idle' | 'loading' | 'error' | 'success'

export const LoginPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const authRepository = useMemo(() => new HttpAuthRepository(), [])
  const healthRepository = useMemo(() => new HttpHealthRepository(), [])
  const workspaceRepository = useMemo(() => new HttpWorkspaceRepository(), [])

  const [backendReady, setBackendReady] = useState(false)
  const [checkingConnection, setCheckingConnection] = useState(true)
  const [connectionWarning, setConnectionWarning] = useState<string | null>(null)

  const [uiStatus, setUiStatus] = useState<UiStatus>('idle')
  const [uiMessage, setUiMessage] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@misfinanzas.local',
      password: '',
    },
  })

  const verifyBackendConnection = useCallback(async () => {
    setCheckingConnection(true)

    try {
      const health = await healthRepository.getHealth()

      if (health.estado === 'ok') {
        setBackendReady(true)
        setConnectionWarning(null)
      } else {
        setBackendReady(false)
        setConnectionWarning('Backend disponible, pero la base de datos esta degradada.')
      }
    } catch {
      setBackendReady(false)
      setConnectionWarning('No pudimos conectar con el backend. Intenta de nuevo.')
    } finally {
      setCheckingConnection(false)
    }
  }, [healthRepository])

  const loadWorkspaces = useCallback(async () => {
    const currentSession = useAuthStore.getState().session

    if (!currentSession) {
      throw new Error('SESION_INEXISTENTE')
    }

    const workspaces = await workspaceRepository.list()
    const activeWorkspaceId =
      workspaces[0]?.id ??
      currentSession.activeWorkspaceId ??
      currentSession.workspaces[0]?.id ??
      null

    if (!activeWorkspaceId) {
      throw new Error('WORKSPACE_NO_DISPONIBLE')
    }

    setSession({
      ...currentSession,
      workspaces: workspaces.length > 0 ? workspaces : currentSession.workspaces,
      activeWorkspaceId,
    })
  }, [setSession, workspaceRepository])

  useEffect(() => {
    void verifyBackendConnection()
  }, [verifyBackendConnection])

  const onSubmit = handleSubmit(async (values) => {
    if (!backendReady) {
      setUiStatus('error')
      setUiMessage('No hay conexion valida con el backend en este momento.')
      return
    }

    setUiStatus('loading')
    setUiMessage('Validando acceso...')

    try {
      const authSession = await authRepository.login(values)
      setSession(authSession)

      await loadWorkspaces()

      setUiStatus('success')
      setUiMessage('Acceso correcto. Redirigiendo al panel...')
      navigate(ROUTES.app, { replace: true })
    } catch (error) {
      setUiStatus('error')

      if (error instanceof Error && error.message === 'WORKSPACE_NO_DISPONIBLE') {
        setUiMessage('No encontramos un workspace disponible para este usuario.')
        return
      }

      if (error instanceof Error && error.message === 'SESION_INEXISTENTE') {
        setUiMessage('No se pudo mantener la sesion. Intenta nuevamente.')
        return
      }

      setUiMessage(translateApiError(error))
    }
  })

  const isLoading = uiStatus === 'loading' || isSubmitting

  return (
    <main className="relative isolate min-h-screen overflow-hidden bg-app-gradient px-4 py-8 sm:px-6 lg:px-8">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-midnight-500/30 blur-3xl" />
        <div className="absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-rosy-400/30 blur-3xl" />
        <div className="absolute left-1/2 top-1/3 h-56 w-56 -translate-x-1/2 rounded-full bg-moss-500/25 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <Card className="w-full max-w-md rounded-[2rem] border-moss-300/80 bg-beige-100/80 p-8 shadow-[0_30px_80px_-30px_rgba(10,51,35,0.55)] backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.26em] text-midnight-700">Mis Finanzas</p>
          <h1 className="mt-3 text-3xl font-black text-forest-900">Iniciar sesion</h1>
          <p className="mt-2 text-sm text-forest-800">
            Tu espacio financiero personal y en pareja.
          </p>

          {connectionWarning ? (
            <div className="mt-5 rounded-xl border border-rosy-600/40 bg-rosy-400/25 p-3">
              <p className="text-sm text-forest-900">{connectionWarning}</p>
              <Button
                className="mt-3"
                variant="ghost"
                size="sm"
                type="button"
                onClick={verifyBackendConnection}
                disabled={checkingConnection}
              >
                {checkingConnection ? 'Reintentando...' : 'Reintentar'}
              </Button>
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-forest-900" htmlFor="email">
                Correo
              </label>
              <Input id="email" type="email" placeholder="admin@misfinanzas.local" {...register('email')} />
              {errors.email ? <p className="text-sm text-rosy-700">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-forest-900" htmlFor="password">
                Contrasena
              </label>
              <Input id="password" type="password" placeholder="********" {...register('password')} />
              {errors.password ? <p className="text-sm text-rosy-700">{errors.password.message}</p> : null}
            </div>

            <Button className="w-full" type="submit" disabled={isLoading || checkingConnection || !backendReady}>
              {isLoading ? 'Ingresando...' : checkingConnection ? 'Verificando conexion...' : 'Entrar'}
            </Button>
          </form>

          {uiStatus === 'error' && uiMessage ? (
            <p className="mt-4 rounded-lg border border-rosy-600/40 bg-rosy-400/20 px-3 py-2 text-sm text-forest-900">
              {uiMessage}
            </p>
          ) : null}

          {uiStatus === 'success' && uiMessage ? (
            <p className="mt-4 rounded-lg border border-moss-700/40 bg-moss-500/25 px-3 py-2 text-sm text-forest-900">
              {uiMessage}
            </p>
          ) : null}
        </Card>
      </div>
    </main>
  )
}
