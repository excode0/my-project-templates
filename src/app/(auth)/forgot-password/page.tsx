import Link from 'next/link'
import { AuthShell } from '@/components/public/AuthShell'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export const metadata = {
  title: 'Reset Password',
  description: 'Request a password reset link for your KOREX account',
}

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you instructions to reset it."
      footer={
        <span>
          Remembered it?{' '}
          <Link href="/login" className="font-semibold text-orange-600 hover:text-orange-700">
            Back to sign in
          </Link>
        </span>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  )
}
