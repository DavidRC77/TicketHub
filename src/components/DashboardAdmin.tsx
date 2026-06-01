'use client';

import { glassStyles } from '@/components/ui/glassStyles';
import { logoutAction } from '@/app/actions';

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
  total_entradas: number;
  entradas_disponibles: number;
  creado_por_nombre: string;
}

interface MetricaProps {
  titulo: string;
  valor: string | number;
  icono: string;
  descripcion?: string;
}

function Metrica({ titulo, valor, icono, descripcion }: MetricaProps) {
  return (
    <div className={glassStyles.panel + ' p-6'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium mb-2">{titulo}</p>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-1">{valor}</p>
          {descripcion && <p className="text-xs text-slate-500">{descripcion}</p>}
        </div>
        <span className="text-3xl sm:text-4xl">{icono}</span>
      </div>
    </div>
  );
}

export function DashboardAdmin({
  usuario,
  eventos,
  estadisticas,
}: {
  usuario: Usuario;
  eventos: Evento[];
  estadisticas: {
    usuarios_totales: number;
    eventos_totales: number;
    entradas_vendidas: number;
    ingresos_total: number;
  };
}) {
  const ingresosFormato = `$${parseFloat(estadisticas.ingresos_total.toString()).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

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
            <p className="text-sm text-slate-400">Panel de Administración</p>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Metrica
              titulo="Usuarios Totales"
              valor={estadisticas.usuarios_totales}
              icono="👥"
              descripcion="Registrados en el sistema"
            />
            <Metrica
              titulo="Eventos Totales"
              valor={estadisticas.eventos_totales}
              icono="🎭"
              descripcion="En la plataforma"
            />
            <Metrica
              titulo="Entradas Vendidas"
              valor={estadisticas.entradas_vendidas}
              icono="🎟️"
              descripcion="Total de transacciones"
            />
            <Metrica
              titulo="Ingresos Totales"
              valor={ingresosFormato}
              icono="💰"
              descripcion="Recaudación acumulada"
            />
          </div>

          <div className={glassStyles.panel + ' p-6'}>
            <h2 className="text-xl font-bold text-white mb-6">Eventos Recientes</h2>

            {eventos.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Evento
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">
                        Organizador
                      </th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Entradas</th>
                      <th className="text-left py-3 px-4 text-slate-400 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventos.map((evento) => {
                      const vendidas = evento.total_entradas - evento.entradas_disponibles;
                      const porcentaje = Math.round(
                        (vendidas / evento.total_entradas) * 100
                      );

                      return (
                        <tr
                          key={evento.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-white font-medium line-clamp-1">
                            {evento.titulo}
                          </td>
                          <td className="py-3 px-4 text-slate-400">{evento.creado_por_nombre}</td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(evento.fecha).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="py-3 px-4 text-white">
                            {vendidas}/{evento.total_entradas}
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                              {porcentaje}% vendido
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-400">No hay eventos en el sistema</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
