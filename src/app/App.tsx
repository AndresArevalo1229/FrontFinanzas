import { BrowserRouter } from 'react-router-dom'

import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/presentation/routes/AppRoutes'

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
