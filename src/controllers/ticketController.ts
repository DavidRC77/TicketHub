import { ApiResponse, Ticket, UserRole } from '@/types';
import {
  getTicketById,
  getUserTickets,
  getEventTickets,
  createTicket,
  updateTicketStatus,
  deleteTicket,
  hasUserTicketForEvent,
} from '@/models/Ticket';
import { getEventById, updateEvent } from '@/models/Event';
import { isAdmin } from '@/lib/rbac';

export const fetchUserTickets = async (userId: string): Promise<ApiResponse<Ticket[]>> => {
  try {
    const tickets = await getUserTickets(userId);
    return {
      success: true,
      data: tickets,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch tickets',
      code: 'FETCH_FAILED',
    };
  }
};

export const fetchEventTickets = async (
  eventId: string,
  userId: string,
  userRole: UserRole
): Promise<ApiResponse<Ticket[]>> => {
  try {
    const event = await getEventById(eventId);

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
        code: 'NOT_FOUND',
      };
    }

    if (event.createdBy !== userId && !isAdmin(userRole)) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    const tickets = await getEventTickets(eventId);
    return {
      success: true,
      data: tickets,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch tickets',
      code: 'FETCH_FAILED',
    };
  }
};

export const purchaseTicket = async (
  eventId: string,
  userId: string
): Promise<ApiResponse<Ticket>> => {
  try {
    const event = await getEventById(eventId);

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
        code: 'NOT_FOUND',
      };
    }

    if (event.availableTickets <= 0) {
      return {
        success: false,
        error: 'No available tickets',
        code: 'NO_TICKETS',
      };
    }

    const hasTicket = await hasUserTicketForEvent(userId, eventId);

    if (hasTicket) {
      return {
        success: false,
        error: 'User already has a ticket for this event',
        code: 'DUPLICATE_TICKET',
      };
    }

    const ticket = await createTicket(eventId, userId);

    if (!ticket) {
      return {
        success: false,
        error: 'Failed to create ticket',
        code: 'CREATION_FAILED',
      };
    }

    const updatedEvent = await updateEvent(eventId, {
      availableTickets: event.availableTickets - 1,
    });

    if (!updatedEvent) {
      await deleteTicket(ticket.id);
      return {
        success: false,
        error: 'Failed to purchase ticket',
        code: 'PURCHASE_FAILED',
      };
    }

    return {
      success: true,
      data: ticket,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};

export const markTicketAsUsed = async (
  ticketId: string,
  userId: string,
  userRole: UserRole
): Promise<ApiResponse<Ticket>> => {
  try {
    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return {
        success: false,
        error: 'Ticket not found',
        code: 'NOT_FOUND',
      };
    }

    const event = await getEventById(ticket.eventId);

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
        code: 'NOT_FOUND',
      };
    }

    if (event.createdBy !== userId && !isAdmin(userRole)) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    const updated = await updateTicketStatus(ticketId, 'used');

    if (!updated) {
      return {
        success: false,
        error: 'Failed to update ticket',
        code: 'UPDATE_FAILED',
      };
    }

    return {
      success: true,
      data: updated,
    };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};

export const cancelTicket = async (
  ticketId: string,
  userId: string
): Promise<ApiResponse<void>> => {
  try {
    const ticket = await getTicketById(ticketId);

    if (!ticket) {
      return {
        success: false,
        error: 'Ticket not found',
        code: 'NOT_FOUND',
      };
    }

    if (ticket.userId !== userId) {
      return {
        success: false,
        error: 'Unauthorized',
        code: 'UNAUTHORIZED',
      };
    }

    const event = await getEventById(ticket.eventId);

    if (!event) {
      return {
        success: false,
        error: 'Event not found',
        code: 'NOT_FOUND',
      };
    }

    const deleted = await deleteTicket(ticketId);

    if (!deleted) {
      return {
        success: false,
        error: 'Failed to cancel ticket',
        code: 'DELETE_FAILED',
      };
    }

    const updatedEvent = await updateEvent(ticket.eventId, {
      availableTickets: event.availableTickets + 1,
    });

    if (!updatedEvent) {
      return {
        success: false,
        error: 'Failed to cancel ticket',
        code: 'CANCEL_FAILED',
      };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    };
  }
};
