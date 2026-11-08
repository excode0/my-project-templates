'use client';

import { useSlotValue } from '@/lib/engines/template-engine';
import Image from 'next/image';

export function ProjectsSection() {
  const headline = useSlotValue('projects.headline');
  const projects = useSlotValue('projects.items');
  const layout = useSlotValue('projects.layout');

  return (
    <section id="projects" className="projects-section">
      <h2 className="section-title">{headline}</h2>
      
      <div className={`projects-grid layout-${layout}`}>
        {Array.isArray(projects) && projects.map((project: any, index: number) => (
          <a 
            key={index} 
            href={project.link} 
            className="project-card"
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="project-image">
              {project.image && (
                <Image
                  src={project.image}
                  alt={project.title}
                  width={600}
                  height={400}
                  className="image"
                />
              )}
              <div className="project-overlay">
                <span className="view-project">View Project →</span>
              </div>
            </div>
            <div className="project-info">
              <div className="project-category">{project.category}</div>
              <h3 className="project-title">{project.title}</h3>
              <p className="project-description">{project.description}</p>
              {project.tags && (
                <div className="project-tags">
                  {project.tags.split(',').map((tag: string, i: number) => (
                    <span key={i} className="tag">{tag.trim()}</span>
                  ))}
                </div>
              )}
            </div>
          </a>
        ))}
      </div>

      <style jsx>{`
        .projects-section {
          background: var(--background-color, #ffffff);
        }

        .section-title {
          font-size: 2.5rem;
          font-weight: 700;
          text-align: center;
          margin: 0 0 3rem 0;
          color: var(--text-color, #1f2937);
        }

        .projects-grid {
          display: grid;
          gap: 2rem;
        }

        .layout-grid-2 {
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }

        .layout-grid-3 {
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        }

        .layout-masonry {
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          grid-auto-rows: auto;
        }

        .project-card {
          background: white;
          border-radius: 1rem;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          transition: all 0.3s;
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .project-card:hover {
          transform: translateY(-10px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .project-image {
          position: relative;
          overflow: hidden;
          aspect-ratio: 16 / 10;
          background: #f3f4f6;
        }

        .image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .project-card:hover .image {
          transform: scale(1.05);
        }

        .project-overlay {
          position: absolute;
          inset: 0;
          background: rgba(99, 102, 241, 0.9);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .project-card:hover .project-overlay {
          opacity: 1;
        }

        .view-project {
          color: white;
          font-weight: 600;
          font-size: 1.125rem;
        }

        .project-info {
          padding: 1.5rem;
        }

        .project-category {
          color: var(--primary-color, #6366f1);
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .project-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0 0 0.5rem 0;
          color: var(--text-color, #1f2937);
        }

        .project-description {
          color: var(--text-color, #1f2937);
          opacity: 0.7;
          font-size: 1rem;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .project-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }

        .tag {
          padding: 0.25rem 0.75rem;
          background: #f3f4f6;
          border-radius: 0.25rem;
          font-size: 0.875rem;
          color: var(--text-color, #1f2937);
        }

        @media (max-width: 768px) {
          .section-title {
            font-size: 2rem;
          }

          .projects-grid {
            grid-template-columns: 1fr !important;
          }

          .project-title {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </section>
  );
}
