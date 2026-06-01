'use client';

import { useEffect, useState } from 'react';
import { glassStyles } from '@/components/ui/glassStyles';
import { logoutAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/client';

interface Usuario {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: string;
}

interface Evento {
  id: string;
  titulo: string;
  categoria: string;
  fecha: string;
  precio: number;
  url_imagen?: string | null;
  entradas_disponibles: number;
  total_entradas: number;
  descripcion?: string;
  ubicacion?: string;
}

interface MetricaProps {
  titulo: string;
  valor: string | number;
  icono: string;
}

interface EntradaEvento {
  evento_id: string;
}

function Metrica({ titulo, valor, icono }: MetricaProps) {
  return (
    <div className={glassStyles.panel + ' p-6'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{titulo}</p>
          <p className="text-3xl font-bold text-white">{valor}</p>
        </div>
        <span className="text-3xl">{icono}</span>
      </div>
    </div>
  );
}

export function DashboardOrganizador({
  usuario,
  eventos,
  estadisticas,
}: {
  usuario: Usuario;
  eventos: Evento[];
  estadisticas: {
    eventos_activos: number;
    entradas_vendidas: number;
    ingresos_total: number;
  };
}) {
  const supabase = createClient();
  const [eventosActuales, setEventosActuales] = useState<Evento[]>(eventos);
  const [formularioEvento, setFormularioEvento] = useState({
    titulo: '',
    categoria: 'Otro',
    url_imagen: '',
    fecha: '',
    ubicacion: '',
    precio: '',
    total_entradas: '',
    descripcion: ''
  });
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);

  async function guardarEvento() {
    if (!formularioEvento.titulo || !formularioEvento.fecha || !formularioEvento.ubicacion || !formularioEvento.categoria || !formularioEvento.precio || !formularioEvento.total_entradas || !formularioEvento.descripcion) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    const payload = {
      ...formularioEvento,
      precio: parseFloat(formularioEvento.precio),
      total_entradas: parseInt(formularioEvento.total_entradas),
      userId: usuario.id,
      userRole: usuario.rol
    };

    if (editandoEvento) {
      const { error } = await supabase.from('eventos').update({
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        fecha: payload.fecha,
        ubicacion: payload.ubicacion,
        categoria: payload.categoria,
        precio: payload.precio,
        total_entradas: payload.total_entradas
      }).eq('id', editandoEvento.id);

      if (!error) location.reload();
      else alert('Error: ' + error.message);
    } else {
      const { error } = await supabase.from('eventos').insert([{
        titulo: payload.titulo,
        descripcion: payload.descripcion,
        fecha: payload.fecha,
        ubicacion: payload.ubicacion,
        categoria: payload.categoria,
        precio: payload.precio,
        total_entradas: payload.total_entradas,
        entradas_disponibles: payload.total_entradas,
        creado_por: payload.userId
      }]);

      if (!error) location.reload();
      else alert('Error: ' + error.message);
    }
  }

  async function eliminarEvento(id: string) {
    if (!confirm('¿Está seguro de eliminar este evento?')) return;
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (!error) location.reload();
    else alert('Error: ' + error.message);
  }

  async function actualizarStockEventos() {
    const eventoIds = eventosActuales.map((evento) => evento.id);
    if (eventoIds.length === 0) return;

    const { data } = await supabase
      .from('entradas')
      .select('evento_id')
      .in('evento_id', eventoIds);

    const vendidasPorEvento = (data || []).reduce((mapa: Map<string, number>, entrada: EntradaEvento) => {
      mapa.set(entrada.evento_id, (mapa.get(entrada.evento_id) || 0) + 1);
      return mapa;
    }, new Map<string, number>());

    setEventosActuales((actuales) =>
      actuales.map((evento) => ({
        ...evento,
        entradas_disponibles: Math.max(
          evento.total_entradas - (vendidasPorEvento.get(evento.id) || 0),
          0
        ),
      }))
    );
  }

  useEffect(() => {
    const canal = supabase
      .channel('stock-eventos-organizador')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'entradas' },
        () => {
          actualizarStockEventos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [eventosActuales]);

  const entradasVendidas = eventosActuales.reduce(
    (acc, evt) => acc + (evt.total_entradas - evt.entradas_disponibles),
    0
  );

  const ingresosActuales = eventosActuales.reduce(
    (total, evento) =>
      total + (evento.total_entradas - evento.entradas_disponibles) * (evento.precio || 0),
    0
  );

  const ingresosFormato = `Bs ${parseFloat(ingresosActuales.toString()).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div
      className="min-h-screen"
      style={{ background: 'linear-gradient(135deg, #0B0F19 0%, #111827 100%)' }}
    >
      <header className={`sticky top-0 z-50 ${glassStyles.panel} mx-4 mt-4 rounded-2xl`}>
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1">
              <span className="text-white">Ticket</span>
              <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                Hub
              </span>
            </h1>
            <p className="text-sm text-slate-400">Panel de Gestión de Eventos</p>
            <p className="text-xs text-slate-500">
              {usuario.nombre_completo || usuario.correo}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white font-medium bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Metrica titulo="Eventos Activos" valor={estadisticas.eventos_activos} icono="🎭" />
            <Metrica titulo="Entradas Vendidas" valor={entradasVendidas} icono="🎟️" />
            <Metrica titulo="Ingresos" valor={ingresosFormato} icono="💰" />
          </div>

          <div className={glassStyles.panel + ' p-6'}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mis Eventos</h2>
              <button
                onClick={() => {
                  setEditandoEvento(null);
                  setFormularioEvento({ titulo: '', categoria: 'Otro', url_imagen: '', fecha: '', ubicacion: '', precio: '', total_entradas: '', descripcion: '' });
                }}
                className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${glassStyles.botonPrimario}`}
              >
                + Nuevo Evento
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <input
                value={formularioEvento.titulo}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, titulo: e.target.value })}
                placeholder="Título"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={formularioEvento.categoria}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, categoria: e.target.value })}
                placeholder="Categoría"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={formularioEvento.fecha}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, fecha: e.target.value })}
                type="datetime-local"
                placeholder="Fecha"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={formularioEvento.ubicacion}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, ubicacion: e.target.value })}
                placeholder="Ubicación"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={formularioEvento.precio}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, precio: e.target.value })}
                type="number"
                placeholder="Precio"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <input
                value={formularioEvento.total_entradas}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, total_entradas: e.target.value })}
                type="number"
                placeholder="Total Entradas"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50"
              />
              <textarea
                value={formularioEvento.descripcion}
                onChange={(e) => setFormularioEvento({ ...formularioEvento, descripcion: e.target.value })}
                placeholder="Descripción"
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 md:col-span-2"
              />
              <button
                type="button"
                onClick={guardarEvento}
                className={"rounded-lg px-4 py-2 text-white font-medium " + glassStyles.botonPrimario}
              >
                Guardar cambios
              </button>
            </div>

            {eventosActuales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Evento</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Categoría</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Precio</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventosActuales.map((evento) => (
                      <tr
                        key={evento.id}
                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                      >
                        <td className="py-3 px-4 text-white font-medium line-clamp-1">
                          {evento.titulo}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{evento.categoria}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(evento.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-white">Bs {evento.precio}</td>
                        <td className="py-3 px-4 space-x-2">
                          <button onClick={() => { setEditandoEvento(evento); setFormularioEvento({ titulo: evento.titulo, categoria: evento.categoria, url_imagen: evento.url_imagen || '', fecha: evento.fecha ? (evento.fecha.includes('T') ? evento.fecha.slice(0, 16) : evento.fecha) : '', ubicacion: evento.ubicacion || '', precio: evento.precio.toString(), total_entradas: evento.total_entradas.toString(), descripcion: evento.descripcion || '' }); }} className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors">
                            Editar
                          </button>
                          <button onClick={() => eliminarEvento(evento.id)} className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">Aún no tienes eventos creados</p>
                <button
                  className={`mt-4 px-4 py-2 rounded-lg text-white font-medium text-sm ${glassStyles.botonPrimario}`}
                >
                  Crear tu primer evento
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
