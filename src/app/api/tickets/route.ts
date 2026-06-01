import { NextRequest, NextResponse } from 'next/server';
import {
  fetchUserTickets,
  fetchEventTickets,
  purchaseTicket,
  markTicketAsUsed,
  cancelTicket,
} from '@/controllers/ticketController';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const userId = searchParams.get('userId');
  const eventId = searchParams.get('eventId');
  const organizerId = searchParams.get('organizerId');
  const userRole = searchParams.get('userRole');

  if (userId) {
    const result = await fetchUserTickets(userId);
    return NextResponse.json(result);
  }

  if (eventId && organizerId && userRole) {
    const result = await fetchEventTickets(eventId, organizerId, userRole as any);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Missing parameters', code: 'MISSING_PARAMS' },
    { status: 400 }
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === 'purchase') {
    const result = await purchaseTicket(body.eventId, body.userId);
    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  }

  if (body.action === 'mark-used') {
    const result = await markTicketAsUsed(body.ticketId, body.userId, body.userRole);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid action', code: 'INVALID_ACTION' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  const result = await cancelTicket(body.ticketId, body.userId);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
