'use client'

import { Hero } from './components/sections/Hero'
import { Story } from './components/sections/Story'
import { Gallery } from './components/sections/Gallery'
import { Contact } from './components/sections/Contact'
import type { TemplateConfig } from '@/types'

export interface WeddingElegantPageProps {
  config: TemplateConfig
  instanceId: string
  isPreview?: boolean
}

export default function WeddingElegantPage({
  config,
  instanceId,
  isPreview = false,
}: WeddingElegantPageProps) {
  return (
    <div className="wedding-elegant-page">
      <Hero />
      <Story />
      <Gallery />
      <Contact />

      {isPreview && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          Preview Mode
        </div>
      )}
    </div>
  )
}
