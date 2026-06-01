'use client';

import { glassStyles } from '@/components/ui/glassStyles';
import { logoutAction } from '@/app/actions';
import { TarjetaEvento } from '@/components/TarjetaEvento';

interface Usuario {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: string;
}

interface Evento {
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

export function DashboardUsuario({ usuario, eventos }: { usuario: Usuario; eventos: Evento[] }) {
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
            <p className="text-sm text-slate-400">Cartelera de Eventos</p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white font-medium bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors duration-200 text-sm"
            >
              Cerrar Sesión
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Bienvenido, {usuario.nombre_completo || usuario.correo}
          </h2>
          <p className="text-slate-400">
            Explora nuestros eventos disponibles y compra tus entradas
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {eventos && eventos.length > 0 ? (
            eventos.map((evento, idx) => (
              <TarjetaEvento
                key={idx}
                titulo={evento.titulo}
                categoria={evento.categoria}
                ubicacion={evento.ubicacion}
                fecha={evento.fecha}
                precio={evento.precio}
                entradasDisponibles={evento.entradasDisponibles}
                totalEntradas={evento.totalEntradas}
                urlImagen={evento.urlImagen}
                calificacion={evento.calificacion}
              />
            ))
          ) : (
            <div className={`col-span-full ${glassStyles.panel} p-12 text-center`}>
              <p className="text-slate-400 text-lg">
                No hay eventos disponibles en este momento
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
