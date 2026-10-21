import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Lock, User } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { Button, FormField } from '../../components/ui'
import { getErrorMessage } from '../../components/ui/error-state'
import { AuthFooterLink, AuthLayout } from './auth-layout'

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.email('Enter a valid email address'),
    targetRole: z.string().optional(),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type RegisterValues = z.infer<typeof registerSchema>

export function RegisterPage() {
  const { register: registerUser, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [formError, setFormError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      targetRole: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (isAuthenticated) {
    return <Navigate to="/app" replace />
  }

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await registerUser({
        name: values.name,
        email: values.email,
        password: values.password,
        targetRole: values.targetRole || undefined,
      })
      navigate('/app', { replace: true })
    } catch (error) {
      setFormError(getErrorMessage(error, 'Unable to create your account.'))
    }
  })

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your placement preparation workspace."
      footer={
        <>
          Already registered? <AuthFooterLink to="/login">Sign in</AuthFooterLink>
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

        <FormField label="Full name" error={errors.name?.message} required>
          {(props) => (
            <div className="relative">
              <User
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                {...props}
                {...register('name')}
                type="text"
                autoComplete="name"
                className="pf-input pl-9"
                placeholder="Ada Lovelace"
              />
            </div>
          )}
        </FormField>

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

        <FormField
          label="Target role"
          hint="Optional — e.g. SDE-1, Analyst, Backend Engineer"
          error={errors.targetRole?.message}
        >
          {(props) => (
            <input
              {...props}
              {...register('targetRole')}
              type="text"
              className="pf-input"
              placeholder="SDE-1"
            />
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
                autoComplete="new-password"
                className="pf-input pl-9"
                placeholder="At least 8 characters"
              />
            </div>
          )}
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword?.message} required>
          {(props) => (
            <div className="relative">
              <Lock
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-ink-faint"
                aria-hidden="true"
              />
              <input
                {...props}
                {...register('confirmPassword')}
                type="password"
                autoComplete="new-password"
                className="pf-input pl-9"
                placeholder="Repeat your password"
              />
            </div>
          )}
        </FormField>

        <Button type="submit" size="lg" isLoading={isSubmitting} className="w-full">
          Create account
        </Button>
      </form>
    </AuthLayout>
  )
}
