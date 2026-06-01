import { NextRequest, NextResponse } from 'next/server';
import {
  fetchAllEvents,
  fetchEventById,
  fetchUserEvents,
  createNewEvent,
  modifyEvent,
  removeEvent,
} from '@/controllers/eventoControlador';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const eventId = searchParams.get('id');
  const organizerId = searchParams.get('organizer');

  if (eventId) {
    const result = await fetchEventById(eventId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  }

  if (organizerId) {
    const result = await fetchUserEvents(organizerId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  }

  const result = await fetchAllEvents();
  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  const result = await createNewEvent(
    body.titulo,
    body.descripcion,
    body.fecha,
    body.ubicacion,
    body.categoria,
    body.precio,
    body.total_entradas,
    body.userId,
    body.userRole
  );

  return NextResponse.json(result, {
    status: result.success ? 201 : 400,
  });
}

export async function PUT(request: NextRequest) {
  const body = await request.json();

  const result = await modifyEvent(body.eventId, body.updates, body.userId, body.userRole);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}

export async function DELETE(request: NextRequest) {
  const body = await request.json();

  const result = await removeEvent(body.eventId, body.userId, body.userRole);

  return NextResponse.json(result, {
    status: result.success ? 200 : 400,
  });
}
