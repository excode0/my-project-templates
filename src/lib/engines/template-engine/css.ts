import type { CSSProperties } from 'react'
import type { TemplateConfig } from '@/types'

const spacingMap: Record<string, string> = {
  none: '0rem',
  small: '2rem',
  medium: '3rem',
  large: '5rem',
  xlarge: '7rem',
}

/**
 * Convert template config slots into CSS custom properties.
 * These variables are scoped to the template canvas so dynamic templates
 * never leak styles into the marketplace/dashboard UI (and vice versa).
 */
export function buildTemplateCssVariables(
  config?: TemplateConfig | null
): CSSProperties {
  const slots = config?.slots ?? {}
  const vars: Record<string, string> = {}

  const set = (name: string, value: unknown) => {
    if (value !== undefined && value !== null && value !== '') {
      vars[name] = String(value)
    }
  }

  set('--primary-color', slots['colors.primary'] ?? slots['primary-color'])
  set(
    '--secondary-color',
    slots['colors.secondary'] ?? slots['secondary-color']
  )
  set(
    '--accent-color',
    slots['colors.accent'] ?? slots['accent-color']
  )
  set(
    '--background-color',
    slots['colors.background'] ?? slots['background-color']
  )
  set('--text-color', slots['colors.text'] ?? slots['text-color'])
  set(
    '--font-family',
    slots['typography.fontFamily'] ?? slots['heading-font']
  )

  const spacing = slots['layout.spacing'] ?? slots['section-spacing']
  if (spacing !== undefined) {
    vars['--section-spacing'] =
      spacingMap[String(spacing)] ?? String(spacing)
  }

  return vars as CSSProperties
}
