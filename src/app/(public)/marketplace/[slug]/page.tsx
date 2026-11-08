import { notFound } from 'next/navigation';
import { templateRepository, reviewRepository } from '@/lib/database';
import { TemplateDetailClient } from './TemplateDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  
  const template = await templateRepository.findBySlug(resolvedParams.slug);

  if (!template) {
    return {
      title: 'Template Not Found',
    };
  }

  return {
    title: `${template.name} - Template Marketplace`,
    description: template.description || `Purchase ${template.name} template`,
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;

  // Fetch template details with stats
  const template = await templateRepository.findBySlugWithDetails(resolvedParams.slug);

  if (!template) {
    notFound();
  }

  // Fetch reviews
  const reviews = await reviewRepository.findByTemplateId(template.id, 10);

  // Fetch related templates (same category)
  const relatedTemplates = await templateRepository.findRelated(
    template.slug,
    template.category,
    3
  );

  return (
    <TemplateDetailClient
      template={template}
      reviews={reviews}
      relatedTemplates={relatedTemplates}
    />
  );
}
