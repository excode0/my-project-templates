import type { ReactNode } from 'react'
import type { TemplateConfig, TemplateManifest } from '@/types'

export interface WeddingLayoutProps {
  children: ReactNode
  config: TemplateConfig
  manifest: TemplateManifest
}

export default function WeddingElegantLayout({
  children,
  config,
  manifest,
}: WeddingLayoutProps) {
  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Cormorant:wght@400;600;700&family=Montserrat:wght@300;400;600&display=swap"
        rel="stylesheet"
      />
      <div 
        className="wedding-elegant-template font-['Montserrat',sans-serif]" 
        data-template={manifest.id}
      >
        {children}
      </div>
    </>
  )
}
