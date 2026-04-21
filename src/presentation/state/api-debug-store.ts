import { create } from 'zustand'

import type { ApiDebugEvent } from '@/infrastructure/http/api-debug'

interface ApiDebugState {
  entries: ApiDebugEvent[]
  pushEntry: (entry: ApiDebugEvent) => void
  clearEntries: () => void
}

const MAX_DEBUG_ENTRIES = 25

export const useApiDebugStore = create<ApiDebugState>((set) => ({
  entries: [],
  pushEntry: (entry) => {
    set((state) => ({
      entries: [entry, ...state.entries].slice(0, MAX_DEBUG_ENTRIES),
    }))
  },
  clearEntries: () => {
    set({ entries: [] })
  },
}))
