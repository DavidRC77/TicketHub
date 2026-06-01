import { NextRequest, NextResponse } from 'next/server';
import { registerUser, promoteToOrganizer, promoteToAdmin } from '@/controllers/authController';

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'register') {
    const result = await registerUser(body.email);
    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  }

  if (body.action === 'promote-organizer') {
    const result = await promoteToOrganizer(body.userId, body.adminId, body.adminRole);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  if (body.action === 'promote-admin') {
    const result = await promoteToAdmin(body.userId, body.adminId, body.adminRole);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid action', code: 'INVALID_ACTION' },
    { status: 400 }
  );
}
