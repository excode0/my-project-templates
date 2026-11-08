'use client'

import { useSlotValue } from '@/lib/engines/template-engine'
import { cn } from '@/lib/utils'

export function Hero() {
  const layout = useSlotValue('hero-layout', 'centered')
  const size = useSlotValue('hero-size', 'large')
  const groomName = useSlotValue('groom-name', 'John Doe')
  const brideName = useSlotValue('bride-name', 'Jane Smith')
  const weddingDate = useSlotValue('wedding-date', '25 Desember 2024')
  const heroImage = useSlotValue('hero-image', '/placeholder-wedding.jpg')
  const gradient = useSlotValue('hero-gradient', 'linear-gradient(135deg, rgba(232, 180, 184, 0.8) 0%, rgba(149, 117, 205, 0.8) 100%)')
  const overlayOpacity = useSlotValue('overlay-opacity', 40)
  const primaryColor = useSlotValue('primary-color', '#E8B4B8')
  const headingFont = useSlotValue('heading-font', 'playfair')
  const buttonStyle = useSlotValue('button-style', 'solid') as string
  const animationType = useSlotValue('animation-type', 'fade')
  const padding = useSlotValue('section-padding', 80)
  const showCountdown = useSlotValue('show-countdown', true)

  const sizeClasses = {
    medium: 'min-h-[60vh]',
    large: 'min-h-[80vh]',
    fullscreen: 'min-h-screen',
  }

  const layoutClasses = {
    centered: 'justify-center items-center text-center',
    'split-screen': 'grid md:grid-cols-2 items-center',
  }

  const buttonStyleClasses = {
    solid: `bg-[${primaryColor}] text-white hover:opacity-90`,
    outline: `border-2 border-[${primaryColor}] text-[${primaryColor}] hover:bg-[${primaryColor}] hover:text-white`,
    gradient: 'bg-gradient-to-r from-pink-400 to-purple-400 text-white',
  }

  return (
    <section
      className={cn(
        'relative flex',
        sizeClasses[size as keyof typeof sizeClasses],
        layoutClasses[layout as keyof typeof layoutClasses],
        `animate-${animationType}`
      )}
      style={{
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        paddingTop: `${padding}px`,
        paddingBottom: `${padding}px`,
      }}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: gradient,
          opacity: overlayOpacity / 100,
        }}
      />

      {/* Content */}
      <div className="relative z-10 px-4 max-w-4xl mx-auto">
        <div className={cn('space-y-6', `font-${headingFont}`)}>
          <p className="text-lg text-white/90 tracking-widest uppercase">
            The Wedding of
          </p>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white">
            {groomName}
            <span className="block text-4xl md:text-6xl my-4">&</span>
            {brideName}
          </h1>

          <p className="text-2xl text-white/90 font-light">
            {weddingDate}
          </p>

          {showCountdown && (
            <div className="pt-8">
              <div className="inline-flex gap-6 text-white">
                <div className="text-center">
                  <div className="text-4xl font-bold">30</div>
                  <div className="text-sm uppercase tracking-wide">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">12</div>
                  <div className="text-sm uppercase tracking-wide">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold">45</div>
                  <div className="text-sm uppercase tracking-wide">Minutes</div>
                </div>
              </div>
            </div>
          )}

          <div className="pt-8">
            <button
              className={cn(
                'px-8 py-4 rounded-lg text-lg font-semibold transition-all duration-300',
                buttonStyleClasses[buttonStyle as keyof typeof buttonStyleClasses]
              )}
              style={{
                backgroundColor: buttonStyle === 'solid' ? primaryColor : undefined,
                borderColor: (buttonStyle === 'outline' || buttonStyle === 'gradient') ? primaryColor : undefined,
              }}
            >
              RSVP Now
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
