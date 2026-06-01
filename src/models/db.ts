import { supabase } from '../lib/supabase';

export const PerfilModelo = {
  async obtenerPorId(id: string) {
    const { data, error } = await supabase
      .from('perfiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async actualizarRol(id: string, nuevoRol: 'admin' | 'organizador' | 'usuario') {
    const { data, error } = await supabase
      .from('perfiles')
      .update({ rol: nuevoRol, actualizado_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const EventoModelo = {
  async obtenerTodos() {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });
    if (error) throw error;
    return data;
  },

  async obtenerPorOrganizador(organizadorId: string) {
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .eq('creado_by', organizadorId)
      .order('creado_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async crear(evento: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    fecha: string;
    precio: number;
    url_imagen?: string;
    total_entradas: number;
    creado_por: string;
  }) {
    const { data, error } = await supabase
      .from('eventos')
      .insert([{
        ...evento,
        entradas_disponibles: evento.total_entradas
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

export const EntradaModelo = {
  async obtenerPorUsuario(usuarioId: string) {
    const { data, error } = await supabase
      .from('entradas')
      .select(`
        *,
        eventos (*)
      `)
      .eq('usuario_id', usuarioId)
      .order('creado_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async registrarCompra(eventoId: string, usuarioId: string) {
    const { data: evento, error: errorEvento } = await supabase
      .from('eventos')
      .select('entradas_disponibles')
      .eq('id', eventoId)
      .single();

    if (errorEvento || !evento) throw new Error('Evento no encontrado.');
    if (evento.entradas_disponibles <= 0) throw new Error('No hay entradas disponibles para este evento.');

    const { data: entrada, error: errorEntrada } = await supabase
      .from('entradas')
      .insert([{ evento_id: eventoId, usuario_id: usuarioId, estado: 'activo' }])
      .select()
      .single();

    if (errorEntrada) throw errorEntrada;

    const { error: errorActualizacion } = await supabase
      .from('eventos')
      .update({ entradas_disponibles: evento.entradas_disponibles - 1 })
      .eq('id', eventoId);

    if (errorActualizacion) throw errorActualizacion;

    return entrada;
  }
};