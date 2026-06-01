import { supabase } from '@/lib/supabase';
import { DatabaseEvent, Event } from '@/types';

export const getEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseEventToEvent(data as DatabaseEvent);
};

export const getAllEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('date', { ascending: true });

  if (error) return [];

  return (data as DatabaseEvent[]).map(mapDatabaseEventToEvent);
};

export const getEventsByOrganizer = async (organizerId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('created_by', organizerId)
    .order('date', { ascending: true });

  if (error) return [];

  return (data as DatabaseEvent[]).map(mapDatabaseEventToEvent);
};

export const createEvent = async (
  title: string,
  description: string,
  date: string,
  totalTickets: number,
  createdBy: string
): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('events')
    .insert([
      {
        title,
        description,
        date,
        total_tickets: totalTickets,
        available_tickets: totalTickets,
        created_by: createdBy,
      },
    ])
    .select()
    .single();

  if (error) return null;

  return mapDatabaseEventToEvent(data as DatabaseEvent);
};

export const updateEvent = async (
  id: string,
  updates: Partial<Event>
): Promise<Event | null> => {
  const updateData: any = {};

  if (updates.title) updateData.title = updates.title;
  if (updates.description) updateData.description = updates.description;
  if (updates.date) updateData.date = updates.date.toISOString();
  if (updates.totalTickets) updateData.total_tickets = updates.totalTickets;
  if (updates.availableTickets) updateData.available_tickets = updates.availableTickets;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('events')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseEventToEvent(data as DatabaseEvent);
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('events').delete().eq('id', id);

  return !error;
};

const mapDatabaseEventToEvent = (event: DatabaseEvent): Event => ({
  id: event.id,
  title: event.title,
  description: event.description || undefined,
  date: new Date(event.date),
  totalTickets: event.total_tickets,
  availableTickets: event.available_tickets,
  createdBy: event.created_by,
  createdAt: new Date(event.created_at),
  updatedAt: new Date(event.updated_at),
});
