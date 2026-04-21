import { BrowserRouter } from 'react-router-dom'

import { ApiDebugBridge } from '@/app/ApiDebugBridge'
import { AppProviders } from '@/app/providers'
import { AppRoutes } from '@/presentation/routes/AppRoutes'

export const App = () => {
  return (
    <AppProviders>
      <BrowserRouter>
        <ApiDebugBridge />
        <AppRoutes />
      </BrowserRouter>
    </AppProviders>
  )
}
