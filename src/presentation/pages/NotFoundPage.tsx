import { Link } from 'react-router-dom'

import { Button } from '@/presentation/components/ui/button'
import { ROUTES } from '@/shared/constants/routes'

export const NotFoundPage = () => {
  return (
    <main className="grid min-h-screen place-items-center bg-app-gradient px-4">
      <section className="max-w-md text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-brand-700">404</p>
        <h1 className="mt-3 text-4xl font-black text-slate-900">Ruta no encontrada</h1>
        <p className="mt-3 text-slate-600">
          Esta página no existe en la fase actual del frontend.
        </p>
        <Button className="mt-6" asChild>
          <Link to={ROUTES.root}>Volver al inicio</Link>
        </Button>
      </section>
    </main>
  )
}
