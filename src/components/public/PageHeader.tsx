import { cn } from '@/lib/utils'

interface PageHeaderProps {
  eyebrow?: string
  title: React.ReactNode
  description?: React.ReactNode
  align?: 'left' | 'center'
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  children,
}: PageHeaderProps) {
  return (
    <section className={cn('relative overflow-hidden', className)}>
      <div className="pointer-events-none absolute inset-0 bg-radial-fire" />
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
      <div
        className={cn(
          'korex-section relative py-20 sm:py-24',
          align === 'center' ? 'text-center' : 'text-left'
        )}
      >
        <div className={cn(align === 'center' && 'mx-auto max-w-3xl')}>
          {eyebrow && <span className="korex-eyebrow">{eyebrow}</span>}
          <h1 className="korex-h1 mt-6">{title}</h1>
          {description && (
            <p className="mt-6 text-lg leading-relaxed text-slate-600">
              {description}
            </p>
          )}
          {children && <div className="mt-8">{children}</div>}
        </div>
      </div>
    </section>
  )
}
