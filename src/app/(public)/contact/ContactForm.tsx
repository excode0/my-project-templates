'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Send } from 'lucide-react'

export function ContactForm() {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)

    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      '',
      form.message,
    ].join('\n')

    const mailto = `mailto:hello@korex.com?subject=${encodeURIComponent(
      form.subject || 'Website inquiry'
    )}&body=${encodeURIComponent(body)}`

    window.location.href = mailto
    setTimeout(() => {
      setSending(false)
      setSent(true)
    }, 600)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-orange-200 bg-orange-50/60 px-6 py-16 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="font-display text-2xl font-semibold text-slate-900">
          Terima Kasih!
        </h3>
        <p className="mt-2 max-w-sm text-slate-600">
          Klien email Anda seharusnya terbuka dengan pesan Anda. Kami biasanya membalas dalam 
          satu hari kerja.
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="korex-btn-ghost mt-6 px-6 py-2"
        >
          Kirim pesan lain
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-slate-900">
            Nama Anda
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="korex-input"
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-slate-900">
            Alamat Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="korex-input"
            placeholder="anda@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="block text-sm font-medium text-slate-900">
          Subjek
        </label>
        <input
          id="subject"
          required
          value={form.subject}
          onChange={(event) => setForm({ ...form, subject: event.target.value })}
          className="korex-input"
          placeholder="Bagaimana kami bisa membantu?"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="block text-sm font-medium text-slate-900">
          Pesan
        </label>
        <textarea
          id="message"
          required
          rows={5}
          value={form.message}
          onChange={(event) => setForm({ ...form, message: event.target.value })}
          className="korex-input resize-none"
          placeholder="Ceritakan sedikit tentang proyek Anda..."
        />
      </div>

      <button
        type="submit"
        disabled={sending}
        className="korex-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {sending ? 'Membuka email...' : 'Kirim Pesan'}
      </button>
    </form>
  )
}
