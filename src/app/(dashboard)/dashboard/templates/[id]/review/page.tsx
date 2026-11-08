import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth/guards';
import { TemplateReviewClient } from './TemplateReviewClient';
import { PageShell } from '@/components/dashboard/ui';

export default async function TemplateReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin('/dashboard/templates');

  const resolvedParams = await params;
  const templateId = resolvedParams.id;

  const template = await db`
    SELECT
      t.id,
      t.name,
      t.slug,
      t.description,
      t.category,
      t.preview_image,
      t.demo_url,
      t.status,
      t.price,
      t.is_featured,
      t.created_at,
      t.updated_at,
      u.email as owner_email,
      u.username as owner_username,
      COALESCE(
        (SELECT COUNT(*) FROM template_instances ti WHERE ti.template_id = t.id),
        0
      )::int as instance_count
    FROM templates t
    JOIN users u ON t.contributor_id = u.id
    WHERE t.id = ${templateId}
    LIMIT 1
  `.then((rows: any[]) => rows[0]);

  if (!template) {
    redirect('/dashboard/templates' as any);
  }

  return (
    <PageShell>
      <TemplateReviewClient
        template={{
        id: template.id,
        name: template.name,
        slug: template.slug,
        description: template.description,
        category: template.category,
        thumbnailUrl: template.preview_image,
        demoUrl: template.demo_url,
        status: template.status,
        price: Number(template.price),
        downloads: 0,
        isFeatured: template.is_featured,
        createdAt: template.created_at.toISOString(),
        updatedAt: template.updated_at.toISOString(),
        ownerEmail: template.owner_email,
        ownerUsername: template.owner_username,
        instanceCount: template.instance_count,
        }}
        slotData={null}
      />
    </PageShell>
  );
}

export const dynamic = 'force-dynamic';
