interface ApiErrorParams {
  code: string
  message: string
  details?: unknown
  requestId?: string
  status?: number
}

export class ApiError extends Error {
  readonly code: string
  readonly details: unknown
  readonly requestId?: string
  readonly status?: number

  constructor(params: ApiErrorParams) {
    super(params.message)
    this.name = 'ApiError'
    this.code = params.code
    this.details = params.details ?? null
    this.requestId = params.requestId
    this.status = params.status
  }
}
