"use server";

import { EventoModelo, EntradaModelo, PerfilModelo } from '../models/db';

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