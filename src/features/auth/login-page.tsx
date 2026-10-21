import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button, FormField } from '../../components/ui'
import { getErrorMessage } from '../../components/ui/error-state'
import { AuthFooterLink, AuthLayout } from './auth-layout'

const loginSchema = z.object({
  email: z.email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
      const from = (location.state as { from?: string } | null)?.from
      navigate(from ?? '/app', { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to sign in.'))
    }
  })

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your preparation streak."
      footer={
        <>
          New to PrepForge? <AuthFooterLink to="/register">Create an account</AuthFooterLink>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {formError && (
          <div
            role="alert"
            className="rounded-[var(--radius-control)] bg-coral-soft px-3 py-2 text-sm text-danger"
          >
            {formError}
          </div>
        )}

        <FormField label="Email" error={errors.email?.message} required>
          {(props) => (
            <div className="relative">
              <Mail
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                {...props}
                {...register('email')}
                type="email"
                autoComplete="email"
                className="pf-input pl-9"
                placeholder="you@example.com"
              />
            </div>
          )}
        </FormField>

        <FormField label="Password" error={errors.password?.message} required>
          {(props) => (
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                {...props}
                {...register('password')}
                type="password"
                autoComplete="current-password"
                className="pf-input pl-9"
                placeholder="••••••••"
              />
            </div>
          )}
        </FormField>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
          Sign in
        </Button>
      </form>
    </AuthLayout>
  )
}
