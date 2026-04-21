import type { HealthStatus } from '@/domain/health/entities/health-status'

export interface HealthRepositoryPort {
  getHealth(): Promise<HealthStatus>
}
