'use client';

import { useSlotValue } from '@/lib/engines/template-engine';

export function SkillsSection() {
  const headline = useSlotValue('skills.headline');
  const skills = useSlotValue('skills.items');

  return (
    <section id="skills" className="skills-section">
      <h2 className="section-title">{headline}</h2>
      
      <div className="skills-grid">
        {Array.isArray(skills) && skills.map((skill: any, index: number) => (
          <div key={index} className="skill-card">
            <div className="skill-icon">{skill.icon}</div>
            <h3 className="skill-name">{skill.name}</h3>
            <div className="skill-bar">
              <div 
                className="skill-progress" 
                style={{ width: `${skill.level}%` }}
              />
            </div>
            <div className="skill-level">{skill.level}%</div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .skills-section {
          background: #f9fafb;
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 3rem 0;
          color: var(--text-color, #1f2937);
        }

        .skills-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
        }

        .skill-card {
          background: white;
          padding: 2rem;
          border-radius: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
        }

        .skill-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }

        .skill-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .skill-name {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 1rem 0;
          color: var(--text-color, #1f2937);
        }

        .skill-bar {
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .skill-progress {
          height: 100%;
          background: linear-gradient(90deg, var(--primary-color, #6366f1), var(--secondary-color, #8b5cf6));
          transition: width 1s ease;
        }

        .skill-level {
          text-align: right;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--primary-color, #6366f1);
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .skills-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
