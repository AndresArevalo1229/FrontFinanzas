import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

import { resetAuthStore } from '@/presentation/state/auth-store'

afterEach(() => {
  cleanup()
  resetAuthStore()
})
