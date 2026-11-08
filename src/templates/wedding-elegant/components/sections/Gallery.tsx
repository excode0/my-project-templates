'use client'

import { useSlotValue } from '@/lib/engines/template-engine'
import { cn } from '@/lib/utils'

export function Gallery() {
  const galleryTitle = useSlotValue('gallery-title', 'Our Memories')
  const galleryImages = useSlotValue<string[]>('gallery-images', [
    '/placeholder-1.jpg',
    '/placeholder-2.jpg',
    '/placeholder-3.jpg',
    '/placeholder-4.jpg',
    '/placeholder-5.jpg',
    '/placeholder-6.jpg',
  ])
  const galleryColumns = useSlotValue('gallery-columns', 3)
  const headingFont = useSlotValue('heading-font', 'playfair')
  const primaryColor = useSlotValue('primary-color', '#E8B4B8')
  const padding = useSlotValue('section-padding', 80)
  const borderRadius = useSlotValue('border-radius', 12)

  const columnClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section
      className="bg-gray-50"
      style={{
        paddingTop: `${padding}px`,
        paddingBottom: `${padding}px`,
      }}
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2
            className={cn('text-4xl md:text-5xl font-bold mb-4', `font-${headingFont}`)}
            style={{ color: primaryColor }}
          >
            {galleryTitle}
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: primaryColor }} />
        </div>

        <div
          className={cn(
            'grid gap-6',
            columnClasses[galleryColumns as keyof typeof columnClasses]
          )}
        >
          {galleryImages.map((image, index) => (
            <div
              key={index}
              className="group relative overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
              style={{ borderRadius: `${borderRadius}px` }}
            >
              <img
                src={image}
                alt={`Gallery ${index + 1}`}
                className="w-full h-[300px] object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>

        {galleryImages.length === 0 && (
          <div className="text-center text-gray-500 py-20">
            <p>No photos yet. Add photos to your gallery.</p>
          </div>
        )}
      </div>
    </section>
  )
}
