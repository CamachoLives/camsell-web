import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { PasswordStrength } from '@/features/auth/PasswordStrength'
import { ApiError } from '@/shared/api/client'
import type { UserRole } from '@/shared/api/types'
import { Button } from '@/shared/ui/Button'
import { SelectField, TextField } from '@/shared/ui/Field'
import { InlineAlert } from '@/shared/ui/Feedback'
import { useToast } from '@/shared/ui/toast'

interface RegisterForm {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  phone: string
  role: Extract<UserRole, 'USER' | 'DEALER'>
}

export function RegisterPage() {
  const registerAccount = useAuthStore((state) => state.register)
  const navigate = useNavigate()
  const toast = useToast()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      phone: '',
      role: 'USER',
    },
  })

  const password = watch('password')

  async function onSubmit(values: RegisterForm) {
    setFormError(null)
    try {
      const user = await registerAccount({
        email: values.email,
        password: values.password,
        fullName: values.fullName,
        phone: values.phone || undefined,
        role: values.role,
      })
      toast.success(`Cuenta creada. Bienvenido, ${user.fullName.split(' ')[0]}`)
      navigate('/cuenta', { replace: true })
    } catch (error) {
      if (error instanceof ApiError) {
        // El backend valida por campo; se muestran esos errores junto al input.
        if (error.fieldIssues.length > 0) {
          for (const issue of error.fieldIssues) {
            if (issue.field in values) {
              setError(issue.field as keyof RegisterForm, { message: issue.message })
            }
          }
          setFormError('Revisa los campos marcados.')
          return
        }
        setFormError(error.message)
        return
      }
      setFormError('No pudimos crear tu cuenta. Intenta de nuevo.')
    }
  }

  return (
    <section className="mx-auto max-w-xl px-4 py-14 lg:px-8">
      <div className="surface-card rounded-panel p-7 sm:p-9">
        <h1 className="text-2xl font-semibold">Crea tu cuenta</h1>
        <p className="text-muted mt-1.5 text-sm">
          Es gratis. Publicar y ofertar no tiene costo ni comisión.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4" noValidate>
          {formError ? <InlineAlert>{formError}</InlineAlert> : null}

          <TextField
            label="Nombre completo"
            autoComplete="name"
            placeholder="Laura Gómez"
            required
            error={errors.fullName?.message}
            {...register('fullName', {
              required: 'El nombre es obligatorio',
              minLength: { value: 3, message: 'Escribe tu nombre completo' },
            })}
          />

          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Revisa el formato del correo',
              },
            })}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <TextField
                label="Clave"
                type="password"
                autoComplete="new-password"
                required
                hint="Mínimo 8 caracteres"
                error={errors.password?.message}
                {...register('password', {
                  required: 'La clave es obligatoria',
                  minLength: { value: 8, message: 'Usa al menos 8 caracteres' },
                })}
              />
              <PasswordStrength password={password} />
            </div>
            <TextField
              label="Repite la clave"
              type="password"
              autoComplete="new-password"
              required
              error={errors.confirmPassword?.message}
              {...register('confirmPassword', {
                required: 'Confirma la clave',
                validate: (value) => value === password || 'Las claves no coinciden',
              })}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Teléfono"
              type="tel"
              autoComplete="tel"
              placeholder="+57 300 000 0000"
              hint="Los compradores lo usan para contactarte"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <SelectField
              label="Tipo de cuenta"
              hint="Puedes cambiarlo después"
              {...register('role')}
            >
              <option value="USER">Particular</option>
              <option value="DEALER">Concesionario</option>
            </SelectField>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            icon={<UserPlus className="size-4" />}
          >
            Crear cuenta
          </Button>
        </form>

        <p className="text-muted mt-6 text-sm">
          ¿Ya tienes cuenta?{' '}
          <Link
            to="/ingresar"
            className="text-brand-700 dark:text-brand-300 font-medium hover:underline"
          >
            Ingresa aquí
          </Link>
        </p>
      </div>

      <aside className="surface-card mt-4 rounded-panel p-5">
        <p className="text-muted text-xs leading-relaxed">
          <span className="text-strong font-medium">¿Solo quieres explorar?</span> Puedes{' '}
          <Link
            to="/ingresar"
            className="text-brand-700 dark:text-brand-300 font-medium hover:underline"
          >
            ingresar con una cuenta de demostración
          </Link>{' '}
          en la pantalla de acceso. No se requiere correo real.
        </p>
      </aside>
    </section>
  )
}
