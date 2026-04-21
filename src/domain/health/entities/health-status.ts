export interface HealthStatus {
  servicio: string
  estado: 'ok' | 'degradado'
  fecha: string
  dependencias: {
    baseDatos: 'ok' | 'error'
  }
}
