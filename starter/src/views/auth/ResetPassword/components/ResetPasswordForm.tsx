import { useState } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { FormItem, Form } from '@/components/ui/Form'
import PasswordInput from '@/components/shared/PasswordInput'
import { apiResetPassword } from '@/services/AuthService'
import { normalizeApiError } from '@/services/apiError'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { ZodType } from 'zod'
import type { CommonProps } from '@/@types/common'

interface ResetPasswordFormProps extends CommonProps {
    resetComplete: boolean
    setResetComplete?: (compplete: boolean) => void
    setMessage?: (message: string) => void
}

type ResetPasswordFormSchema = {
    token: string
    newPassword: string
    confirmPassword: string
}

const validationSchema: ZodType<ResetPasswordFormSchema> = z
    .object({
        token: z
            .string({ required_error: 'Ingresa el token de recuperación' })
            .min(20, 'Token inválido'),
        newPassword: z
            .string({ required_error: 'Ingresa tu nueva contraseña' })
            .min(8, 'Mínimo 8 caracteres'),
        confirmPassword: z.string({
            required_error: 'Confirma la contraseña',
        }),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: 'Las contraseñas no coinciden',
        path: ['confirmPassword'],
    })

const ResetPasswordForm = (props: ResetPasswordFormProps) => {
    const [isSubmitting, setSubmitting] = useState<boolean>(false)

    const { className, setMessage, setResetComplete, resetComplete, children } =
        props

    const {
        handleSubmit,
        formState: { errors },
        control,
    } = useForm<ResetPasswordFormSchema>({
        resolver: zodResolver(validationSchema),
    })

    const onResetPassword = async (values: ResetPasswordFormSchema) => {
        const { token, newPassword } = values

        try {
            setSubmitting(true)
            const resp = await apiResetPassword({
                token,
                newPassword,
            })
            if (resp) {
                setSubmitting(false)
                setResetComplete?.(true)
            }
        } catch (error) {
            const normalized = normalizeApiError(error)
            setMessage?.(normalized.message)
            setSubmitting(false)
        }

        setSubmitting(false)
    }

    return (
        <div className={className}>
            {!resetComplete ? (
                <Form onSubmit={handleSubmit(onResetPassword)}>
                    <FormItem
                        label="Token"
                        invalid={Boolean(errors.token)}
                        errorMessage={errors.token?.message}
                    >
                        <Controller
                            name="token"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    autoComplete="off"
                                    placeholder="Pega aquí el token"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Nueva contraseña"
                        invalid={Boolean(errors.newPassword)}
                        errorMessage={errors.newPassword?.message}
                    >
                        <Controller
                            name="newPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="••••••••••••"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <FormItem
                        label="Confirmar contraseña"
                        invalid={Boolean(errors.confirmPassword)}
                        errorMessage={errors.confirmPassword?.message}
                    >
                        <Controller
                            name="confirmPassword"
                            control={control}
                            render={({ field }) => (
                                <PasswordInput
                                    autoComplete="off"
                                    placeholder="Confirm Password"
                                    {...field}
                                />
                            )}
                        />
                    </FormItem>
                    <Button
                        block
                        loading={isSubmitting}
                        variant="solid"
                        type="submit"
                    >
                        {isSubmitting ? 'Actualizando...' : 'Actualizar contraseña'}
                    </Button>
                </Form>
            ) : (
                <>{children}</>
            )}
        </div>
    )
}

export default ResetPasswordForm
