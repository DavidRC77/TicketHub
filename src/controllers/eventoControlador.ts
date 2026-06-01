import { EventoModelo, EntradaModelo, PerfilModelo } from '../models/db';
import {
  createEvent,
  deleteEvent,
  getAllEvents,
  getEventById,
  getEventsByOrganizer,
  updateEvent,
} from '@/models/Event';
import { isAdmin, isOrganizer } from '@/lib/rbac';
import { ApiResponse, Event, UserRole } from '@/types';

export const EventoControlador = {
  async procesarCreacionEvento(formData: {
    titulo: string;
    descripcion: string;
    categoria: string;
    ubicacion: string;
    fecha: string;
    precio: number;
    total_entradas: number;
    usuario_id: string;
  }) {
    try {
      const perfil = await PerfilModelo.obtenerPorId(formData.usuario_id);
      
      if (!perfil || (perfil.rol !== 'admin' && perfil.rol !== 'organizador')) {
        return {
          exito: false,
          mensaje: "Acceso denegado: No tienes permisos de organizador para crear eventos."
        };
      }

      if (formData.precio < 0) {
        return { exito: false, mensaje: "El precio del evento no puede ser menor a 0 Bs." };
      }
      if (formData.total_entradas <= 0) {
        return { exito: false, mensaje: "El aforo total debe ser de al menos 1 entrada." };
      }

      const nuevoEvento = await EventoModelo.crear({
        titulo: formData.titulo,
        descripcion: formData.descripcion,
        categoria: formData.categoria,
        ubicacion: formData.ubicacion,
        fecha: formData.fecha,
        precio: formData.precio,
        total_entradas: formData.total_entradas,
        creado_por: formData.usuario_id
      });

      return {
        exito: true,
        mensaje: "Evento publicado exitosamente en la cartelera.",
        datos: nuevoEvento
      };

    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.message || "Ocurrió un error inesperado al registrar el evento."
      };
    }
  },

  async procesarAdquisicionEntrada(eventoId: string, usuarioId: string) {
    try {
      if (!usuarioId) {
        return {
          exito: false,
          mensaje: "Debe iniciar sesión para adquirir una entrada."
        };
      }

      const nuevaEntrada = await EntradaModelo.registrarCompra(eventoId, usuarioId);

      return {
        exito: true,
        mensaje: "¡Boleto adquirido con éxito! Su pase digital ha sido generado.",
        datos: nuevaEntrada
      };

    } catch (error: any) {
      return {
        exito: false,
        mensaje: error.message || "Error al procesar la reserva del boleto."
      };
    }
  }
};

export const fetchAllEvents = async (): Promise<ApiResponse<Event[]>> => {
  const eventos = await getAllEvents();
  return { success: true, data: eventos };
};

export const fetchEventById = async (eventId: string): Promise<ApiResponse<Event>> => {
  const evento = await getEventById(eventId);

  if (!evento) {
    return {
      success: false,
      error: 'Evento no encontrado',
      code: 'EVENTO_NO_ENCONTRADO',
    };
  }

  return { success: true, data: evento };
};

export const fetchUserEvents = async (organizerId: string): Promise<ApiResponse<Event[]>> => {
  const eventos = await getEventsByOrganizer(organizerId);
  return { success: true, data: eventos };
};

export const createNewEvent = async (
  titulo: string,
  descripcion: string,
  fecha: string,
  ubicacion: string,
  categoria: string,
  precio: number,
  total_entradas: number,
  userId: string,
  userRole: UserRole
): Promise<ApiResponse<Event>> => {
  if (!isOrganizer(userRole)) {
    return {
      success: false,
      error: 'No tiene permisos para crear eventos',
      code: 'SIN_PERMISOS',
    };
  }

  const evento = await createEvent(titulo, descripcion, fecha, ubicacion, categoria, precio, total_entradas, userId);

  if (!evento) {
    return {
      success: false,
      error: 'No se pudo crear el evento',
      code: 'CREACION_FALLIDA',
    };
  }

  return { success: true, data: evento };
};

export const modifyEvent = async (
  eventId: string,
  updates: Partial<Event>,
  _userId: string,
  userRole: UserRole
): Promise<ApiResponse<Event>> => {
  if (!isOrganizer(userRole)) {
    return {
      success: false,
      error: 'No tiene permisos para editar eventos',
      code: 'SIN_PERMISOS',
    };
  }

  const evento = await updateEvent(eventId, updates);

  if (!evento) {
    return {
      success: false,
      error: 'No se pudo actualizar el evento',
      code: 'ACTUALIZACION_FALLIDA',
    };
  }

  return { success: true, data: evento };
};

export const removeEvent = async (
  eventId: string,
  _userId: string,
  userRole: UserRole
): Promise<ApiResponse<void>> => {
  if (!isAdmin(userRole) && !isOrganizer(userRole)) {
    return {
      success: false,
      error: 'No tiene permisos para eliminar eventos',
      code: 'SIN_PERMISOS',
    };
  }

  const eliminado = await deleteEvent(eventId);

  if (!eliminado) {
    return {
      success: false,
      error: 'No se pudo eliminar el evento',
      code: 'ELIMINACION_FALLIDA',
    };
  }

  return { success: true };
};
