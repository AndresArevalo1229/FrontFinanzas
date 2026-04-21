import { QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { createQueryClient } from '@/app/query-client'

interface RenderWithProvidersOptions {
  route?: string
}

export const renderWithProviders = (
  ui: React.ReactNode,
  options: RenderWithProvidersOptions = {},
) => {
  const queryClient = createQueryClient()

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[options.route ?? '/']}>{ui}</MemoryRouter>
    </QueryClientProvider>,
  )
}
