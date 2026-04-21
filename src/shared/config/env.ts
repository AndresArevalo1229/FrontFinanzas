const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, '')

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Mis Finanzas',
  apiBaseUrl: normalizeBaseUrl(
    import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3100/api/v1',
  ),
}
