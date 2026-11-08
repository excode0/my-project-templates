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
    const userId = resolvedParams.id;

    const body = await request.json();
    const { role } = body;

    // Validate role
    if (
      !role ||
      !['user', 'contributor', 'admin', 'super_admin'].includes(role)
    ) {
      return NextResponse.json(
        { error: 'Invalid role. Must be user, contributor, admin, or super_admin' },
        { status: 400 }
      );
    }

    // Only super admins can grant the super_admin role
    if (role === 'super_admin' && session.user.role !== 'super_admin') {
      return NextResponse.json(
        { error: 'Only super admins can grant the super_admin role' },
        { status: 403 }
      );
    }

    // Check if user exists
    const user = await db`
      SELECT id, email, role FROM users WHERE id = ${userId} LIMIT 1
    `.then((rows: any[]) => rows[0]);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent changing own role
    if (userId === session.user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own role' },
        { status: 400 }
      );
    }

    // Update user role
    await db`
      UPDATE users SET role = ${role}, updated_at = NOW() WHERE id = ${userId}
    `;

    return NextResponse.json({
      message: 'User role updated successfully',
      userId,
      oldRole: user.role,
      newRole: role,
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
