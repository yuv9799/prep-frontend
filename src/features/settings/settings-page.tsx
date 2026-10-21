import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogOut, Moon, Sun } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useProfileMutation } from '../../hooks'
import { Button, FormField, useToast } from '../../components/ui'

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  targetRole: z.string().optional(),
  targetCompanies: z.string().optional(),
  graduationYear: z.number().int().min(1950).max(2100).optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

export function SettingsPage() {
  const { user, logout } = useAuth()
  const { isDark, setTheme } = useTheme()
  const profileMutation = useProfileMutation()
  const toast = useToast()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      targetRole: user?.targetRole ?? '',
      targetCompanies: (user?.targetCompanies ?? []).join(', '),
      graduationYear: user?.graduationYear ?? undefined,
    },
  })

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      targetRole: user?.targetRole ?? '',
      targetCompanies: (user?.targetCompanies ?? []).join(', '),
      graduationYear: user?.graduationYear ?? undefined,
    })
  }, [user, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await profileMutation.mutateAsync({
        name: values.name,
        targetRole: values.targetRole || null,
        targetCompanies: values.targetCompanies
          ? values.targetCompanies
              .split(',')
              .map((item) => item.trim())
              .filter(Boolean)
          : [],
        graduationYear: values.graduationYear ? Number(values.graduationYear) : null,
      })
      toast.success('Profile updated')
    } catch (error) {
      toast.error('Could not update profile', error instanceof Error ? error.message : undefined)
    }
  })

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-2xl font-semibold text-ink">Settings</h1>
        <p className="mt-1 text-sm text-ink-soft">Manage your profile and preferences.</p>
      </header>

      <section className="pf-card p-5">
        <h2 className="text-base font-semibold text-ink">Profile</h2>
        <p className="mt-1 text-xs text-ink-faint">Signed in as {user?.email}</p>

        <form onSubmit={onSubmit} noValidate className="mt-4 space-y-4">
          <FormField label="Full name" error={errors.name?.message} required>
            {(props) => <input {...props} {...register('name')} type="text" className="pf-input" />}
          </FormField>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Target role" error={errors.targetRole?.message}>
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

            <FormField label="Graduation year" error={errors.graduationYear?.message}>
              {(props) => (
                <input
                  {...props}
                  {...register('graduationYear')}
                  type="number"
                  className="pf-input"
                  placeholder="2026"
                />
              )}
            </FormField>
          </div>

          <FormField
            label="Target companies"
            hint="Comma separated"
            error={errors.targetCompanies?.message}
          >
            {(props) => (
              <input
                {...props}
                {...register('targetCompanies')}
                type="text"
                className="pf-input"
                placeholder="Google, Amazon, Flipkart"
              />
            )}
          </FormField>

          <div className="flex justify-end">
            <Button type="submit" isLoading={isSubmitting || profileMutation.isPending}>
              Save changes
            </Button>
          </div>
        </form>
      </section>

      <section className="pf-card p-5">
        <h2 className="text-base font-semibold text-ink">Appearance</h2>
        <p className="mt-1 text-xs text-ink-faint">Choose between the light and dark palettes.</p>
        <div className="mt-4 flex gap-2">
          <Button
            variant={isDark ? 'secondary' : 'primary'}
            onClick={() => setTheme('light')}
            leftIcon={<Sun className="h-4 w-4" />}
          >
            Light
          </Button>
          <Button
            variant={isDark ? 'primary' : 'secondary'}
            onClick={() => setTheme('dark')}
            leftIcon={<Moon className="h-4 w-4" />}
          >
            Dark
          </Button>
        </div>
      </section>

      <section className="pf-card p-5">
        <h2 className="text-base font-semibold text-ink">Session</h2>
        <p className="mt-1 text-xs text-ink-faint">Sign out of PrepForge on this device.</p>
        <div className="mt-4">
          <Button variant="danger" onClick={() => void handleLogout()} leftIcon={<LogOut className="h-4 w-4" />}>
            Sign out
          </Button>
        </div>
      </section>
    </div>
  )
}
