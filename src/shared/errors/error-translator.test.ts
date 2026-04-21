import { ApiError } from '@/shared/errors/api-error'
import { translateApiError } from '@/shared/errors/error-translator'

describe('translateApiError', () => {
  it('traduce codigos backend conocidos', () => {
    const translated = translateApiError(
      new ApiError({
        code: 'CREDENCIALES_INVALIDAS',
        message: 'Correo o contrasena invalida',
      }),
    )

    expect(translated).toBe('Correo o contrasena incorrectos.')
  })

  it('usa mensaje original cuando no hay traduccion', () => {
    const translated = translateApiError(
      new ApiError({
        code: 'ALGO_NUEVO',
        message: 'Error personalizado',
      }),
    )

    expect(translated).toBe('Error personalizado')
  })

  it('maneja errores desconocidos', () => {
    expect(translateApiError('fallo')).toBe('Ocurrio un error inesperado. Intenta nuevamente.')
  })
})
