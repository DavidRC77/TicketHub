import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';
import { LoginForm } from '@/components/LoginForm';
import { AdminDashboardClient } from '@/components/AdminDashboardClient';
import { DashboardOrganizador } from '@/components/DashboardOrganizador';
import { DashboardUsuario } from '@/components/DashboardUsuario';

interface Perfil {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: 'admin' | 'organizador' | 'usuario';
}

interface Evento {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  categoria: string;
  precio: number;
  calificacion: number;
  url_imagen: string | null;
  entradas_disponibles: number;
  total_entradas: number;
  creado_por: string;
}

interface EventoFormato {
  titulo: string;
  categoria: string;
  ubicacion: string;
  fecha: string;
  precio: number;
  entradasDisponibles: number;
  totalEntradas: number;
  urlImagen?: string;
  calificacion?: number;
}

interface EventoAdmin {
  id: string;
  titulo: string;
  fecha: string;
  total_entradas: number;
  entradas_disponibles: number;
  creado_por_nombre: string;
}

interface Estadisticas {
  usuarios_totales?: number;
  eventos_totales?: number;
  entradas_vendidas?: number;
  ingresos_total?: number;
  eventos_activos?: number;
}

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: sessionData } = await supabase.auth.getUser();
  const usuario = sessionData?.user;

  if (!usuario) {
    return <LoginForm />;
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('id, correo, nombre_completo, rol')
    .eq('id', usuario.id)
    .single();

  if (perfilError || !perfil) {
    return <LoginForm />;
  }

  const perfilTyped = perfil as Perfil;

  if (perfilTyped.rol === 'usuario') {
    const { data: eventosRaw } = await supabase
      .from('eventos')
      .select(
        'id, titulo, descripcion, fecha, ubicacion, categoria, precio, calificacion, url_imagen, entradas_disponibles, total_entradas, creado_por'
      )
      .order('fecha', { ascending: true });

    const eventos: EventoFormato[] = (eventosRaw || []).map((evt: Evento) => ({
      titulo: evt.titulo,
      categoria: evt.categoria,
      ubicacion: evt.ubicacion,
      fecha: evt.fecha,
      precio: evt.precio,
      entradasDisponibles: evt.entradas_disponibles,
      totalEntradas: evt.total_entradas,
      urlImagen: evt.url_imagen || undefined,
      calificacion: evt.calificacion || 5.0,
    }));

    return (
      <DashboardUsuario usuario={perfilTyped} eventos={eventos} />
    );
  }

  if (perfilTyped.rol === 'organizador') {
    const { data: eventosRaw } = await supabase
      .from('eventos')
      .select('id, titulo, fecha, precio, entradas_disponibles, total_entradas')
      .eq('creado_por', perfilTyped.id)
      .order('fecha', { ascending: true });

    const { data: estadisticasRaw } = await supabase
      .from('eventos')
      .select('id')
      .eq('creado_por', perfilTyped.id);

    const eventosActivos = estadisticasRaw?.length || 0;

    const eventoIds = (eventosRaw || []).map((e: any) => e.id);
    
    let entradasVendidas = 0;
    if (eventoIds.length > 0) {
      const { data: entradasRaw } = await supabase
        .from('entradas')
        .select('id', { count: 'exact' })
        .in('evento_id', eventoIds);
      entradasVendidas = entradasRaw?.length || 0;
    }

    const preciosPorEvento = new Map(
      (eventosRaw || []).map((evt: any) => [evt.id, Number(evt.precio || 0)])
    );

    let ingresosTotal = 0;
    if (eventoIds.length > 0) {
      const { data: entradasRaw } = await supabase
        .from('entradas')
        .select('evento_id')
        .in('evento_id', eventoIds);

      ingresosTotal = (entradasRaw || []).reduce(
        (total: number, entrada: any) => total + (preciosPorEvento.get(entrada.evento_id) || 0),
        0
      );
    }

    const eventos: any[] = (eventosRaw || []).map((evt: any) => ({
      id: evt.id,
      titulo: evt.titulo,
      fecha: evt.fecha,
      precio: evt.precio,
      entradas_disponibles: evt.entradas_disponibles,
      total_entradas: evt.total_entradas,
    }));

    const estadisticas: Estadisticas = {
      eventos_activos: eventosActivos,
      entradas_vendidas: entradasVendidas,
      ingresos_total: ingresosTotal,
    };

    return (
      <DashboardOrganizador
        usuario={perfilTyped}
        eventos={eventos}
        estadisticas={estadisticas as any}
      />
    );
  }

  if (perfilTyped.rol === 'admin') {
    const { data: eventosRaw } = await supabase
      .from('eventos')
      .select('id, titulo, fecha, total_entradas, entradas_disponibles, creado_por')
      .order('fecha', { ascending: false })
      .limit(10);

    const { data: perfilesRaw } = await supabase.from('perfiles').select('id, nombre_completo');

    const perfilesMap = new Map(
      (perfilesRaw || []).map((p: any) => [p.id, p.nombre_completo || 'Desconocido'])
    );

    const eventos: EventoAdmin[] = (eventosRaw || []).map((evt: any) => ({
      id: evt.id,
      titulo: evt.titulo,
      fecha: evt.fecha,
      total_entradas: evt.total_entradas,
      entradas_disponibles: evt.entradas_disponibles,
      creado_por_nombre: perfilesMap.get(evt.creado_por) || 'Desconocido',
    }));

    const { count: usuariosCount } = await supabase
      .from('perfiles')
      .select('id', { count: 'exact' });

    const { count: eventosCount } = await supabase
      .from('eventos')
      .select('id', { count: 'exact' });

    const { count: entradasCount } = await supabase
      .from('entradas')
      .select('id', { count: 'exact' });

    const { data: entradasConPrecio } = await supabase
      .from('entradas')
      .select('eventos(precio)');

    const ingresosTotal = (entradasConPrecio || []).reduce((total: number, entrada: any) => {
      const evento = Array.isArray(entrada.eventos) ? entrada.eventos[0] : entrada.eventos;
      return total + Number(evento?.precio || 0);
    }, 0);

    const estadisticas = {
      usuarios_totales: usuariosCount || 0,
      eventos_totales: eventosCount || 0,
      entradas_vendidas: entradasCount || 0,
      ingresos_total: ingresosTotal,
    };

    return (
      <AdminDashboardClient
        usuarioAuth={perfilTyped}
        eventosIniciales={eventos}
        estadisticas={estadisticas}
      />
    );
  }

  return <LoginForm />;
}
