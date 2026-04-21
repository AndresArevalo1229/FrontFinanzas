import { httpRequest } from '@/infrastructure/http/api-client'

import type { WorkspaceRepositoryPort } from '@/application/ports/workspace-repository.port'
import type { WorkspaceSummary } from '@/domain/workspace/entities/workspace-summary'

export class HttpWorkspaceRepository implements WorkspaceRepositoryPort {
  async list(): Promise<WorkspaceSummary[]> {
    return httpRequest<WorkspaceSummary[]>({
      url: '/workspaces',
      method: 'GET',
    })
  }
}
