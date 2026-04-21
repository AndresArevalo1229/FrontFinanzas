import { useEffect } from 'react'

import { subscribeApiDebugEvents } from '@/infrastructure/http/api-debug'
import { useApiDebugStore } from '@/presentation/state/api-debug-store'

export const ApiDebugBridge = () => {
  const pushEntry = useApiDebugStore((state) => state.pushEntry)

  useEffect(() => {
    return subscribeApiDebugEvents((entry) => {
      pushEntry(entry)
    })
  }, [pushEntry])

  return null
}
