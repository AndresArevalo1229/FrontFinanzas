import { Card } from '@/presentation/components/ui/card'
import { useAuthStore } from '@/presentation/state/auth-store'

export const AppHomePage = () => {
  const session = useAuthStore((state) => state.session)
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)

  return (
    <section className="space-y-6">
      <Card>
        <p className="text-xs uppercase tracking-[0.15em] text-brand-700">Estado del bootstrap</p>
        <h2 className="mt-2 text-2xl font-bold">Panel inicial</h2>
        <p className="mt-3 text-slate-700">
          Estructura base lista: rutas protegidas, cliente API con headers, estado global y UI.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            Usuario activo
          </h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">{session?.user.displayName}</p>
          <p className="text-sm text-slate-600">{session?.user.email}</p>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">
            Workspace activo
          </h3>
          <p className="mt-2 text-lg font-semibold text-slate-900">{activeWorkspaceId ?? 'N/A'}</p>
          <p className="text-sm text-slate-600">Header enviado: x-workspace-id</p>
        </Card>
      </div>
    </section>
  )
}
