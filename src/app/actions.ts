'use server';

import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Correo y contraseña son requeridos' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message || 'Error al iniciar sesión' };
  }

  redirect('/');
}

export async function registerAction(formData: FormData) {
  const nombre = formData.get('nombre') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!nombre || !email || !password) {
    return { error: 'Todos los campos son requeridos' };
  }

  if (password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres' };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError || !authData.user) {
    return { error: authError?.message || 'Error al crear la cuenta' };
  }

  const { error: profileError } = await supabase
    .from('perfiles')
    .insert([
      {
        id: authData.user.id,
        correo: email,
        nombre_completo: nombre,
        rol: 'usuario',
      },
    ]);

  if (profileError) {
    return { error: 'Error al crear el perfil de usuario' };
  }

  redirect('/');
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  await supabase.auth.signOut();
  redirect('/');
}

