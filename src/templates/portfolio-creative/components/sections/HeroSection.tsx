'use client';

import { useSlotValue } from '@/lib/engines/template-engine';
import Image from 'next/image';

export function HeroSection() {
  const headline = useSlotValue('hero.headline');
  const subheadline = useSlotValue('hero.subheadline');
  const description = useSlotValue('hero.description');
  const ctaText = useSlotValue('hero.ctaText');
  const ctaLink = useSlotValue('hero.ctaLink');
  const heroImage = useSlotValue('hero.image');
  const layout = useSlotValue('hero.layout');

  return (
    <section id="home" className={`hero-section layout-${layout}`}>
      <div className="hero-content">
        <div className="text-content">
          <h1 className="headline">{headline}</h1>
          <h2 className="subheadline">{subheadline}</h2>
          <div 
            className="description" 
            dangerouslySetInnerHTML={{ __html: description }}
          />
          <a href={ctaLink} className="cta-button">
            {ctaText}
          </a>
        </div>

        {heroImage && (
          <div className="image-content">
            <div className="image-wrapper">
              <Image
                src={heroImage}
                alt={headline}
                width={600}
                height={600}
                className="hero-image"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .hero-section {
          min-height: 80vh;
          display: flex;
          align-items: center;
          padding: 4rem 1rem;
        }

        .hero-content {
          display: grid;
          gap: 3rem;
          align-items: center;
          width: 100%;
        }

        .layout-centered .hero-content {
          grid-template-columns: 1fr;
          text-align: center;
          max-width: 800px;
          margin: 0 auto;
        }

        .layout-left-right .hero-content {
          grid-template-columns: 1fr 1fr;
        }

        .layout-full-screen .hero-content {
          grid-template-columns: 1fr;
          min-height: 100vh;
          text-align: center;
        }

        .headline {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.2;
          margin: 0 0 1rem 0;
          color: var(--text-color, #1f2937);
        }

        .subheadline {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--primary-color, #6366f1);
          margin: 0 0 1.5rem 0;
        }

        .description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--text-color, #1f2937);
          opacity: 0.8;
          margin-bottom: 2rem;
        }

        .cta-button {
          display: inline-block;
          padding: 1rem 2rem;
          background: var(--primary-color, #6366f1);
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .cta-button:hover {
          background: var(--secondary-color, #8b5cf6);
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(99, 102, 241, 0.3);
        }

        .image-wrapper {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .hero-image {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 768px) {
          .hero-content {
            grid-template-columns: 1fr !important;
            text-align: center;
          }

          .headline {
            font-size: 2.5rem;
          }

          .subheadline {
            font-size: 1.25rem;
          }

          .description {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
