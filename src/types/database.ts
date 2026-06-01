export interface DatabaseProfile {
  id: string;
  correo: string;
  nombre_completo: string | null;
  rol: string;
  activo?: boolean;
  creado_at: string;
  actualizado_at: string;
}

export interface DatabaseEvent {
  id: string;
  titulo: string;
  descripcion: string | null;
  categoria: string;
  ubicacion: string;
  fecha: string;
  precio: number;
  total_entradas: number;
  entradas_disponibles: number;
  creado_por: string;
  creado_at: string;
  actualizado_at: string;
}

export interface DatabaseTicket {
  id: string;
  evento_id: string;
  usuario_id: string;
  estado: string;
  creado_at: string;
  actualizado_at: string;
}
