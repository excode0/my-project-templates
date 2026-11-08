import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminRole } from '@/lib/auth/roles';
import { sendEmail } from '@/lib/email/mailer';
import { logger } from '@/lib/logger';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || !isAdminRole(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const resolvedParams = await params;
    const templateId = resolvedParams.id;

    // Check if template exists and is pending
    const template = await db`
      SELECT t.id, t.status, t.name, t.slug, u.email as contributor_email
      FROM templates t
      JOIN users u ON t.contributor_id = u.id
      WHERE t.id = ${templateId}
      LIMIT 1
    `.then((rows: any[]) => rows[0]);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.status !== 'pending' && template.status !== 'review') {
      return NextResponse.json(
        { error: 'Only pending templates can be approved' },
        { status: 400 }
      );
    }

    // Update template status to approved
    await db`
      UPDATE templates SET status = 'approved', updated_at = NOW() WHERE id = ${templateId}
    `;

    logger.info('Template approved', { templateId, templateName: template.name });

    // Send notification email to contributor
    sendEmail({
      to: template.contributor_email,
      subject: `Template Approved: ${template.name}`,
      template: 'template-approved',
      data: {
        templateName: template.name,
        templateSlug: template.slug,
      },
    }).catch((err) => {
      logger.error('Failed to send approval email', err);
    });

    return NextResponse.json({
      message: 'Template approved successfully',
      templateId,
    });
  } catch (error) {
    console.error('Error approving template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
