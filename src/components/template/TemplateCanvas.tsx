import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { buildTemplateCssVariables } from '@/lib/engines/template-engine/css'
import type { TemplateConfig } from '@/types'

interface TemplateCanvasProps {
  config?: TemplateConfig | null
  children: ReactNode
  className?: string
}

/**
 * Isolated canvas for rendering dynamic templates.
 * Scopes template CSS variables and prevents style bleed between templates
 * and the main KOREX application shell.
 */
export function TemplateCanvas({
  config,
  children,
  className,
}: TemplateCanvasProps) {
  return (
    <div
      className={cn('template-canvas', className)}
      style={buildTemplateCssVariables(config)}
      data-template-canvas=""
    >
      {children}
    </div>
  )
}
