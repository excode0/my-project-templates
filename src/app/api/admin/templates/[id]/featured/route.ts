import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { isAdminRole } from '@/lib/auth/roles';

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
    const { isFeatured } = body;

    if (typeof isFeatured !== 'boolean') {
      return NextResponse.json(
        { error: 'isFeatured must be a boolean' },
        { status: 400 }
      );
    }

    // Check if template exists and is approved
    const template = await db`
      SELECT id, status, is_featured FROM templates WHERE id = ${templateId} LIMIT 1
    `.then((rows: any[]) => rows[0]);

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    if (template.status !== 'approved' && template.status !== 'published') {
      return NextResponse.json(
        { error: 'Only approved templates can be featured' },
        { status: 400 }
      );
    }

    // Update featured status
    await db`
      UPDATE templates SET is_featured = ${isFeatured}, updated_at = NOW() WHERE id = ${templateId}
    `;

    return NextResponse.json({
      message: `Template ${isFeatured ? 'featured' : 'unfeatured'} successfully`,
      templateId,
      isFeatured,
    });
  } catch (error) {
    console.error('Error updating featured status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
