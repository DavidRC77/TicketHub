export * from './database';

export type UserRole = 'admin' | 'organizador' | 'usuario' | 'organizer' | 'user';

export type TicketStatus = 'activo' | 'usado' | 'active' | 'used';

export interface User {
  id: string;
  email: string;
  nombreCompleto?: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  category?: string;
  location?: string;
  price?: number;
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
