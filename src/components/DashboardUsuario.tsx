'use client';

import { useEffect, useState } from 'react';
import { glassStyles } from '@/components/ui/glassStyles';
import { logoutAction } from '@/app/actions';
import { TarjetaEvento } from '@/components/TarjetaEvento';
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
  ubicacion: string;
  fecha: string;
  precio: number;
  entradasDisponibles: number;
  totalEntradas: number;
  urlImagen?: string;
  calificacion?: number;
}

interface EntradaEvento {
  evento_id: string;
}

function formatearBolivianos(monto: number) {
  return `Bs ${Number(monto || 0).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function DashboardUsuario({ usuario, eventos }: { usuario: Usuario; eventos: Evento[] }) {
  const supabase = createClient();
  const [eventosActuales, setEventosActuales] = useState<Evento[]>(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventos.filter((evento) => new Date(evento.fecha) >= hoy);
  });
  const [eventoSeleccionado, setEventoSeleccionado] = useState<Evento | null>(null);
  const [procesandoPago, setProcesandoPago] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [metodoPago, setMetodoPago] = useState<'visa' | 'mastercard'>('visa');
  const [cantidadEntradas, setCantidadEntradas] = useState(1);
  const [calificacionSeleccionada, setCalificacionSeleccionada] = useState(5);
  const [guardandoCalificacion, setGuardandoCalificacion] = useState(false);

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

    setEventosActuales((actuales) => {
      const actualizados = actuales.map((evento) => ({
        ...evento,
        entradasDisponibles: Math.max(
          evento.totalEntradas - (vendidasPorEvento.get(evento.id) || 0),
          0
        ),
      }));

      setEventoSeleccionado((seleccionado) => {
        if (!seleccionado) return seleccionado;
        const actualizado = actualizados.find((evento) => evento.id === seleccionado.id);
        if (!actualizado) return seleccionado;
        setCantidadEntradas((cantidad) => Math.min(cantidad, Math.max(actualizado.entradasDisponibles, 1)));
        return actualizado;
      });

      return actualizados;
    });
  }

  useEffect(() => {
    const canal = supabase
      .channel('stock-eventos-usuario')
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventosActuales]);

  function cerrarModal() {
    if (procesandoPago || guardandoCalificacion) return;
    setEventoSeleccionado(null);
    setCompraExitosa(false);
    setMensajeError('');
    setCantidadEntradas(1);
    setCalificacionSeleccionada(5);
  }

  async function confirmarPagoSimulado() {
    if (!eventoSeleccionado) return;

    setProcesandoPago(true);
    setMensajeError('');

    await new Promise((resolve) => setTimeout(resolve, 900));

    const cantidad = Math.min(cantidadEntradas, eventoSeleccionado.entradasDisponibles);

    if (cantidad < 1) {
      setProcesandoPago(false);
      setMensajeError('No hay entradas disponibles para este evento.');
      return;
    }

    const entradas = Array.from({ length: cantidad }, () => ({
      usuario_id: usuario.id,
      evento_id: eventoSeleccionado.id,
    }));

    const { error } = await supabase.from('entradas').insert(entradas);

    setProcesandoPago(false);

    if (error) {
      setMensajeError('No se pudo registrar la compra. Inténtalo nuevamente.');
      return;
    }

    const eventoActualizado = {
      ...eventoSeleccionado,
      entradasDisponibles: Math.max(eventoSeleccionado.entradasDisponibles - cantidad, 0),
    };

    setEventosActuales((actuales) =>
      actuales.map((evento) => (evento.id === eventoSeleccionado.id ? eventoActualizado : evento))
    );
    setEventoSeleccionado(eventoActualizado);
    setCalificacionSeleccionada(Math.round(eventoActualizado.calificacion ?? 5));
    setCompraExitosa(true);
  }

  async function calificarEvento() {
    if (!eventoSeleccionado || guardandoCalificacion) return;

    try {
      setGuardandoCalificacion(true);

      const { error } = await supabase
        .from('eventos')
        .update({ calificacion: calificacionSeleccionada })
        .eq('id', eventoSeleccionado.id);

      if (error) throw error;

      const eventoActualizado = {
        ...eventoSeleccionado,
        calificacion: calificacionSeleccionada,
      };

      setEventosActuales((actuales) =>
        actuales.map((evento) =>
          evento.id === eventoSeleccionado.id ? eventoActualizado : evento
        )
      );
      setEventoSeleccionado(eventoActualizado);
    } catch (error) {
      console.error('Error guardando calificación:', error);
      setMensajeError('No se pudo guardar tu calificación. Inténtalo nuevamente.');
    } finally {
      setGuardandoCalificacion(false);
    }
  }

  function renderEstrellas(valor: number, interactivo = false) {
    return Array.from({ length: 5 }, (_, index) => {
      const estrella = index + 1;
      const activa = estrella <= valor;

      return (
        <button
          key={estrella}
          type="button"
          disabled={!interactivo || guardandoCalificacion}
          onClick={() => interactivo && setCalificacionSeleccionada(estrella)}
          className={`text-2xl transition-transform ${
            activa ? 'text-amber-400' : 'text-slate-600'
          } ${interactivo ? 'hover:scale-110' : ''} ${interactivo ? 'cursor-pointer' : 'cursor-default'}`}
        >
          ★
        </button>
      );
    });
  }

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
          {eventosActuales && eventosActuales.length > 0 ? (
            eventosActuales.map((evento) => (
              <TarjetaEvento
                key={evento.id}
                onComprar={() => {
                  setEventoSeleccionado(evento);
                  setCompraExitosa(false);
                  setMensajeError('');
                  setCantidadEntradas(1);
                }}
                titulo={evento.titulo}
                categoria={evento.categoria}
                ubicacion={evento.ubicacion}
                fecha={evento.fecha}
                precio={evento.precio}
                entradasDisponibles={evento.entradasDisponibles}
                totalEntradas={evento.totalEntradas}
                urlImagen={evento.urlImagen}
                
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

      {eventoSeleccionado && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className={`${glassStyles.panel} w-full max-w-lg p-6`}>
            {compraExitosa ? (
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-3xl text-green-300">
                  ✓
                </div>
                <p className="text-sm font-semibold uppercase tracking-wider text-green-300">
                  Pase Digital
                </p>
                <h3 className="mt-2 text-2xl font-bold text-white">¡Compra Exitosa!</h3>
                <div className="my-5 rounded-xl border border-dashed border-violet-400/40 bg-white/5 p-4 text-left">
                  <p className="text-xs text-slate-400">Evento</p>
                  <p className="font-semibold text-white">{eventoSeleccionado.titulo}</p>
                  <p className="mt-3 text-xs text-slate-400">Ubicación</p>
                  <p className="font-semibold text-white">{eventoSeleccionado.ubicacion}</p>
                  <p className="mt-3 text-xs text-slate-400">Entradas</p>
                  <p className="font-semibold text-white">{cantidadEntradas}</p>
                  <p className="mt-3 text-xs text-slate-400">Importe total</p>
                  <p className="font-semibold text-violet-300">
                    {formatearBolivianos(eventoSeleccionado.precio * cantidadEntradas)}
                  </p>
                </div>

                <div className="mb-5 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm font-semibold text-white">Califica este evento</p>
                  <div className="mt-3 flex items-center justify-center gap-1">
                    {renderEstrellas(calificacionSeleccionada, true)}
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-400">
                    Tu calificación se guardará en la ficha del evento
                  </p>
                  <button
                    type="button"
                    onClick={calificarEvento}
                    disabled={guardandoCalificacion}
                    className={`mt-4 w-full rounded-xl py-3 ${glassStyles.botonPrimario} ${
                      guardandoCalificacion ? 'cursor-not-allowed opacity-70' : ''
                    }`}
                  >
                    {guardandoCalificacion ? 'Guardando...' : 'Guardar calificación'}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={cerrarModal}
                  className={`w-full rounded-xl py-3 ${glassStyles.botonPrimario}`}
                >
                  Cerrar
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-violet-300">
                      Selecciona tu forma de pago
                    </p>
                    <h3 className="mt-1 text-2xl font-bold text-white">
                      {eventoSeleccionado.titulo}
                    </h3>
                    <p className="mt-2 text-sm text-slate-400">
                      {eventoSeleccionado.ubicacion}
                    </p>
                    <div className="mt-3 flex items-center gap-1">
                      {renderEstrellas(Number(eventoSeleccionado.calificacion ?? 5))}
                    </div>
                    <p className="mt-3 text-xl font-bold text-violet-300">
                      {formatearBolivianos(eventoSeleccionado.precio * cantidadEntradas)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={cerrarModal}
                    className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-slate-300 hover:bg-white/10"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-white">Cantidad de entradas</p>
                      <p className="text-xs text-slate-400">
                        {eventoSeleccionado.entradasDisponibles} disponibles
                      </p>
                    </div>
                    <div className="flex items-center overflow-hidden rounded-xl border border-white/10 bg-black/20">
                      <button
                        type="button"
                        onClick={() => setCantidadEntradas((cantidad) => Math.max(cantidad - 1, 1))}
                        className="px-4 py-2 text-lg font-bold text-white hover:bg-white/10"
                      >
                        -
                      </button>
                      <span className="min-w-12 px-4 py-2 text-center font-bold text-white">
                        {cantidadEntradas}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setCantidadEntradas((cantidad) =>
                            Math.min(cantidad + 1, eventoSeleccionado.entradasDisponibles)
                          )
                        }
                        className="px-4 py-2 text-lg font-bold text-white hover:bg-white/10"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('visa')}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      metodoPago === 'visa'
                        ? 'border-violet-400/70 bg-violet-500/15'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-bold text-white">VISA</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                        Débito
                      </span>
                    </div>
                    <p className="font-mono text-sm text-slate-200">**** **** **** 4821</p>
                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                      <span>Banco Nacional</span>
                      <span>09/29</span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMetodoPago('mastercard')}
                    className={`rounded-xl border p-4 text-left transition-all ${
                      metodoPago === 'mastercard'
                        ? 'border-violet-400/70 bg-violet-500/15'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <span className="text-lg font-bold text-white">Mastercard</span>
                      <span className="rounded-full bg-white/10 px-2 py-1 text-xs text-slate-300">
                        Crédito
                      </span>
                    </div>
                    <p className="font-mono text-sm text-slate-200">**** **** **** 7390</p>
                    <div className="mt-3 flex justify-between text-xs text-slate-400">
                      <span>Banco Unión</span>
                      <span>12/28</span>
                    </div>
                  </button>
                </div>

                {mensajeError && (
                  <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                    {mensajeError}
                  </p>
                )}

                <button
                  type="button"
                  onClick={confirmarPagoSimulado}
                  disabled={procesandoPago || eventoSeleccionado.entradasDisponibles <= 0}
                  className={`mt-5 flex w-full items-center justify-center gap-3 rounded-xl py-3 ${glassStyles.botonPrimario} ${
                    procesandoPago || eventoSeleccionado.entradasDisponibles <= 0
                      ? 'cursor-not-allowed opacity-70'
                      : ''
                  }`}
                >
                  {procesandoPago && (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  )}
                  {procesandoPago
                    ? 'Verificando pago...'
                    : eventoSeleccionado.entradasDisponibles <= 0
                      ? 'Sin entradas disponibles'
                      : 'Confirmar pago'}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
