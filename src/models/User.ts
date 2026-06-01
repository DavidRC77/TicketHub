import { supabase } from '@/lib/supabase';
import { DatabaseProfile, User } from '@/types';

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*')
    .eq('correo', email)
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const createUser = async (
  email: string,
  role: string
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('perfiles')
    .insert([{ correo: email, rol: role }])
    .select()
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const updateUserRole = async (id: string, role: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('perfiles')
    .update({ rol: role, actualizado_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('perfiles')
    .select('*');

  if (error) return [];

  return (data as DatabaseProfile[]).map(mapDatabaseProfileToUser);
};

const mapDatabaseProfileToUser = (profile: DatabaseProfile): User => ({
  id: profile.id,
  email: profile.correo,
  nombreCompleto: profile.nombre_completo,
  role: profile.rol as any,
  createdAt: new Date(profile.creado_at),
  updatedAt: new Date(profile.actualizado_at),
});
