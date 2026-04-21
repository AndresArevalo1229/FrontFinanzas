import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { HttpAuthRepository } from '@/infrastructure/auth/http-auth.repository'
import { HttpHealthRepository } from '@/infrastructure/health/http-health.repository'
import { HttpWorkspaceRepository } from '@/infrastructure/workspace/http-workspace.repository'
import { ApiDebugPanel } from '@/presentation/components/debug/ApiDebugPanel'
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
type StepStatus = 'pendiente' | 'en_proceso' | 'exito' | 'error'

const statusLabel: Record<StepStatus, string> = {
  pendiente: 'Pendiente',
  en_proceso: 'En proceso',
  exito: 'Exito',
  error: 'Error',
}

const statusClass: Record<StepStatus, string> = {
  pendiente: 'bg-beige-200 text-forest-900 border border-beige-400',
  en_proceso: 'bg-midnight-500 text-beige-100 border border-midnight-700',
  exito: 'bg-moss-500 text-forest-900 border border-moss-700',
  error: 'bg-rosy-400 text-forest-900 border border-rosy-600',
}

export const LoginPage = () => {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const authRepository = useMemo(() => new HttpAuthRepository(), [])
  const healthRepository = useMemo(() => new HttpHealthRepository(), [])
  const workspaceRepository = useMemo(() => new HttpWorkspaceRepository(), [])

  const [healthStatus, setHealthStatus] = useState<StepStatus>('pendiente')
  const [healthMessage, setHealthMessage] = useState(
    'Primero valida la conexion con el backend.',
  )

  const [loginStatus, setLoginStatus] = useState<StepStatus>('pendiente')
  const [loginMessage, setLoginMessage] = useState('Esperando credenciales para autenticar.')

  const [workspaceStatus, setWorkspaceStatus] = useState<StepStatus>('pendiente')
  const [workspaceMessage, setWorkspaceMessage] = useState(
    'Despues del login se cargaran tus workspaces.',
  )

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

  const runHealthCheck = async () => {
    setHealthStatus('en_proceso')
    setHealthMessage('Validando endpoint /api/v1/health ...')

    try {
      const health = await healthRepository.getHealth()
      const healthy = health.estado === 'ok'

      if (healthy) {
        setHealthStatus('exito')
        setHealthMessage(
          `Backend activo (${health.servicio}) y base de datos en estado ${health.dependencias.baseDatos}.`,
        )
        return
      }

      setHealthStatus('error')
      setHealthMessage(
        'El backend respondio degradado. Revisa base de datos y vuelve a intentar.',
      )
    } catch (error) {
      setHealthStatus('error')
      setHealthMessage(translateApiError(error))
    }
  }

  const loadWorkspaces = async (): Promise<boolean> => {
    setWorkspaceStatus('en_proceso')
    setWorkspaceMessage('Consultando endpoint /api/v1/workspaces ...')

    try {
      const currentSession = useAuthStore.getState().session
      if (!currentSession) {
        setWorkspaceStatus('error')
        setWorkspaceMessage('No hay sesion activa para consultar workspaces.')
        return false
      }

      const workspaces = await workspaceRepository.list()
      const activeWorkspaceId =
        workspaces[0]?.id ?? currentSession.activeWorkspaceId ?? currentSession.workspaces[0]?.id ?? null

      if (!activeWorkspaceId) {
        setWorkspaceStatus('error')
        setWorkspaceMessage('No se encontro ningun workspace disponible para este usuario.')
        return false
      }

      setSession({
        ...currentSession,
        workspaces: workspaces.length > 0 ? workspaces : currentSession.workspaces,
        activeWorkspaceId,
      })

      setWorkspaceStatus('exito')
      setWorkspaceMessage(`Workspace activo seleccionado: ${activeWorkspaceId}`)
      return true
    } catch (error) {
      setWorkspaceStatus('error')
      setWorkspaceMessage(translateApiError(error))
      return false
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    if (healthStatus !== 'exito') {
      setHealthMessage('Debes validar el backend antes de iniciar sesion.')
      return
    }

    setLoginStatus('en_proceso')
    setLoginMessage('Enviando credenciales a /api/v1/auth/login ...')

    try {
      const authSession = await authRepository.login(values)
      setSession(authSession)
      setLoginStatus('exito')
      setLoginMessage(`Sesion iniciada para ${authSession.user.displayName}.`)

      const workspaceLoaded = await loadWorkspaces()

      if (workspaceLoaded) {
        navigate(ROUTES.app, { replace: true })
      }
    } catch (error) {
      setLoginStatus('error')
      setLoginMessage(translateApiError(error))
    }
  })

  const loadingHealth = healthStatus === 'en_proceso'
  const canLogin = healthStatus === 'exito'
  const showWorkspaceRetry = loginStatus === 'exito' && workspaceStatus === 'error'

  return (
    <main className="min-h-screen bg-app-gradient px-4 py-10 sm:px-6">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border-moss-300 bg-beige-100/90">
          <p className="text-xs uppercase tracking-[0.2em] text-midnight-700">Fase 1 guiada</p>
          <h1 className="mt-2 text-3xl font-black leading-tight text-forest-900">
            Conexion real con backend paso a paso.
          </h1>
          <p className="mt-3 text-sm text-forest-800">
            Flujo de aprendizaje: <strong>health</strong>, despues <strong>login</strong> y luego{' '}
            <strong>workspaces</strong>. Todo visible en espanol y con depuracion para que puedas
            entender cada llamada.
          </p>

          <div className="mt-6 space-y-3">
            <article className="rounded-xl border border-moss-300 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-forest-900">Paso 1: Probar conexion backend</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[healthStatus]}`}>
                  {statusLabel[healthStatus]}
                </span>
              </div>
              <p className="mt-2 text-sm text-forest-800">{healthMessage}</p>
              <Button
                className="mt-3"
                variant="secondary"
                size="sm"
                type="button"
                onClick={runHealthCheck}
                disabled={loadingHealth}
              >
                {loadingHealth ? 'Validando...' : 'Probar conexion'}
              </Button>
            </article>

            <article className="rounded-xl border border-moss-300 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-forest-900">Paso 2: Login real</h2>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[loginStatus]}`}>
                  {statusLabel[loginStatus]}
                </span>
              </div>
              <p className="mt-2 text-sm text-forest-800">{loginMessage}</p>
            </article>

            <article className="rounded-xl border border-moss-300 bg-white/80 p-3">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-forest-900">Paso 3: Cargar workspaces</h2>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClass[workspaceStatus]}`}
                >
                  {statusLabel[workspaceStatus]}
                </span>
              </div>
              <p className="mt-2 text-sm text-forest-800">{workspaceMessage}</p>

              {showWorkspaceRetry ? (
                <Button className="mt-3" variant="secondary" size="sm" onClick={loadWorkspaces}>
                  Reintentar carga de workspaces
                </Button>
              ) : null}
            </article>
          </div>
        </Card>

        <Card className="border-moss-300 bg-beige-100/90">
          <h2 className="text-2xl font-bold text-forest-900">Iniciar sesion</h2>
          <p className="mt-2 text-sm text-forest-800">
            Este formulario ya consume el endpoint real `POST /api/v1/auth/login`.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-forest-900" htmlFor="email">
                Correo
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@misfinanzas.local"
                {...register('email')}
              />
              {errors.email ? <p className="text-sm text-rosy-700">{errors.email.message}</p> : null}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-forest-900" htmlFor="password">
                Contrasena
              </label>
              <Input id="password" type="password" placeholder="********" {...register('password')} />
              {errors.password ? (
                <p className="text-sm text-rosy-700">{errors.password.message}</p>
              ) : null}
            </div>

            <Button className="w-full" type="submit" disabled={isSubmitting || !canLogin}>
              {isSubmitting ? 'Autenticando...' : 'Iniciar sesion'}
            </Button>
          </form>

          {!canLogin ? (
            <p className="mt-3 text-xs text-forest-800">
              Antes de autenticar, ejecuta el Paso 1 para validar la conexion con backend.
            </p>
          ) : null}
        </Card>
      </div>

      <div className="mx-auto mt-6 w-full max-w-6xl">
        <ApiDebugPanel title="Depuracion en vivo de endpoints (con requestId)" />
      </div>
    </main>
  )
}
