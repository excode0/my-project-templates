'use client';

import { useSlotValue } from '@/lib/engines/template-engine';

export function Footer() {
  const siteTitle = useSlotValue('site.title');
  const github = useSlotValue('social.github');
  const linkedin = useSlotValue('social.linkedin');
  const twitter = useSlotValue('social.twitter');
  const dribbble = useSlotValue('social.dribbble');

  const currentYear = new Date().getFullYear();

  return (
    <footer className="portfolio-footer">
      <div className="footer-content">
        <div className="footer-main">
          <div className="footer-brand">
            <h3 className="brand-name">{siteTitle}</h3>
            <p className="brand-tagline">Creating beautiful digital experiences</p>
          </div>

          <div className="footer-links">
            <div className="footer-section">
              <h4>Navigation</h4>
              <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#skills">Skills</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>

            <div className="footer-section">
              <h4>Connect</h4>
              <ul>
                {github && (
                  <li>
                    <a href={github} target="_blank" rel="noopener noreferrer">
                      GitHub
                    </a>
                  </li>
                )}
                {linkedin && (
                  <li>
                    <a href={linkedin} target="_blank" rel="noopener noreferrer">
                      LinkedIn
                    </a>
                  </li>
                )}
                {twitter && (
                  <li>
                    <a href={twitter} target="_blank" rel="noopener noreferrer">
                      Twitter
                    </a>
                  </li>
                )}
                {dribbble && (
                  <li>
                    <a href={dribbble} target="_blank" rel="noopener noreferrer">
                      Dribbble
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="copyright">
            © {currentYear} {siteTitle}. All rights reserved.
          </p>
          <p className="powered-by">
            Powered by <a href="/" target="_blank">TemplateMKT</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        .portfolio-footer {
          background: #1f2937;
          color: #f9fafb;
          padding: 3rem 1rem 1.5rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .footer-main {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-brand {
          max-width: 400px;
        }

        .brand-name {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--primary-color, #6366f1);
        }

        .brand-tagline {
          font-size: 1rem;
          color: #d1d5db;
          margin: 0;
          line-height: 1.6;
        }

        .footer-links {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }

        .footer-section h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: #f9fafb;
        }

        .footer-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-section li {
          margin-bottom: 0.5rem;
        }

        .footer-section a {
          color: #d1d5db;
          text-decoration: none;
          transition: color 0.3s;
          font-size: 0.875rem;
        }

        .footer-section a:hover {
          color: var(--primary-color, #6366f1);
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          font-size: 0.875rem;
          color: #9ca3af;
        }

        .copyright,
        .powered-by {
          margin: 0;
        }

        .powered-by a {
          color: var(--primary-color, #6366f1);
          text-decoration: none;
          font-weight: 600;
        }

        .powered-by a:hover {
          text-decoration: underline;
        }

        @media (max-width: 768px) {
          .footer-main {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-links {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 0.5rem;
            text-align: center;
          }
        }
      `}</style>
    </footer>
  );
}
