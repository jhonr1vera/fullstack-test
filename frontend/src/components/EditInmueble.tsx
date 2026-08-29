import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { VALIDATION_TEXTS } from '../constants/validators.js';
import { handleEnterTransition } from '../shared/utils/keyboard.js';
import type { Inmueble, TipoInmueble } from '../types/inmuebles.js';

interface EditInmuebleProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  propertyTypes: TipoInmueble[];
  property: Inmueble | null;
}

interface ValidationErrors {
  propertyTypeId?: string;
  address?: string;
  price?: string;
  rooms?: string;
  area?: string;
}

export default function EditInmueble({
  isOpen,
  onClose,
  onSuccess,
  propertyTypes,
  property,
}: EditInmuebleProps) {
  if (!isOpen || !property) return null;

  const [propertyTypeId, setPropertyTypeId] = useState('');
  const [address, setAddress] = useState('');
  const [price, setPrice] = useState<number | ''>('');
  const [rooms, setRooms] = useState<number | ''>('');
  const [area, setArea] = useState<number | ''>('');

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (property) {
      setPropertyTypeId(property.tipoInmuebleId);
      setAddress(property.direccion);
      setPrice(property.precio);
      setRooms(property.habitaciones);
      setArea(property.metrosCuadrados);
      setServerError(null);
      setValidationErrors({});
    }
  }, [property]);

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (!propertyTypeId) {
      errors.propertyTypeId = VALIDATION_TEXTS.typeRequired;
    }

    if (!address.trim()) {
      errors.address = VALIDATION_TEXTS.addressRequired;
    }

    if (price === '' || price <= 0 || !Number.isInteger(price)) {
      errors.price = VALIDATION_TEXTS.pricePositive;
    }

    if (rooms === '' || rooms < 0 || !Number.isInteger(rooms)) {
      errors.rooms = VALIDATION_TEXTS.roomsNonNegative;
    }

    if (area === '' || area <= 0 || !Number.isInteger(area)) {
      errors.area = VALIDATION_TEXTS.areaPositive;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError(null);
    setValidationErrors({});

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await api.patch(`/inmuebles/${property.id}`, {
        direccion: address.trim(),
        precio: Number(price),
        habitaciones: Number(rooms),
        metrosCuadrados: Number(area),
        tipoInmuebleId: propertyTypeId,
      });

      alert(INMUEBLES_TEXTS.editModal.success);
      onSuccess();
      onClose();
    } catch (err: any) {
      const message = err?.response?.data?.message || INMUEBLES_TEXTS.editModal.error;
      setServerError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex justify-between items-center border-b border-slate-850 pb-4">
          <h2 className="text-xl font-bold text-white">{INMUEBLES_TEXTS.editModal.title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-850 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {serverError && (
          <div className="flex items-start gap-3 bg-red-950/40 border border-red-900/50 rounded-xl p-4 text-red-300 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-400 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400">{INMUEBLES_TEXTS.modal.typeLabel}</label>
            <select
              id="edit-type-select"
              value={propertyTypeId}
              onChange={(e) => setPropertyTypeId(e.target.value)}
              className={`w-full bg-slate-950 border ${
                validationErrors.propertyTypeId ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-all`}
            >
              <option value="">{INMUEBLES_TEXTS.modal.typePlaceholder}</option>
              {propertyTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            {validationErrors.propertyTypeId && (
              <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{validationErrors.propertyTypeId}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400">{INMUEBLES_TEXTS.modal.addressLabel}</label>
            <input
              id="edit-address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyDown={(e) => handleEnterTransition(e, 'edit-price-input')}
              placeholder={INMUEBLES_TEXTS.modal.addressPlaceholder}
              className={`w-full bg-slate-950 border ${
                validationErrors.address ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`}
            />
            {validationErrors.address && (
              <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{validationErrors.address}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400">{INMUEBLES_TEXTS.modal.priceLabel}</label>
            <input
              id="edit-price-input"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
              onKeyDown={(e) => handleEnterTransition(e, 'edit-rooms-input')}
              placeholder={INMUEBLES_TEXTS.modal.pricePlaceholder}
              className={`w-full bg-slate-950 border ${
                validationErrors.price ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
              } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all`}
            />
            {validationErrors.price && (
              <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{validationErrors.price}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">{INMUEBLES_TEXTS.modal.roomsLabel}</label>
              <input
                id="edit-rooms-input"
                type="number"
                value={rooms}
                onChange={(e) => setRooms(e.target.value === '' ? '' : Number(e.target.value))}
                onKeyDown={(e) => handleEnterTransition(e, 'edit-area-input')}
                placeholder="2"
                className={`w-full bg-slate-950 border ${
                  validationErrors.rooms ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
                } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none transition-all`}
              />
              {validationErrors.rooms && (
                <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{validationErrors.rooms}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase text-slate-400">{INMUEBLES_TEXTS.modal.areaLabel}</label>
              <input
                id="edit-area-input"
                type="number"
                value={area}
                onChange={(e) => setArea(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="60"
                className={`w-full bg-slate-950 border ${
                  validationErrors.area ? 'border-red-500' : 'border-slate-800 focus:border-indigo-500'
                } rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none transition-all`}
              />
              {validationErrors.area && (
                <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" />{validationErrors.area}</p>
              )}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-850">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 font-semibold px-4 py-2 rounded-xl text-sm transition-all"
            >
              {INMUEBLES_TEXTS.modal.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-5 py-2 rounded-xl text-sm shadow-lg shadow-indigo-600/10 transition-all disabled:opacity-50"
            >
              {isSubmitting ? INMUEBLES_TEXTS.editModal.submitting : INMUEBLES_TEXTS.editModal.submit}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
