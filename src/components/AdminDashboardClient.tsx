'use client';

import { useState, useEffect } from 'react';
import { glassStyles } from '@/components/ui/glassStyles';
import { logoutAction } from '@/app/actions';
import { createClient } from '@/utils/supabase/client';

interface Usuario {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: 'admin' | 'organizador' | 'usuario';
  activo?: boolean;
}

interface Evento {
  id: string;
  titulo: string;
  fecha: string;
  total_entradas: number;
  entradas_disponibles: number;
  creado_por_nombre: string;
}

interface Perfil {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: 'admin' | 'organizador' | 'usuario';
  activo: boolean;
}

interface EventoDetallado {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  ubicacion: string;
  precio: number;
  total_entradas: number;
  entradas_disponibles: number;
  creado_por: string;
}

function formatearDinero(monto: number): string {
  return `Bs ${parseFloat(monto.toString()).toLocaleString('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function Metrica({
  titulo,
  valor,
  icono,
  descripcion,
  onClick,
}: {
  titulo: string;
  valor: string | number;
  icono: string;
  descripcion?: string;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`${glassStyles.panel} p-6 ${onClick ? 'cursor-pointer hover:border-violet-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(124,58,237,0.2)]' : ''}`}
    >
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

export function AdminDashboardClient({
  usuarioAuth,
  eventosIniciales,
  estadisticas,
}: {
  usuarioAuth: Usuario;
  eventosIniciales: Evento[];
  estadisticas: {
    usuarios_totales: number;
    eventos_totales: number;
    entradas_vendidas: number;
    ingresos_total: number;
  };
}) {
  const [seccionAdmin, setSeccionAdmin] = useState<'resumen' | 'usuarios' | 'eventos'>('resumen');
  const [perfiles, setPerfiles] = useState<Perfil[]>([]);
  const [filtroRol, setFiltroRol] = useState<'todos' | 'usuario' | 'organizador' | 'admin'>('todos');
  const [eventosFecha, setEventosFecha] = useState<EventoDetallado[]>([]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [cargando, setCargando] = useState(false);
  const [editandoEvento, setEditandoEvento] = useState<EventoDetallado | null>(null);
  const [formularioEvento, setFormularioEvento] = useState({
    titulo: '',
    descripcion: '',
    ubicacion: '',
    precio: '',
    total_entradas: '',
  });
  const [mostraFormularioPersonal, setMostraFormularioPersonal] = useState(false);
  const [formularioPersonal, setFormularioPersonal] = useState({
    correo: '',
    nombre_completo: '',
    contrasena: '',
    rol: 'organizador' as 'admin' | 'organizador',
  });
  const [editandoUsuario, setEditandoUsuario] = useState<Perfil | null>(null);
  const [formularioEdicionUsuario, setFormularioEdicionUsuario] = useState({
    nombre_completo: '',
    correo: '',
    rol: 'usuario' as 'admin' | 'organizador' | 'usuario',
  });

  const supabase = createClient();

  // Cargar perfiles cuando se selecciona la sección de usuarios
  useEffect(() => {
    if (seccionAdmin === 'usuarios' && perfiles.length === 0) {
      cargarPerfiles();
    }
  }, [seccionAdmin]);

  // Cargar eventos cuando se selecciona la sección de eventos o cambia la fecha
  useEffect(() => {
    if (seccionAdmin === 'eventos') {
      cargarEventosPorFecha();
    }
  }, [seccionAdmin, fechaSeleccionada]);

  async function cargarPerfiles() {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('perfiles')
        .select('id, correo, nombre_completo, rol, activo')
        .order('nombre_completo', { ascending: true });

      if (error) throw error;
      setPerfiles((data || []) as Perfil[]);
    } catch (error) {
      console.error('Error cargando perfiles:', error);
    } finally {
      setCargando(false);
    }
  }

  async function cargarEventosPorFecha() {
    try {
      setCargando(true);
      const { data, error } = await supabase
        .from('eventos')
        .select('id, titulo, descripcion, fecha, ubicacion, precio, total_entradas, entradas_disponibles, creado_por')
        .eq('fecha', fechaSeleccionada)
        .order('titulo', { ascending: true });

      if (error) throw error;
      setEventosFecha((data || []) as EventoDetallado[]);
    } catch (error) {
      console.error('Error cargando eventos:', error);
    } finally {
      setCargando(false);
    }
  }

  async function eliminarPerfil(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar este usuario?')) return;

    try {
      const { error } = await supabase.from('perfiles').delete().eq('id', id);
      if (error) throw error;
      setPerfiles(perfiles.filter((p) => p.id !== id));
    } catch (error) {
      console.error('Error eliminando perfil:', error);
      alert('Error al eliminar el usuario');
    }
  }

  async function toggleActivoPerfil(id: string, activoActual: boolean) {
    try {
      const { error } = await supabase
        .from('perfiles')
        .update({ activo: !activoActual })
        .eq('id', id);

      if (error) throw error;
      setPerfiles(
        perfiles.map((p) => (p.id === id ? { ...p, activo: !activoActual } : p))
      );
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      alert('Error al actualizar el estado del usuario');
    }
  }

  async function crearPersonal() {
    if (!formularioPersonal.correo || !formularioPersonal.nombre_completo || !formularioPersonal.contrasena) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      setCargando(true);
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: formularioPersonal.correo,
        password: formularioPersonal.contrasena,
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('No se pudo crear el usuario de autenticación');

      const { error: perfilError } = await supabase.from('perfiles').insert({
        id: authData.user.id,
        correo: formularioPersonal.correo,
        nombre_completo: formularioPersonal.nombre_completo,
        rol: formularioPersonal.rol,
        activo: true,
      });

      if (perfilError) throw perfilError;

      setFormularioPersonal({
        correo: '',
        nombre_completo: '',
        contrasena: '',
        rol: 'organizador',
      });
      setMostraFormularioPersonal(false);
      await cargarPerfiles();
      alert('Personal creado exitosamente. Se ha enviado un correo de confirmación.');
    } catch (error) {
      console.error('Error creando personal:', error);
      alert('Error al crear el personal: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setCargando(false);
    }
  }

  function abrirEdicionUsuario(perfil: Perfil) {
    setEditandoUsuario(perfil);
    setFormularioEdicionUsuario({
      nombre_completo: perfil.nombre_completo || '',
      correo: perfil.correo,
      rol: perfil.rol,
    });
  }

  function cerrarEdicionUsuario() {
    setEditandoUsuario(null);
    setFormularioEdicionUsuario({
      nombre_completo: '',
      correo: '',
      rol: 'usuario',
    });
  }

  async function guardarEdicionUsuario() {
    if (!editandoUsuario) return;

    try {
      const { error } = await supabase
        .from('perfiles')
        .update({
          nombre_completo: formularioEdicionUsuario.nombre_completo,
          correo: formularioEdicionUsuario.correo,
          rol: formularioEdicionUsuario.rol,
        })
        .eq('id', editandoUsuario.id);

      if (error) throw error;
      setPerfiles(
        perfiles.map((p) =>
          p.id === editandoUsuario.id
            ? {
                ...p,
                nombre_completo: formularioEdicionUsuario.nombre_completo,
                correo: formularioEdicionUsuario.correo,
                rol: formularioEdicionUsuario.rol,
              }
            : p
        )
      );
      cerrarEdicionUsuario();
    } catch (error) {
      console.error('Error editando usuario:', error);
      alert('Error al editar el usuario');
    }
  }

  async function crearEvento() {
    if (!formularioEvento.titulo || !formularioEvento.ubicacion || !formularioEvento.precio) {
      alert('Por favor complete todos los campos');
      return;
    }

    try {
      const { error } = await supabase.from('eventos').insert({
        titulo: formularioEvento.titulo,
        descripcion: formularioEvento.descripcion,
        fecha: fechaSeleccionada,
        ubicacion: formularioEvento.ubicacion,
        precio: parseFloat(formularioEvento.precio),
        total_entradas: parseInt(formularioEvento.total_entradas) || 100,
        entradas_disponibles: parseInt(formularioEvento.total_entradas) || 100,
        creado_por: usuarioAuth.id,
        categoria: 'Otro',
        calificacion: 5.0,
      });

      if (error) throw error;
      setFormularioEvento({
        titulo: '',
        descripcion: '',
        ubicacion: '',
        precio: '',
        total_entradas: '',
      });
      await cargarEventosPorFecha();
      alert('Evento creado exitosamente');
    } catch (error) {
      console.error('Error creando evento:', error);
      alert('Error al crear el evento');
    }
  }

  async function editarEvento() {
    if (!editandoEvento) return;

    try {
      const totalEntradas = parseInt(formularioEvento.total_entradas) || editandoEvento.total_entradas;
      const entradasVendidas = editandoEvento.total_entradas - editandoEvento.entradas_disponibles;
      const entradasDisponibles = Math.max(totalEntradas - entradasVendidas, 0);

      const { error } = await supabase
        .from('eventos')
        .update({
          titulo: formularioEvento.titulo,
          descripcion: formularioEvento.descripcion,
          ubicacion: formularioEvento.ubicacion,
          precio: parseFloat(formularioEvento.precio),
          total_entradas: totalEntradas,
          entradas_disponibles: entradasDisponibles,
        })
        .eq('id', editandoEvento.id);

      if (error) throw error;
      setEditandoEvento(null);
      setFormularioEvento({
        titulo: '',
        descripcion: '',
        ubicacion: '',
        precio: '',
        total_entradas: '',
      });
      await cargarEventosPorFecha();
      alert('Evento actualizado exitosamente');
    } catch (error) {
      console.error('Error editando evento:', error);
      alert('Error al editar el evento');
    }
  }

  async function eliminarEvento(id: string) {
    if (!confirm('¿Está seguro de que desea eliminar este evento?')) return;

    try {
      const { error } = await supabase.from('eventos').delete().eq('id', id);
      if (error) throw error;
      await cargarEventosPorFecha();
    } catch (error) {
      console.error('Error eliminando evento:', error);
      alert('Error al eliminar el evento');
    }
  }

  function abrirEdicion(evento: EventoDetallado) {
    setEditandoEvento(evento);
    setFormularioEvento({
      titulo: evento.titulo,
      descripcion: evento.descripcion,
      ubicacion: evento.ubicacion,
      precio: evento.precio.toString(),
      total_entradas: evento.total_entradas.toString(),
    });
  }

  function cerrarEdicion() {
    setEditandoEvento(null);
    setFormularioEvento({
      titulo: '',
      descripcion: '',
      ubicacion: '',
      precio: '',
      total_entradas: '',
    });
  }

  const perfilesFiltrados =
    filtroRol === 'todos' ? perfiles : perfiles.filter((p) => p.rol === filtroRol);

  return (
    <div className="min-h-screen bg-[#0B0F19] m-0 p-0 overflow-x-hidden">
      {/* Header */}
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
        {/* Sección de Resumen */}
        {seccionAdmin === 'resumen' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Metrica
                titulo="Usuarios Totales"
                valor={estadisticas.usuarios_totales}
                icono="👥"
                descripcion="Registrados en el sistema"
                onClick={() => setSeccionAdmin('usuarios')}
              />
              <Metrica
                titulo="Eventos Totales"
                valor={estadisticas.eventos_totales}
                icono="🎭"
                descripcion="En la plataforma"
                onClick={() => setSeccionAdmin('eventos')}
              />
              <Metrica
                titulo="Entradas Vendidas"
                valor={estadisticas.entradas_vendidas}
                icono="🎟️"
                descripcion="Total de transacciones"
              />
              <Metrica
                titulo="Ingresos Totales"
                valor={formatearDinero(estadisticas.ingresos_total)}
                icono="💰"
                descripcion="Recaudación acumulada"
              />
            </div>

            <div className={glassStyles.panel + ' p-6'}>
              <h2 className="text-xl font-bold text-white mb-6">Eventos Recientes</h2>

              {eventosIniciales.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Evento</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">
                          Organizador
                        </th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Fecha</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Entradas</th>
                        <th className="text-left py-3 px-4 text-slate-400 font-medium">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventosIniciales.map((evento) => {
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
        )}

        {/* Sección de Usuarios */}
        {seccionAdmin === 'usuarios' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
              <button
                onClick={() => setSeccionAdmin('resumen')}
                className="px-4 py-2 rounded-lg text-sm text-white font-medium bg-slate-500/20 border border-slate-500/30 hover:bg-slate-500/30 transition-colors duration-200"
              >
                ← Volver al Dashboard
              </button>
            </div>

            {/* Filtros */}
            <div className="flex gap-3 flex-wrap">
              {(['todos', 'usuario', 'organizador', 'admin'] as const).map((rol) => (
                <button
                  key={rol}
                  onClick={() => setFiltroRol(rol)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    filtroRol === rol
                      ? 'bg-violet-600 text-white shadow-[0_4px_15px_rgba(124,58,237,0.3)]'
                      : 'bg-slate-500/20 text-slate-300 border border-slate-500/30 hover:bg-slate-500/30'
                  }`}
                >
                  {rol === 'todos'
                    ? 'Todos'
                    : rol === 'usuario'
                      ? 'Clientes'
                      : rol === 'organizador'
                        ? 'Organizadores'
                        : 'Administradores'}
                </button>
              ))}
            </div>

            {/* Botón Crear Personal */}
            <button
              onClick={() => setMostraFormularioPersonal(!mostraFormularioPersonal)}
              className={`w-full px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                mostraFormularioPersonal
                  ? 'bg-violet-600 text-white'
                  : `${glassStyles.botonPrimario}`
              }`}
            >
              {mostraFormularioPersonal ? '← Ocultar Formulario' : '+ Crear Personal'}
            </button>

            {/* Formulario Crear Personal */}
            {mostraFormularioPersonal && (
              <div className={glassStyles.panel + ' p-6'}>
                <h3 className="text-lg font-bold text-white mb-4">Crear Nuevo Personal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Correo electrónico"
                    value={formularioPersonal.correo}
                    onChange={(e) =>
                      setFormularioPersonal({ ...formularioPersonal, correo: e.target.value })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <input
                    type="text"
                    placeholder="Nombre Completo"
                    value={formularioPersonal.nombre_completo}
                    onChange={(e) =>
                      setFormularioPersonal({ ...formularioPersonal, nombre_completo: e.target.value })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={formularioPersonal.contrasena}
                    onChange={(e) =>
                      setFormularioPersonal({ ...formularioPersonal, contrasena: e.target.value })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  />
                  <select
                    value={formularioPersonal.rol}
                    onChange={(e) =>
                      setFormularioPersonal({
                        ...formularioPersonal,
                        rol: e.target.value as 'admin' | 'organizador',
                      })
                    }
                    className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                  >
                    <option value="organizador" className="bg-[#0B0F19]">
                      Organizador
                    </option>
                    <option value="admin" className="bg-[#0B0F19]">
                      Administrador
                    </option>
                  </select>
                </div>
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={crearPersonal}
                    disabled={cargando}
                    className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${glassStyles.botonPrimario} ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {cargando ? 'Creando...' : 'Crear Personal'}
                  </button>
                  <button
                    onClick={() => {
                      setMostraFormularioPersonal(false);
                      setFormularioPersonal({
                        correo: '',
                        nombre_completo: '',
                        contrasena: '',
                        rol: 'organizador',
                      });
                    }}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium bg-slate-500/20 border border-slate-500/30 hover:bg-slate-500/30 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Lista de Usuarios */}
            <div className={glassStyles.panel + ' p-6'}>
              {cargando ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Cargando usuarios...</p>
                </div>
              ) : perfilesFiltrados.length > 0 ? (
                <div className="space-y-3">
                  {perfilesFiltrados.map((perfil) =>
                    editandoUsuario?.id === perfil.id ? (
                      // Formulario de edición inline
                      <div
                        key={perfil.id}
                        className="p-4 bg-violet-500/10 rounded-lg border border-violet-500/30 space-y-3"
                      >
                        <h4 className="text-white font-bold">Editar Usuario</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <input
                            type="text"
                            placeholder="Nombre Completo"
                            value={formularioEdicionUsuario.nombre_completo}
                            onChange={(e) =>
                              setFormularioEdicionUsuario({
                                ...formularioEdicionUsuario,
                                nombre_completo: e.target.value,
                              })
                            }
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                          />
                          <input
                            type="email"
                            placeholder="Correo Electrónico"
                            value={formularioEdicionUsuario.correo}
                            onChange={(e) =>
                              setFormularioEdicionUsuario({
                                ...formularioEdicionUsuario,
                                correo: e.target.value,
                              })
                            }
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                          />
                          <select
                            value={formularioEdicionUsuario.rol}
                            onChange={(e) =>
                              setFormularioEdicionUsuario({
                                ...formularioEdicionUsuario,
                                rol: e.target.value as 'admin' | 'organizador' | 'usuario',
                              })
                            }
                            className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                          >
                            <option value="usuario" className="bg-[#0B0F19]">
                              Cliente
                            </option>
                            <option value="organizador" className="bg-[#0B0F19]">
                              Organizador
                            </option>
                            <option value="admin" className="bg-[#0B0F19]">
                              Administrador
                            </option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={guardarEdicionUsuario}
                            className="flex-1 px-3 py-1.5 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg text-sm font-medium hover:bg-green-500/30 transition-colors"
                          >
                            Guardar
                          </button>
                          <button
                            onClick={cerrarEdicionUsuario}
                            className="flex-1 px-3 py-1.5 bg-slate-500/20 text-slate-400 border border-slate-500/30 rounded-lg text-sm font-medium hover:bg-slate-500/30 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Vista normal del usuario
                      <div
                        key={perfil.id}
                        className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      >
                        <div>
                          <p className="text-white font-medium">{perfil.nombre_completo || 'Sin nombre'}</p>
                          <p className="text-slate-400 text-sm">{perfil.correo}</p>
                          <p className="text-slate-500 text-xs mt-1">
                            Rol:{' '}
                            <span className="text-slate-400 font-medium">
                              {perfil.rol === 'usuario'
                                ? 'Cliente'
                                : perfil.rol === 'organizador'
                                  ? 'Organizador'
                                  : 'Administrador'}
                            </span>
                            {' | Estado: '}
                            <span
                              className={`font-medium ${perfil.activo ? 'text-green-400' : 'text-red-400'}`}
                            >
                              {perfil.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => abrirEdicionUsuario(perfil)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                          >
                            Editar
                          </button>
                          {perfil.rol === 'usuario' ? (
                            <button
                              onClick={() => eliminarPerfil(perfil.id)}
                              className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                            >
                              Eliminar
                            </button>
                          ) : (
                            <button
                              onClick={() => toggleActivoPerfil(perfil.id, perfil.activo)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                                perfil.activo
                                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/30 hover:bg-orange-500/30'
                                  : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
                              }`}
                            >
                              {perfil.activo ? 'Desactivar' : 'Activar'}
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No hay usuarios con este filtro</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sección de Eventos */}
        {seccionAdmin === 'eventos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Gestión de Eventos</h2>
              <button
                onClick={() => setSeccionAdmin('resumen')}
                className="px-4 py-2 rounded-lg text-sm text-white font-medium bg-slate-500/20 border border-slate-500/30 hover:bg-slate-500/30 transition-colors duration-200"
              >
                ← Volver al Dashboard
              </button>
            </div>

            {/* Selector de Fecha */}
            <div className={glassStyles.panel + ' p-6'}>
              <label className="block text-white font-medium mb-3">Seleccionar Fecha</label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
              />
              <p className="text-slate-400 text-sm mt-2">
                Mostrando eventos del{' '}
                {new Date(fechaSeleccionada).toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric',
                })}
              </p>
            </div>

            {/* Formulario para Crear/Editar Evento */}
            <div className={glassStyles.panel + ' p-6'}>
              <h3 className="text-lg font-bold text-white mb-4">
                {editandoEvento ? 'Editar Evento' : 'Crear Nuevo Evento'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Título del evento"
                  value={formularioEvento.titulo}
                  onChange={(e) =>
                    setFormularioEvento({ ...formularioEvento, titulo: e.target.value })
                  }
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
                <input
                  type="text"
                  placeholder="Ubicación"
                  value={formularioEvento.ubicacion}
                  onChange={(e) =>
                    setFormularioEvento({ ...formularioEvento, ubicacion: e.target.value })
                  }
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
                <input
                  type="number"
                  placeholder="Precio (Bs)"
                  value={formularioEvento.precio}
                  onChange={(e) =>
                    setFormularioEvento({ ...formularioEvento, precio: e.target.value })
                  }
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
                <input
                  type="number"
                  placeholder="Total de entradas"
                  value={formularioEvento.total_entradas}
                  onChange={(e) =>
                    setFormularioEvento({ ...formularioEvento, total_entradas: e.target.value })
                  }
                  className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                />
              </div>
              <textarea
                placeholder="Descripción"
                value={formularioEvento.descripcion}
                onChange={(e) =>
                  setFormularioEvento({ ...formularioEvento, descripcion: e.target.value })
                }
                className="w-full mt-4 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20"
                rows={3}
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={editandoEvento ? editarEvento : crearEvento}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${glassStyles.botonPrimario}`}
                >
                  {editandoEvento ? 'Guardar Cambios' : 'Crear Evento'}
                </button>
                {editandoEvento && (
                  <button
                    onClick={cerrarEdicion}
                    className="flex-1 px-4 py-2 rounded-lg text-white font-medium bg-slate-500/20 border border-slate-500/30 hover:bg-slate-500/30 transition-colors"
                  >
                    Cancelar
                  </button>
                )}
              </div>
            </div>

            {/* Lista de Eventos por Fecha */}
            <div className={glassStyles.panel + ' p-6'}>
              <h3 className="text-lg font-bold text-white mb-4">Eventos del Día</h3>
              {cargando ? (
                <div className="text-center py-8">
                  <p className="text-slate-400">Cargando eventos...</p>
                </div>
              ) : eventosFecha.length > 0 ? (
                <div className="space-y-3">
                  {eventosFecha.map((evento) => (
                    <div
                      key={evento.id}
                      className="p-4 bg-white/5 rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="text-white font-bold mb-2">{evento.titulo}</h4>
                          <p className="text-slate-400 text-sm mb-2">{evento.descripcion}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                              <p className="text-slate-500">Ubicación</p>
                              <p className="text-white font-medium">{evento.ubicacion}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Precio</p>
                              <p className="text-white font-medium">{formatearDinero(evento.precio)}</p>
                            </div>
                            <div>
                              <p className="text-slate-500">Entradas</p>
                              <p className="text-white font-medium">
                                {evento.entradas_disponibles}/{evento.total_entradas}
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => abrirEdicion(evento)}
                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg text-sm font-medium hover:bg-blue-500/30 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => eliminarEvento(evento.id)}
                            className="px-3 py-1.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-sm font-medium hover:bg-red-500/30 transition-colors"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400">No hay eventos para esta fecha</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
