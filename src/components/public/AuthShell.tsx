import { Check, Sparkles } from 'lucide-react'
import { Brand } from './Brand'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
  footer?: React.ReactNode
}

const highlights = [
  'Fully customizable templates',
  'Instant live preview editor',
  'Custom domain & SSL included',
  'Lifetime updates and support',
]

export function AuthShell({ title, subtitle, children, footer }: AuthShellProps) {
  return (
    <div className="relative grid min-h-screen bg-gradient-to-br from-white via-orange-50/30 to-white lg:grid-cols-2">
      {/* Left Side - Marketing */}
      <aside className="relative hidden overflow-hidden border-r border-slate-200 bg-gradient-to-br from-orange-50 to-white p-12 lg:flex lg:flex-col lg:justify-between">
        {/* Decorative Elements */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-1/4 h-96 w-96 rounded-full bg-orange-200/30 blur-3xl" />
          <div className="absolute -left-20 bottom-1/4 h-64 w-64 rounded-full bg-orange-100/40 blur-3xl" />
        </div>

        <div className="relative">
          <Brand />
        </div>

        <div className="relative max-w-md">
          <span className="korex-eyebrow">
            <Sparkles className="h-3.5 w-3.5" />
            Premium Templates
          </span>
          
          <h2 className="mt-6 font-display text-3xl font-semibold leading-tight text-slate-900">
            Launch a beautiful website with{' '}
            <span className="text-gradient-fire">KOREX</span>
          </h2>
          
          <ul className="mt-8 space-y-4">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm text-slate-700">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-orange-100 text-orange-600">
                  <Check className="h-4 w-4" strokeWidth={2.5} />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-slate-600">
          © {new Date().getFullYear()} KOREX. All rights reserved.
        </p>
      </aside>

      {/* Right Side - Form */}
      <div className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <h1 className="font-display text-3xl font-semibold text-slate-900">{title}</h1>
          <p className="mt-2 text-slate-600">{subtitle}</p>
          <div className="mt-8">{children}</div>
          {footer && <div className="mt-6 text-sm text-slate-600">{footer}</div>}
          <p className="mt-10 text-xs text-slate-500 lg:hidden">
            © {new Date().getFullYear()} KOREX. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  )
}
