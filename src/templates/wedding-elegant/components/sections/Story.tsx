'use client'

import { useSlotValue } from '@/lib/engines/template-engine'
import { cn } from '@/lib/utils'

export function Story() {
  const groomName = useSlotValue('groom-name', 'John Doe')
  const brideName = useSlotValue('bride-name', 'Jane Smith')
  const storyTitle = useSlotValue('story-title', 'Our Love Story')
  const storyContent = useSlotValue('story-content', 'Kami bertemu pada tahun 2020 di kampus...')
  const storyImage = useSlotValue('story-image', '/placeholder-story.jpg')
  const headingFont = useSlotValue('heading-font', 'playfair')
  const primaryColor = useSlotValue('primary-color', '#E8B4B8')
  const padding = useSlotValue('section-padding', 80)
  const borderRadius = useSlotValue('border-radius', 12)

  return (
    <section
      className="bg-white"
      style={{
        paddingTop: `${padding}px`,
        paddingBottom: `${padding}px`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            className={cn('text-4xl md:text-5xl font-bold mb-4', `font-${headingFont}`)}
            style={{ color: primaryColor }}
          >
            {storyTitle}
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: primaryColor }} />
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                {storyContent}
              </p>
            </div>
            
            <div className="flex items-center gap-4 pt-4">
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  ♥
                </div>
                <p className="mt-2 text-sm font-medium">{groomName}</p>
              </div>
              
              <div className="flex-1 h-0.5 bg-gray-300" />
              
              <div className="text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: primaryColor }}
                >
                  ♥
                </div>
                <p className="mt-2 text-sm font-medium">{brideName}</p>
              </div>
            </div>
          </div>

          <div>
            <div
              className="overflow-hidden shadow-xl"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <img
                src={storyImage}
                alt="Our Story"
                className="w-full h-[400px] object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
