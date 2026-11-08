'use client';

import { useSlotValue } from '@/lib/engines/template-engine';

export function ContactSection() {
  const headline = useSlotValue('contact.headline');
  const description = useSlotValue('contact.description');
  const email = useSlotValue('contact.email');
  const phone = useSlotValue('contact.phone');
  
  const github = useSlotValue('social.github');
  const linkedin = useSlotValue('social.linkedin');
  const twitter = useSlotValue('social.twitter');
  const dribbble = useSlotValue('social.dribbble');

  return (
    <section id="contact" className="contact-section">
      <div className="contact-content">
        <h2 className="section-title">{headline}</h2>
        <div 
          className="description" 
          dangerouslySetInnerHTML={{ __html: description }}
        />

        <div className="contact-info">
          {email && (
            <a href={`mailto:${email}`} className="contact-item">
              <span className="icon">📧</span>
              <span className="text">{email}</span>
            </a>
          )}
          {phone && (
            <a href={`tel:${phone}`} className="contact-item">
              <span className="icon">📞</span>
              <span className="text">{phone}</span>
            </a>
          )}
        </div>

        <div className="social-links">
          {github && (
            <a href={github} target="_blank" rel="noopener noreferrer" className="social-link">
              GitHub
            </a>
          )}
          {linkedin && (
            <a href={linkedin} target="_blank" rel="noopener noreferrer" className="social-link">
              LinkedIn
            </a>
          )}
          {twitter && (
            <a href={twitter} target="_blank" rel="noopener noreferrer" className="social-link">
              Twitter
            </a>
          )}
          {dribbble && (
            <a href={dribbble} target="_blank" rel="noopener noreferrer" className="social-link">
              Dribbble
            </a>
          )}
        </div>
      </div>

      <style jsx>{`
        .contact-section {
          background: #f9fafb;
        }

        .contact-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
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
          margin-bottom: 3rem;
        }

        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 3rem;
        }

        .contact-item {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 1rem;
          background: white;
          border-radius: 0.5rem;
          text-decoration: none;
          color: var(--text-color, #1f2937);
          transition: all 0.3s;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        .contact-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          color: var(--primary-color, #6366f1);
        }

        .icon {
          font-size: 1.5rem;
        }

        .text {
          font-size: 1.125rem;
          font-weight: 500;
        }

        .social-links {
          display: flex;
          justify-content: center;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .social-link {
          padding: 0.75rem 1.5rem;
          background: var(--primary-color, #6366f1);
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.3s;
        }

        .social-link:hover {
          background: var(--secondary-color, #8b5cf6);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .description {
            font-size: 1rem;
          }

          .text {
            font-size: 1rem;
          }

          .social-links {
            flex-direction: column;
          }

          .social-link {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
