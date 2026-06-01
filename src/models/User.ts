import { supabase } from './supabase';
import { DatabaseProfile, User } from '@/types';

export const getUserById = async (id: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const createUser = async (
  email: string,
  role: string
): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ email, role }])
    .select()
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const updateUserRole = async (id: string, role: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) return null;

  return mapDatabaseProfileToUser(data as DatabaseProfile);
};

export const getAllUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*');

  if (error) return [];

  return (data as DatabaseProfile[]).map(mapDatabaseProfileToUser);
};

const mapDatabaseProfileToUser = (profile: DatabaseProfile): User => ({
  id: profile.id,
  email: profile.email,
  role: profile.role as any,
  createdAt: new Date(profile.created_at),
  updatedAt: new Date(profile.updated_at),
});
