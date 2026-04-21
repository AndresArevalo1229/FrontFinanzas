import { ApiError } from '@/shared/errors/api-error'

const backendCodeMap: Record<string, string> = {
  CREDENCIALES_INVALIDAS: 'Correo o contrasena incorrectos.',
  TOKEN_INVALIDO: 'La sesion no es valida. Inicia sesion nuevamente.',
  TOKEN_REQUERIDO: 'Necesitas iniciar sesion para continuar.',
  USUARIO_NO_ENCONTRADO: 'No se encontro el usuario autenticado.',
  WORKSPACE_NO_SELECCIONADO: 'Selecciona un workspace para continuar.',
  WORKSPACE_INVALIDO: 'El workspace enviado no es valido.',
  SIN_CONEXION_BACKEND: 'No pudimos conectar con el backend. Intenta de nuevo.',
}

export const translateApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    const mapped = backendCodeMap[error.code]
    if (mapped) {
      return mapped
    }

    return error.message
  }

  return 'Ocurrio un error inesperado. Intenta nuevamente.'
}
