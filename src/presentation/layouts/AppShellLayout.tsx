import { Link, Outlet } from 'react-router-dom'

import { Button } from '@/presentation/components/ui/button'
import { useAuthStore } from '@/presentation/state/auth-store'
import { ROUTES } from '@/shared/constants/routes'

export const AppShellLayout = () => {
  const session = useAuthStore((state) => state.session)
  const clearSession = useAuthStore((state) => state.clearSession)

  return (
    <div className="min-h-screen bg-app-gradient text-slate-900">
      <header className="border-b border-white/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-brand-700">Mis Finanzas</p>
            <h1 className="text-lg font-bold">Panel principal</h1>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.app}>Inicio</Link>
            </Button>
            <Button variant="secondary" size="sm" onClick={clearSession}>
              Cerrar sesión
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        <Outlet />
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-10 text-xs text-slate-500 sm:px-6">
        Sesión activa: {session?.user.email ?? 'sin sesión'}
      </footer>
    </div>
  )
}
