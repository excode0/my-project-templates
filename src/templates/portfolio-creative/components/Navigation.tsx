'use client';

import { useState } from 'react';
import { useSlotValue } from '@/lib/engines/template-engine';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const siteTitle = useSlotValue('site.title');

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#about', label: 'About' },
    { href: '#projects', label: 'Projects' },
    { href: '#contact', label: 'Contact' },
  ];

  return (
    <nav className="portfolio-nav">
      <div className="container">
        <div className="nav-content">
          <a href="#home" className="logo">
            {siteTitle}
          </a>

          {/* Desktop Menu */}
          <ul className="nav-links desktop">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            className="mobile-menu-btn"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <ul className="nav-links mobile">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} onClick={() => setIsOpen(false)}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .portfolio-nav {
          position: sticky;
          top: 0;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          z-index: 100;
          padding: 1rem 0;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .nav-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--primary-color, #6366f1);
          text-decoration: none;
          transition: opacity 0.3s;
        }

        .logo:hover {
          opacity: 0.8;
        }

        .nav-links {
          list-style: none;
          margin: 0;
          padding: 0;
          display: flex;
          gap: 2rem;
        }

        .nav-links.desktop {
          display: flex;
        }

        .nav-links.mobile {
          display: none;
        }

        .nav-links a {
          color: var(--text-color, #1f2937);
          text-decoration: none;
          font-weight: 500;
          transition: color 0.3s;
        }

        .nav-links a:hover {
          color: var(--primary-color, #6366f1);
        }

        .mobile-menu-btn {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }

        .mobile-menu-btn span {
          width: 24px;
          height: 2px;
          background: var(--text-color, #1f2937);
          transition: all 0.3s;
        }

        @media (max-width: 768px) {
          .nav-links.desktop {
            display: none;
          }

          .nav-links.mobile {
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 1rem 0;
            margin-top: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
          }

          .mobile-menu-btn {
            display: flex;
          }
        }
      `}</style>
    </nav>
  );
}
