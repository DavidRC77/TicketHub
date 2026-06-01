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
  fecha: string;
  precio: string;
  entradas_disponibles: number;
  total_entradas: number;
}

interface MetricaProps {
  titulo: string;
  valor: string | number;
  icono: string;
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

  async function actualizarStockEventos() {
    const eventoIds = eventosActuales.map((evento) => evento.id);
    if (eventoIds.length === 0) return;

    const { data } = await supabase
      .from('entradas')
      .select('evento_id')
      .in('evento_id', eventoIds);

    const vendidasPorEvento = (data || []).reduce((mapa: Map<string, number>, entrada: any) => {
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
      total + (evento.total_entradas - evento.entradas_disponibles) * Number(evento.precio || 0),
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
            <Metrica
              titulo="Eventos Activos"
              valor={estadisticas.eventos_activos}
              icono="🎭"
            />
            <Metrica
              titulo="Entradas Vendidas"
              valor={entradasVendidas}
              icono="🎟️"
            />
            <Metrica
              titulo="Ingresos"
              valor={ingresosFormato}
              icono="💰"
            />
          </div>

          <div className={glassStyles.panel + ' p-6'}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Mis Eventos</h2>
              <button
                className={`px-4 py-2 rounded-lg text-white font-medium text-sm ${glassStyles.botonPrimario}`}
              >
                + Nuevo Evento
              </button>
            </div>

            {eventosActuales.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Evento
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Precio</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Entradas
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Acciones
                      </th>
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
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(evento.fecha).toLocaleDateString('es-ES', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </td>
                        <td className="py-3 px-4 text-white">Bs {evento.precio}</td>
                        <td className="py-3 px-4 text-white">
                          {evento.entradas_disponibles}/{evento.total_entradas}
                        </td>
                        <td className="py-3 px-4 space-x-2">
                          <button className="text-violet-400 hover:text-violet-300 text-xs font-medium transition-colors">
                            Editar
                          </button>
                          <button className="text-red-400 hover:text-red-300 text-xs font-medium transition-colors">
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
