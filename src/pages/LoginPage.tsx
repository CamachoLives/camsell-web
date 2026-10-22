import { Eye, EyeOff, LogIn } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'

import { useAuthStore } from '@/features/auth/store'
import { ApiError } from '@/shared/api/client'
import { TextField } from '@/shared/ui/Field'
import { InlineAlert } from '@/shared/ui/Feedback'
import { Button } from '@/shared/ui/Button'
import { useToast } from '@/shared/ui/toast'

interface LoginForm {
  email: string
  password: string
}

const DEMO_ACCOUNTS = [
  { email: 'admin@camsell.dev', label: 'Administrador', detail: 'Parámetros, marcas y noticias' },
  { email: 'ventas@autonorte.co', label: 'Concesionario', detail: 'Publicaciones destacadas' },
  { email: 'carlos.ruiz@mail.com', label: 'Comprador', detail: 'Ofertas y favoritos activos' },
]

const DEMO_PASSWORD = 'Camsell2026*'

export function LoginPage() {
  const login = useAuthStore((state) => state.login)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ defaultValues: { email: '', password: '' } })

  const redirectTo = (location.state as { from?: string } | null)?.from ?? '/cuenta'

  async function onSubmit(values: LoginForm) {
    setFormError(null)
    try {
      const user = await login(values)
      toast.success(`Bienvenido, ${user.fullName.split(' ')[0]}`)
      navigate(redirectTo, { replace: true })
    } catch (error) {
      setFormError(
        error instanceof ApiError
          ? error.message
          : 'No pudimos iniciar tu sesión. Intenta de nuevo.',
      )
    }
  }

  function fillDemoAccount(email: string) {
    setValue('email', email, { shouldValidate: true })
    setValue('password', DEMO_PASSWORD, { shouldValidate: true })
  }

  return (
    <section className="mx-auto grid max-w-5xl gap-8 px-4 py-14 lg:grid-cols-[1fr_20rem] lg:px-8">
      <div className="surface-card rounded-2xl p-7 sm:p-9">
        <h1 className="text-2xl font-semibold">Ingresa a tu cuenta</h1>
        <p className="text-muted mt-1.5 text-sm">
          Administra tus publicaciones, responde ofertas y guarda los vehículos que te interesan.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-7 flex flex-col gap-4" noValidate>
          {formError ? <InlineAlert>{formError}</InlineAlert> : null}

          <TextField
            label="Correo"
            type="email"
            autoComplete="email"
            placeholder="tu@correo.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'El correo es obligatorio',
              pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Revisa el formato del correo' },
            })}
          />

          <TextField
            label="Clave"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                className="text-muted hover:text-strong transition-colors"
              >
                {showPassword ? (
                  <EyeOff className="size-4" aria-hidden />
                ) : (
                  <Eye className="size-4" aria-hidden />
                )}
              </button>
            }
            {...register('password', { required: 'La clave es obligatoria' })}
          />

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting}
            icon={<LogIn className="size-4" />}
          >
            Ingresar
          </Button>
        </form>

        <p className="text-muted mt-6 text-sm">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-brand-700 dark:text-brand-300 font-medium hover:underline">
            Créala en un minuto
          </Link>
        </p>
      </div>

      <aside className="surface-card h-fit rounded-2xl p-6">
        <h2 className="text-sm font-semibold">Cuentas de demostración</h2>
        <p className="text-muted mt-1 text-xs">
          Toca una para llenar el formulario. Todas usan la clave{' '}
          <code className="bg-surface-sunken rounded px-1 py-0.5 text-[0.7rem]">
            {DEMO_PASSWORD}
          </code>
        </p>
        <ul className="mt-4 flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <li key={account.email}>
              <button
                type="button"
                onClick={() => fillDemoAccount(account.email)}
                className="hover:border-brand-400 hover:bg-surface-sunken w-full rounded-xl border border-surface px-3.5 py-2.5 text-left transition-colors"
              >
                <span className="text-strong block text-sm font-medium">{account.label}</span>
                <span className="text-muted block truncate text-xs">{account.email}</span>
                <span className="text-muted block text-xs">{account.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </section>
  )
}
