import { QueryClientProvider } from '@tanstack/react-query'
import { type PropsWithChildren, useState } from 'react'

import { createQueryClient } from '@/app/query-client'

export const AppProviders = ({ children }: PropsWithChildren) => {
  const [queryClient] = useState(createQueryClient)

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
