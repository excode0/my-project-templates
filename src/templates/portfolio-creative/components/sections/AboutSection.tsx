'use client';

import { useSlotValue } from '@/lib/engines/template-engine';
import Image from 'next/image';

export function AboutSection() {
  const headline = useSlotValue('about.headline');
  const description = useSlotValue('about.description');
  const aboutImage = useSlotValue('about.image');

  return (
    <section id="about" className="about-section">
      <div className="about-content">
        <div className="text-content">
          <h2 className="section-title">{headline}</h2>
          <div 
            className="description" 
            dangerouslySetInnerHTML={{ __html: description }}
          />
        </div>

        {aboutImage && (
          <div className="image-content">
            <div className="image-wrapper">
              <Image
                src={aboutImage}
                alt={headline}
                width={500}
                height={500}
                className="about-image"
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .about-section {
          background: var(--background-color, #ffffff);
        }

        .about-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          color: var(--text-color, #1f2937);
        }

        .description {
          font-size: 1.125rem;
          line-height: 1.8;
          color: var(--text-color, #1f2937);
          opacity: 0.8;
        }

        .image-wrapper {
          position: relative;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .about-image {
          width: 100%;
          height: auto;
          display: block;
        }

        @media (max-width: 768px) {
          .about-content {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .description {
            font-size: 1rem;
          }
        }
      `}</style>
    </section>
  );
}
