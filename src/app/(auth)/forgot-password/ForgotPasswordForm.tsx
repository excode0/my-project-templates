'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2 } from 'lucide-react'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center rounded-2xl border border-fire-500/30 bg-fire-500/[0.06] px-6 py-12 text-center">
        <span className="grid h-12 w-12 place-items-center rounded-full bg-fire-500/15 text-orange-600">
          <CheckCircle2 className="h-6 w-6" />
        </span>
        <h2 className="korex-h3 mt-4">Check your inbox</h2>
        <p className="mt-2 max-w-sm text-sm text-slate-600">
          If an account exists for <span className="font-medium text-slate-900">{email}</span>, you
          will receive password reset instructions shortly.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email address
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={loading}
          className="korex-input"
          placeholder="you@example.com"
        />
      </div>

      <button type="submit" disabled={loading} className="korex-btn-primary w-full">
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Sending...' : 'Send reset instructions'}
      </button>
    </form>
  )
}
