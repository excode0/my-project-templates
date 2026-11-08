/**
 * Portfolio Creative Template Types
 */

export interface SkillItem {
  name: string;
  level: number;
  icon: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  image: string;
  category: string;
  link: string;
  tags: string;
}

export interface PortfolioConfig {
  site: {
    title: string;
    tagline: string;
  };
  hero: {
    headline: string;
    subheadline: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    image: string;
    layout: 'centered' | 'left-right' | 'full-screen';
  };
  about: {
    headline: string;
    description: string;
    image: string;
  };
  skills: {
    headline: string;
    items: SkillItem[];
  };
  projects: {
    headline: string;
    items: ProjectItem[];
    layout: 'grid-2' | 'grid-3' | 'masonry';
  };
  contact: {
    headline: string;
    description: string;
    email: string;
    phone: string;
  };
  social: {
    github: string;
    linkedin: string;
    twitter: string;
    dribbble: string;
  };
  colors: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  typography: {
    fontFamily: string;
  };
  layout: {
    spacing: 'small' | 'medium' | 'large';
  };
  animation: {
    enabled: boolean;
  };
}
