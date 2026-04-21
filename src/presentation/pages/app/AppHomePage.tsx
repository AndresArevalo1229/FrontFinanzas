import { ApiDebugPanel } from '@/presentation/components/debug/ApiDebugPanel'
import { Card } from '@/presentation/components/ui/card'
import { useAuthStore } from '@/presentation/state/auth-store'

export const AppHomePage = () => {
  const session = useAuthStore((state) => state.session)
  const activeWorkspaceId = useAuthStore((state) => state.activeWorkspaceId)

  return (
    <section className="space-y-6">
      <Card className="border-moss-300 bg-beige-100/90">
        <p className="text-xs uppercase tracking-[0.15em] text-midnight-700">Estado de fase 1</p>
        <h2 className="mt-2 text-2xl font-bold text-forest-900">Panel inicial</h2>
        <p className="mt-3 text-forest-800">
          Endpoints activos en esta fase: `GET /health`, `POST /auth/login`, `GET /workspaces`.
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-moss-300 bg-white/80">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-midnight-700">
            Usuario activo
          </h3>
          <p className="mt-2 text-lg font-semibold text-forest-900">{session?.user.displayName}</p>
          <p className="text-sm text-forest-800">{session?.user.email}</p>
        </Card>

        <Card className="border-moss-300 bg-white/80">
          <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-midnight-700">
            Workspace activo
          </h3>
          <p className="mt-2 text-lg font-semibold text-forest-900">{activeWorkspaceId ?? 'N/D'}</p>
          <p className="text-sm text-forest-800">Header enviado automaticamente: x-workspace-id</p>
        </Card>
      </div>

      <Card className="border-moss-300 bg-white/80">
        <h3 className="text-sm font-semibold uppercase tracking-[0.08em] text-midnight-700">
          Workspaces disponibles
        </h3>
        {session?.workspaces?.length ? (
          <ul className="mt-3 space-y-2 text-sm text-forest-900">
            {session.workspaces.map((workspace) => (
              <li key={workspace.id} className="rounded-lg border border-moss-300 bg-beige-100/80 px-3 py-2">
                <strong>{workspace.name}</strong> ({workspace.id})
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-forest-800">No hay workspaces cargados.</p>
        )}
      </Card>

      <ApiDebugPanel />
    </section>
  )
}
