import { supabase } from '@/lib/supabase';
import { DatabaseEvent, Event } from '@/types';

export const getEventById = async (id: string): Promise<Event | null> => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseEventToEvent(data as DatabaseEvent);
};

export const getAllEvents = async (): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true });

  if (error) return [];

  return (data as DatabaseEvent[]).map(mapDatabaseEventToEvent);
};

export const getEventsByOrganizer = async (organizerId: string): Promise<Event[]> => {
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('creado_por', organizerId)
    .order('fecha', { ascending: true });

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
        titulo: title,
        descripcion: description,
        fecha: date,
        total_entradas: totalTickets,
        entradas_disponibles: totalTickets,
        creado_por: createdBy,
        categoria: 'Otro',
        ubicacion: 'Sin ubicación',
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
  if (updates.title) updateData.titulo = updates.title;
  if (updates.description) updateData.descripcion = updates.description;
  if (updates.date) updateData.fecha = updates.date.toISOString();
  if (updates.totalTickets) updateData.total_entradas = updates.totalTickets;
  if (updates.availableTickets) updateData.entradas_disponibles = updates.availableTickets;
  if (updates.location) updateData.ubicacion = updates.location;
  if (updates.category) updateData.categoria = updates.category;
  if (updates.price !== undefined) updateData.precio = updates.price;

  updateData.actualizado_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('eventos')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseEventToEvent(data as DatabaseEvent);
};

export const deleteEvent = async (id: string): Promise<boolean> => {
  const { error } = await supabase.from('eventos').delete().eq('id', id);

  return !error;
};

const mapDatabaseEventToEvent = (event: DatabaseEvent): Event => ({
  id: event.id,
  title: event.titulo,
  description: event.descripcion || undefined,
  category: event.categoria,
  location: event.ubicacion,
  price: Number(event.precio || 0),
  date: new Date(event.fecha),
  totalTickets: event.total_entradas,
  availableTickets: event.entradas_disponibles,
  createdBy: event.creado_por,
  createdAt: new Date(event.creado_at),
  updatedAt: new Date(event.actualizado_at),
});
