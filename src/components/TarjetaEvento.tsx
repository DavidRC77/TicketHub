import React from 'react';
import { glassStyles } from './ui/glassStyles';

interface EventoProps {
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

export const TarjetaEvento: React.FC<EventoProps> = ({
    titulo,
    categoria,
    ubicacion,
    fecha,
    precio,
    entradasDisponibles,
    totalEntradas,
    urlImagen,
    calificacion = 5.0
}) => {
    const porcentajeVendido = Math.round(((totalEntradas - entradasDisponibles) / totalEntradas) * 100);

    return (
        <div className={glassStyles.tarjeta}>
            <div className="relative h-48 w-full overflow-hidden rounded-t-xl bg-slate-900">
                <img
                    src={urlImagen || "/placeholder-evento.jpg"}
                    alt={titulo}
                    className="h-full w-full object-cover opacity-80"
                />
                <span className="absolute top-3 left-3 bg-violet-900/80 backdrop-blur-md text-violet-300 text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    🎵 {categoria}
                </span>
                <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-amber-400 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                    ⭐ {calificacion.toFixed(1)}
                </span>
            </div>

            <div className="p-5">
                <h3 className="text-xl font-bold text-white tracking-tight line-clamp-1">{titulo}</h3>
                <p className={`${glassStyles.textoMuted} mt-1 flex items-center gap-1`}>
                    📍 {ubicacion}
                </p>

                <div className="mt-4 flex justify-between text-xs text-slate-300 border-t border-white/5 pt-3">
                    <div>📅 {fecha}</div>
                    <div className="text-right text-lg font-bold text-violet-400">Bs {precio}</div>
                </div>

                <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                        <span className={glassStyles.textoMuted}>{entradasDisponibles} entradas disponibles</span>
                        <span className="text-indigo-400 font-medium">{porcentajeVendido}% vendido</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-1.5 rounded-full"
                            style={{ width: `${porcentajeVendido}%` }}
                        ></div>
                    </div>
                </div>

                <button className={`w-full mt-5 py-3 rounded-xl flex items-center justify-center gap-2 ${glassStyles.botonPrimario}`}>
                    🎟️ Comprar Entradas
                </button>
            </div>
        </div>
    );
};