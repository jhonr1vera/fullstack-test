import { X, Trash2, Check, RefreshCw, Calendar, MapPin, User, Mail, DollarSign } from 'lucide-react';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { EstadosInmuebleEnum } from '../types/inmuebles.js';
import { useAuth } from '../context/AuthContext.js';
import type { Inmueble } from '../types/inmuebles.js';

interface InmuebleDetalleProps {
  isOpen: boolean;
  onClose: () => void;
  property: Inmueble | null;
  onEditClick: (property: Inmueble) => void;
  onStatusChange: (id: string, newStatus: EstadosInmuebleEnum) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  isUpdating: boolean;
}

export default function InmuebleDetalle({
  isOpen,
  onClose,
  property,
  onEditClick,
  onStatusChange,
  onDelete,
  isUpdating,
}: InmuebleDetalleProps) {
  const { user } = useAuth();
  if (!isOpen || !property) return null;

  const isOwner = user?.id === property.vendedorId;
  const publishDate = new Date(property.createdAt).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

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

  const handleDeleteClick = async () => {
    await onDelete(property.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-850 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-black tracking-wider text-indigo-400 bg-indigo-500/5 px-2.5 py-1 rounded-md border border-indigo-500/10">
              {property.tipoInmueble.nombre}
            </span>
            <span className={`text-xs border font-semibold px-2.5 py-1 rounded-md ${statusColor}`}>
              {property.estado === EstadosInmuebleEnum.DISPONIBLE && INMUEBLES_TEXTS.status.disponible}
              {property.estado === EstadosInmuebleEnum.RESERVADO && INMUEBLES_TEXTS.status.reservado}
              {property.estado === EstadosInmuebleEnum.VENDIDO && INMUEBLES_TEXTS.status.vendido}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-slate-400">
              <MapPin className="w-4 h-4 text-slate-500" />
              <span className="text-xs uppercase font-bold tracking-wider">{INMUEBLES_TEXTS.filters.searchLabel}</span>
            </div>
            <h3 className="text-2xl font-black text-white">{property.direccion}</h3>
          </div>

          <div className="grid grid-cols-2 gap-6 bg-slate-950/40 border border-slate-850 rounded-2xl p-4">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-500">{INMUEBLES_TEXTS.modal.priceLabel}</span>
              <div className="text-2xl font-black text-indigo-400 flex items-center gap-1">
                <DollarSign className="w-5 h-5 shrink-0" />
                <span>{formatPrice(property.precio).replace('$', '')}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center border-l border-slate-850 pl-6">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">{INMUEBLES_TEXTS.modal.roomsLabel}</span>
                <div className="text-xl font-bold text-white">{property.habitaciones}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Área</span>
                <div className="text-xl font-bold text-white">{property.metrosCuadrados} m²</div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-850 pt-4 space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" />
              <span>{INMUEBLES_TEXTS.detail.sellerInfo}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-950/20 border border-slate-850/50 rounded-xl p-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500">Nombre</span>
                <div className="font-semibold text-slate-200">{property.vendedor.nombre}</div>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                  <span>Email</span>
                </span>
                <div className="text-slate-300 font-medium break-all">{property.vendedor.email}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{INMUEBLES_TEXTS.detail.dateLabel}: <strong>{publishDate}</strong></span>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center pt-4 border-t border-slate-850">
          <div>
            {isOwner && property.estado !== EstadosInmuebleEnum.VENDIDO && (
              <button
                onClick={() => onEditClick(property)}
                className="bg-indigo-650/10 hover:bg-indigo-650/20 text-indigo-400 border border-indigo-900/30 hover:border-indigo-900/60 px-4.5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                {INMUEBLES_TEXTS.editModal.title}
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                {property.estado === EstadosInmuebleEnum.DISPONIBLE && (
                  <button
                    disabled={isUpdating}
                    onClick={() => onStatusChange(property.id, EstadosInmuebleEnum.RESERVADO)}
                    className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                      className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{INMUEBLES_TEXTS.actions.release}</span>
                    </button>
                    <button
                      disabled={isUpdating}
                      onClick={() => onStatusChange(property.id, EstadosInmuebleEnum.VENDIDO)}
                      className="bg-slate-700 hover:bg-slate-655 active:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{INMUEBLES_TEXTS.actions.sell}</span>
                    </button>
                  </>
                )}

                {property.estado !== EstadosInmuebleEnum.VENDIDO && (
                  <button
                    disabled={isUpdating}
                    onClick={handleDeleteClick}
                    className="bg-red-950/20 hover:bg-red-950/45 text-red-400 border border-red-900/30 hover:border-red-900/60 p-2.5 rounded-xl transition-all cursor-pointer disabled:opacity-50"
                    title={INMUEBLES_TEXTS.actions.deleteTooltip}
                  >
                    <Trash2 className="w-4.5 h-4.5" />
                  </button>
                )}
              </>
            )}
            <button
              onClick={onClose}
              className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-355 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            >
              {INMUEBLES_TEXTS.detail.close}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
