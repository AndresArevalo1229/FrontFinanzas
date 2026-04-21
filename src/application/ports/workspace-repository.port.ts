import type { WorkspaceSummary } from '@/domain/workspace/entities/workspace-summary'

export interface WorkspaceRepositoryPort {
  list(): Promise<WorkspaceSummary[]>
}
