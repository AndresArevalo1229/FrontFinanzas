import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'

import { Button } from '@/presentation/components/ui/button'
import { Card } from '@/presentation/components/ui/card'
import { Input } from '@/presentation/components/ui/input'
import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

const loginSchema = z.object({
  email: z.string().email('Ingresa un correo válido'),
  password: z.string().min(8, 'Mínimo 8 caracteres'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export const LoginPage = () => {
  const setSession = useAuthStore((state) => state.setSession)
  const navigate = useNavigate()
  const [note, setNote] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    setSession({
      user: {
        id: 'demo-user-1',
        email: values.email,
        displayName: 'Usuario Demo',
      },
      workspaces: [
        {
          id: 'demo-workspace-1',
          name: 'Espacio demo',
          baseCurrency: 'MXN',
          timezone: 'America/Mexico_City',
          role: 'OWNER',
        },
      ],
      tokens: {
        accessToken: 'demo-access-token',
        refreshToken: 'demo-refresh-token',
        tokenType: 'Bearer',
        expiresIn: '15m',
      },
      activeWorkspaceId: 'demo-workspace-1',
    })

    setNote('Login de demostración activado. En la siguiente fase conectaremos el backend real.')
    navigate(ROUTES.app, { replace: true })
  })

  return (
    <main className="min-h-screen bg-app-gradient px-4 py-10 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 lg:flex-row">
        <section className="flex-1">
          <p className="text-xs uppercase tracking-[0.2em] text-brand-800">ProyectoFinanzas</p>
          <h1 className="mt-3 max-w-lg text-4xl font-black leading-tight text-slate-900">
            Frontend listo para Clean Architecture y conexión API.
          </h1>
          <p className="mt-4 max-w-xl text-slate-700">
            Este acceso es un placeholder funcional para validar navegación, guard de rutas y
            estado global antes de integrar el login real.
          </p>
        </section>

        <section className="w-full max-w-md">
          <Card>
            <h2 className="text-2xl font-bold text-slate-900">Iniciar sesión</h2>
            <p className="mt-2 text-sm text-slate-600">Fase actual: bootstrap de frontend.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="email">
                  Correo
                </label>
                <Input id="email" type="email" placeholder="correo@ejemplo.com" {...register('email')} />
                {errors.email ? <p className="text-sm text-red-600">{errors.email.message}</p> : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-800" htmlFor="password">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  {...register('password')}
                />
                {errors.password ? (
                  <p className="text-sm text-red-600">{errors.password.message}</p>
                ) : null}
              </div>

              <Button className="w-full" type="submit" disabled={isSubmitting}>
                Entrar (demo)
              </Button>
            </form>

            {note ? <p className="mt-4 text-sm text-emerald-700">{note}</p> : null}
          </Card>
        </section>
      </div>
    </main>
  )
}
