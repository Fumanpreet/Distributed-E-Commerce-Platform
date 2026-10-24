import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { getErrorMessage } from '../../lib/api-client'
import { AuthCard } from './AuthCard'
import { useLogin, useMe } from './hooks'
import { safeRedirect } from './redirect'

const schema = z.object({
  email: z.email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const navigate = useNavigate()
  const { data: user } = useMe()
  const loginMutation = useLogin()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  if (user) return <Navigate to={redirectTo} replace />

  const onSubmit = (values: FormValues) =>
    loginMutation.mutate(values, { onSuccess: () => navigate(redirectTo, { replace: true }) })

  return (
    <AuthCard title="Sign in">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        {loginMutation.isError && (
          <p role="alert" className="text-sm text-red-600">
            {getErrorMessage(loginMutation.error, 'Login failed')}
          </p>
        )}
        <Button type="submit" className="w-full" isLoading={loginMutation.isPending}>
          Sign in
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-600">
        New here?{' '}
        <Link
          to={`/register?redirect=${encodeURIComponent(redirectTo)}`}
          className="font-medium text-indigo-600 hover:underline"
        >
          Create an account
        </Link>
      </p>
    </AuthCard>
  )
}
