'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Palette, ShoppingBag } from 'lucide-react'

export function RegisterForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user' as 'user' | 'contributor',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          role: formData.role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registration failed')
        setLoading(false)
        return
      }

      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (signInResult?.error) {
        setError('Account created but login failed. Please sign in manually.')
        setLoading(false)
        return
      }

      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error('Registration error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  const roles = [
    {
      value: 'user' as const,
      title: 'Customer',
      description: 'Buy and customize templates',
      Icon: ShoppingBag,
    },
    {
      value: 'contributor' as const,
      title: 'Contributor',
      description: 'Create and sell templates',
      Icon: Palette,
    },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-900">
          Email address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          disabled={loading}
          className="korex-input"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-slate-900">
          Password
        </label>
        <input
          id="password"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={6}
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          disabled={loading}
          className="korex-input"
        />
        <p className="text-xs text-slate-500">At least 6 characters</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-900">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          required
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          disabled={loading}
          className="korex-input"
        />
      </div>

      <div className="space-y-2">
        <span className="block text-sm font-medium text-slate-900">Account type</span>
        <div className="grid gap-3 sm:grid-cols-2">
          {roles.map(({ value, title, description, Icon }) => {
            const selected = formData.role === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFormData({ ...formData, role: value })}
                disabled={loading}
                className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-orange-500 bg-orange-50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
                    selected ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-slate-900">{title}</span>
                  <span className="mt-0.5 block text-xs text-slate-600">
                    {description}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="korex-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-xs text-slate-500">
        By creating an account you agree to our{' '}
        <a href="/terms" className="font-medium text-orange-600 hover:underline">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="font-medium text-orange-600 hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  )
}
