import { Trash2, Check, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { EstadosInmuebleEnum } from '../types/inmuebles.js';
import type { Inmueble } from '../types/inmuebles.js';

interface InmuebleItemProps {
  property: Inmueble;
  onDetailClick: (property: Inmueble) => void;
  onEditClick: (property: Inmueble) => void;
  onStatusChange: (id: string, newStatus: EstadosInmuebleEnum) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating: boolean;
}

export default function InmuebleItem({
  property,
  onDetailClick,
  onEditClick,
  onStatusChange,
  onDelete,
  isUpdating,
}: InmuebleItemProps) {
  const { user } = useAuth();
  const isOwner = user?.id === property.vendedorId;

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
  if (property.estado === EstadosInmuebleEnum.RESERVADO) {
    statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
  } else if (property.estado === EstadosInmuebleEnum.VENDIDO) {
    statusColor = 'bg-slate-700/20 text-slate-400 border-slate-700/20';
  }

  return (
    <div
      className={`bg-slate-900/30 border ${
        isOwner ? 'border-slate-800' : 'border-slate-900'
      } rounded-2xl p-6 flex flex-col justify-between hover:shadow-xl transition-all relative overflow-hidden`}
    >
      {isOwner && (
        <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 border-l border-b border-indigo-500/20 text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-bl-xl">
          {INMUEBLES_TEXTS.list.ownBadge}
        </div>
      )}

      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
            {property.tipoInmueble.nombre}
          </span>
          <span className={`text-xs border font-semibold px-2.5 py-1 rounded-md ${statusColor}`}>
            {property.estado === EstadosInmuebleEnum.DISPONIBLE && INMUEBLES_TEXTS.status.disponible}
            {property.estado === EstadosInmuebleEnum.RESERVADO && INMUEBLES_TEXTS.status.reservado}
            {property.estado === EstadosInmuebleEnum.VENDIDO && INMUEBLES_TEXTS.status.vendido}
          </span>
        </div>

        <h3
          onClick={() => onDetailClick(property)}
          className="font-bold text-lg text-slate-100 hover:text-indigo-400 line-clamp-1 cursor-pointer transition-colors"
        >
          {property.direccion}
        </h3>

        <div className="text-2xl font-black text-white">
          {formatPrice(property.precio)}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{property.habitaciones} {INMUEBLES_TEXTS.list.rooms}</span>
          <span>•</span>
          <span>{property.metrosCuadrados} {INMUEBLES_TEXTS.list.area}</span>
        </div>

        <div className="border-t border-slate-900/60 pt-4 flex flex-col gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-500">{INMUEBLES_TEXTS.list.agentTitle}</span>
          <span className="text-sm font-medium text-slate-300">{property.vendedor.nombre}</span>
          <span className="text-xs text-slate-500">{property.vendedor.email}</span>
        </div>
      </div>

      {isOwner && (
        <div className="border-t border-slate-900/60 mt-6 pt-4 flex flex-wrap gap-2 justify-end">
          {property.estado !== EstadosInmuebleEnum.VENDIDO && (
            <button
              onClick={() => onEditClick(property)}
              className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-300 font-bold px-3.5 py-2 rounded-xl text-xs transition-all cursor-pointer"
            >
              {INMUEBLES_TEXTS.editModal.title}
            </button>
          )}

          {property.estado === EstadosInmuebleEnum.DISPONIBLE && (
            <button
              disabled={isUpdating}
              onClick={() => onStatusChange(property.id, EstadosInmuebleEnum.RESERVADO)}
              className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{INMUEBLES_TEXTS.actions.reserve}</span>
            </button>
          )}

          {property.estado === EstadosInmuebleEnum.RESERVADO && (
            <>
              <button
                disabled={isUpdating}
                onClick={() => onStatusChange(property.id, EstadosInmuebleEnum.DISPONIBLE)}
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{INMUEBLES_TEXTS.actions.release}</span>
              </button>
              <button
                disabled={isUpdating}
                onClick={() => onStatusChange(property.id, EstadosInmuebleEnum.VENDIDO)}
                className="bg-slate-700 hover:bg-slate-650 active:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{INMUEBLES_TEXTS.actions.sell}</span>
              </button>
            </>
          )}

          {property.estado !== EstadosInmuebleEnum.VENDIDO && (
            <button
              disabled={isUpdating}
              onClick={() => onDelete(property.id)}
              className="bg-red-950/20 hover:bg-red-950/45 text-red-400 border border-red-900/30 hover:border-red-900/60 p-2 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title={INMUEBLES_TEXTS.actions.deleteTooltip}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
