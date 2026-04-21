export interface WorkspaceSummary {
  id: string
  name: string
  baseCurrency: string
  timezone: string
  role: 'OWNER' | 'MEMBER'
}
