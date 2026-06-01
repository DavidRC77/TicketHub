export type UserRole = 'admin' | 'organizer' | 'user';

export type TicketStatus = 'active' | 'used';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: Date;
  totalTickets: number;
  availableTickets: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  eventId: string;
  userId: string;
  status: TicketStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}
