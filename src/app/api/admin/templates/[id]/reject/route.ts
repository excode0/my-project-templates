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

    const body = await request.json();
    const { reason } = body;

    if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

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
        { error: 'Only pending templates can be rejected' },
        { status: 400 }
      );
    }

    // Update template status to rejected
    await db`
      UPDATE templates SET status = 'rejected', updated_at = NOW() WHERE id = ${templateId}
    `;

    logger.info('Template rejected', { 
      templateId, 
      templateName: template.name, 
      reason 
    });

    // Send notification email to contributor with rejection reason
    sendEmail({
      to: template.contributor_email,
      subject: `Template Needs Revision: ${template.name}`,
      template: 'template-rejected',
      data: {
        templateName: template.name,
        reason: reason,
      },
    }).catch((err) => {
      logger.error('Failed to send rejection email', err);
    });

    return NextResponse.json({
      message: 'Template rejected successfully',
      templateId,
      reason,
    });
  } catch (error) {
    console.error('Error rejecting template:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
