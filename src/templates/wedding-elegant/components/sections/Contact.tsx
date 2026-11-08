'use client'

import { useSlotValue } from '@/lib/engines/template-engine'
import { cn } from '@/lib/utils'

export function Contact() {
  const contactTitle = useSlotValue('contact-title', 'Lokasi & Waktu')
  const venue = useSlotValue('venue', 'Grand Ballroom Hotel XYZ')
  const address = useSlotValue('address', 'Jl. Merdeka No. 123, Jakarta')
  const ceremonyTime = useSlotValue('ceremony-time', '10:00 WIB')
  const receptionTime = useSlotValue('reception-time', '12:00 WIB')
  const mapUrl = useSlotValue('map-url', 'https://maps.google.com')
  const showMap = useSlotValue('show-map', true)
  const headingFont = useSlotValue('heading-font', 'playfair')
  const primaryColor = useSlotValue('primary-color', '#E8B4B8')
  const buttonStyle = useSlotValue('button-style', 'solid') as string
  const padding = useSlotValue('section-padding', 80)
  const borderRadius = useSlotValue('border-radius', 12)

  const buttonStyleClasses = {
    solid: 'text-white hover:opacity-90',
    outline: 'border-2 hover:text-white',
    gradient: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white',
  }

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
            {contactTitle}
          </h2>
          <div className="w-24 h-1 mx-auto" style={{ backgroundColor: primaryColor }} />
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Event Details */}
          <div className="space-y-8">
            <div
              className="p-8 shadow-lg"
              style={{
                borderRadius: `${borderRadius}px`,
                borderTop: `4px solid ${primaryColor}`,
              }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                Akad Nikah
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">{venue}</p>
                    <p className="text-sm">{address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕐</span>
                  <p>{ceremonyTime}</p>
                </div>
              </div>
            </div>

            <div
              className="p-8 shadow-lg"
              style={{
                borderRadius: `${borderRadius}px`,
                borderTop: `4px solid ${primaryColor}`,
              }}
            >
              <h3 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
                Resepsi
              </h3>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-semibold">{venue}</p>
                    <p className="text-sm">{address}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🕐</span>
                  <p>{receptionTime}</p>
                </div>
              </div>
            </div>

            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                'block text-center px-8 py-4 rounded-lg font-semibold transition-all duration-300',
                buttonStyleClasses[buttonStyle as keyof typeof buttonStyleClasses]
              )}
              style={{
                backgroundColor: buttonStyle === 'solid' ? primaryColor : 'transparent',
                borderColor: buttonStyle === 'outline' ? primaryColor : 'transparent',
                borderWidth: buttonStyle === 'outline' ? '2px' : '0',
              }}
            >
              Lihat di Google Maps
            </a>
          </div>

          {/* Map */}
          {showMap && (
            <div>
              <div
                className="w-full h-[500px] overflow-hidden shadow-lg"
                style={{ borderRadius: `${borderRadius}px` }}
              >
                <iframe
                  src={mapUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
