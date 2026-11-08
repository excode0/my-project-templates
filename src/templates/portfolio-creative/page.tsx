'use client';

import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { SkillsSection } from './components/sections/SkillsSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { ContactSection } from './components/sections/ContactSection';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';

export default function PortfolioCreativePage() {
  return (
    <div className="portfolio-creative">
      <Navigation />
      <main>
        <HeroSection />
        <AboutSection />
        <SkillsSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
      
      <style jsx global>{`
        .portfolio-creative {
          font-family: var(--font-family, 'Inter', sans-serif);
          color: var(--text-color, #1f2937);
          background: var(--background-color, #ffffff);
        }
        
        .portfolio-creative * {
          box-sizing: border-box;
        }
        
        .portfolio-creative section {
          padding: var(--section-spacing, 5rem) 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        @media (max-width: 768px) {
          .portfolio-creative section {
            padding: 3rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}
