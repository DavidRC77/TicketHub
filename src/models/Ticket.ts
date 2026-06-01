import { supabase } from '@/lib/supabase';
import { DatabaseTicket, Ticket } from '@/types';

export const getTicketById = async (id: string): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseTicketToTicket(data as DatabaseTicket);
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data as DatabaseTicket[]).map(mapDatabaseTicketToTicket);
};

export const getEventTickets = async (eventId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('event_id', eventId)
    .order('created_at', { ascending: false });

  if (error) return [];

  return (data as DatabaseTicket[]).map(mapDatabaseTicketToTicket);
};

export const createTicket = async (
  eventId: string,
  userId: string
): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([
      {
        event_id: eventId,
        user_id: userId,
        status: 'active',
      },
    ])
    .select()
    .single();

  if (error) return null;

  return mapDatabaseTicketToTicket(data as DatabaseTicket);
};

export const updateTicketStatus = async (
  id: string,
  status: string
): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('tickets')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseTicketToTicket(data as DatabaseTicket);
};

export const deleteTicket = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('tickets').delete().eq('id', id);

  return !error;
};

export const hasUserTicketForEvent = async (userId: string, eventId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('tickets')
    .select('id')
    .eq('user_id', userId)
    .eq('event_id', eventId)
    .single();

  return !error && !!data;
};

const mapDatabaseTicketToTicket = (ticket: DatabaseTicket): Ticket => ({
  id: ticket.id,
  eventId: ticket.event_id,
  userId: ticket.user_id,
  status: ticket.status as any,
  createdAt: new Date(ticket.created_at),
  updatedAt: new Date(ticket.updated_at),
});
