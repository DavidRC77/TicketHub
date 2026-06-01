import { supabase } from '@/lib/supabase';
import { DatabaseTicket, Ticket } from '@/types';

export const getTicketById = async (id: string): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('entradas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseTicketToTicket(data as DatabaseTicket);
};

export const getUserTickets = async (userId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('entradas')
    .select('*')
    .eq('usuario_id', userId)
    .order('creado_at', { ascending: false });

  if (error) return [];

  return (data as DatabaseTicket[]).map(mapDatabaseTicketToTicket);
};

export const getEventTickets = async (eventId: string): Promise<Ticket[]> => {
  const { data, error } = await supabase
    .from('entradas')
    .select('*')
    .eq('evento_id', eventId)
    .order('creado_at', { ascending: false });

  if (error) return [];

  return (data as DatabaseTicket[]).map(mapDatabaseTicketToTicket);
};

export const createTicket = async (
  eventId: string,
  userId: string
): Promise<Ticket | null> => {
  const { data, error } = await supabase
    .from('entradas')
    .insert([
      {
        evento_id: eventId,
        usuario_id: userId,
        estado: 'activo',
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
    .from('entradas')
    .update({ estado: status, actualizado_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseTicketToTicket(data as DatabaseTicket);
};

export const deleteTicket = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('entradas').delete().eq('id', id);

  return !error;
};

export const hasUserTicketForEvent = async (userId: string, eventId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .from('entradas')
    .select('id')
    .eq('usuario_id', userId)
    .eq('evento_id', eventId)
    .single();

  return !error && !!data;
};

const mapDatabaseTicketToTicket = (ticket: DatabaseTicket): Ticket => ({
  id: ticket.id,
  eventId: ticket.evento_id,
  userId: ticket.usuario_id,
  status: ticket.estado as any,
  createdAt: new Date(ticket.creado_at),
  updatedAt: new Date(ticket.actualizado_at),
});
