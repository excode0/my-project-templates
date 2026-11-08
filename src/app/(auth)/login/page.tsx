import Link from 'next/link'
import { AuthShell } from '@/components/public/AuthShell'
import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'Sign In',
  description: 'Sign in to your KOREX account',
}

export default function LoginPage() {
  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to continue building with Korex."
      footer={
        <span>
          Don&apos;t have an account?{' '}
          <Link href="/register" className="font-semibold text-orange-600 hover:text-orange-700">
            Create one
          </Link>
        </span>
      }
    >
      <LoginForm />
    </AuthShell>
  )
}
