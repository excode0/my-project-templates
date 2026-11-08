'use client'

import { useSlotValue } from '@/lib/engines/template-engine'

const spacingMap: Record<string, string> = {
  none: '0rem',
  small: '2.5rem',
  medium: '4rem',
  large: '6rem',
  xlarge: '8rem',
}

export default function GenericTemplatePage() {
  const eyebrow = useSlotValue('content.eyebrow', 'KOREX TEMPLATE')
  const title = useSlotValue('content.title', 'Your Brand, Beautifully Presented')
  const subtitle = useSlotValue(
    'content.subtitle',
    'A modern, fully customizable template built for your next project.'
  )
  const description = useSlotValue(
    'content.description',
    'Edit every detail from the visual editor.'
  )
  const ctaText = useSlotValue('hero.ctaText', 'Get Started')
  const ctaLink = useSlotValue('hero.ctaLink', '#features')
  const primary = useSlotValue('colors.primary', '#F97316')
  const background = useSlotValue('colors.background', '#0F1117')
  const text = useSlotValue('colors.text', '#FDFBF7')
  const fontFamily = useSlotValue('typography.fontFamily', 'Inter')
  const spacing = useSlotValue('layout.spacing', 'large')
  const rawFeatures = useSlotValue<unknown>('content.features', [])

  const features = Array.isArray(rawFeatures)
    ? rawFeatures.map((feature) =>
        typeof feature === 'string'
          ? { title: feature, description: '' }
          : {
              title: String((feature as any)?.title ?? ''),
              description: String((feature as any)?.description ?? ''),
            }
      )
    : []

  const sectionPadding = spacingMap[String(spacing)] ?? spacingMap.large

  return (
    <div
      className="min-h-screen"
      style={{ background, color: text, fontFamily: `${fontFamily}, sans-serif` }}
    >
      <section
        className="mx-auto max-w-5xl px-6"
        style={{ paddingTop: sectionPadding, paddingBottom: sectionPadding }}
      >
        <p
          className="text-xs font-semibold uppercase tracking-[0.35em]"
          style={{ color: primary }}
        >
          {eyebrow}
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {title}
        </h1>

        <p className="mt-5 max-w-2xl text-lg opacity-80">{subtitle}</p>

        {description && (
          <div
            className="mt-4 max-w-2xl text-base leading-relaxed opacity-70"
            dangerouslySetInnerHTML={{ __html: description }}
          />
        )}

        <a
          href={ctaLink || '#features'}
          className="mt-8 inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:-translate-y-0.5"
          style={{
            background: `linear-gradient(135deg, ${primary}, ${primary}cc)`,
            boxShadow: `0 18px 45px -18px ${primary}`,
          }}
        >
          {ctaText}
        </a>

        {features.length > 0 && (
          <div id="features" className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <div
                key={`${feature.title}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
              >
                <span
                  className="grid h-9 w-9 place-items-center rounded-lg text-sm font-bold"
                  style={{ background: `${primary}22`, color: primary }}
                >
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                {feature.description && (
                  <p className="mt-2 text-sm opacity-70">{feature.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
