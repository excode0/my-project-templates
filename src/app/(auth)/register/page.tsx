import Link from 'next/link'
import { AuthShell } from '@/components/public/AuthShell'
import { RegisterForm } from './RegisterForm'

export const metadata = {
  title: 'Create Account',
  description: 'Create your KOREX account and start building',
}

export default function RegisterPage() {
  return (
    <AuthShell
      title="Create your account"
      subtitle="Start building beautiful websites with Korex today."
      footer={
        <span>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            Sign in
          </Link>
        </span>
      }
    >
      <RegisterForm />
    </AuthShell>
  )
}
