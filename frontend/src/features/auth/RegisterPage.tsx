import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getErrorMessage } from '../../lib/api-client'
import { AuthCard } from './AuthCard'
import { useMe, useRegister } from './hooks'
import { safeRedirect } from './redirect'

// Matches the backend's RegisterRequestDto validation
const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(30, 'Name must be 30 characters or less'),
  email: z.email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const navigate = useNavigate()
  const { data: user } = useMe()
  const registerMutation = useRegister()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={redirectTo} replace />

  const onSubmit = (values: FormValues) =>
    registerMutation.mutate(values, { onSuccess: () => navigate(redirectTo, { replace: true }) })

  return (
    <AuthCard title="Create account">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Name"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {registerMutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getErrorMessage(registerMutation.error, 'Registration failed')}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={registerMutation.isPending}>
          Create account
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        Already have an account?{' '}
        <Link
          to={`/login?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-indigo-600 hover:underline"
        >
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
