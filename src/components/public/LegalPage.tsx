interface LegalPageProps {
  title: string
  updated: string
  children: React.ReactNode
}

export function LegalPage({ title, updated, children }: LegalPageProps) {
  return (
    <div className="korex-section py-16">
      <div className="mx-auto max-w-3xl">
        <span className="korex-eyebrow">Legal</span>
        <h1 className="korex-h1 mt-6">{title}</h1>
        <p className="mt-3 text-sm text-slate-600">Last updated {updated}</p>
        <div className="mt-10 space-y-8">{children}</div>
      </div>
    </div>
  )
}

export function LegalSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
      <h2 className="korex-h3">{title}</h2>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-slate-600">
        {children}
      </div>
    </section>
  )
}
