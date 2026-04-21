import { httpRequest } from '@/infrastructure/http/api-client'

import type { HealthRepositoryPort } from '@/application/ports/health-repository.port'
import type { HealthStatus } from '@/domain/health/entities/health-status'

export class HttpHealthRepository implements HealthRepositoryPort {
  async getHealth(): Promise<HealthStatus> {
    return httpRequest<HealthStatus>({
      url: '/health',
      method: 'GET',
    })
  }
}
