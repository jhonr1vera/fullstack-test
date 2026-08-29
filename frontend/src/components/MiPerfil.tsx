import { useState, useEffect } from 'react';
import { X, AlertCircle, User, Trash2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api.js';
import { USUARIOS_TEXTS } from '../constants/usuarios.js';
import { handleEnterTransition } from '../shared/utils/keyboard.js';
import { useAuth } from '../context/AuthContext.js';

interface MiPerfilProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ValidationErrors {
  nombre?: string;
  email?: string;
  password?: string;
}

export default function MiPerfil({ isOpen, onClose }: MiPerfilProps) {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setNombre(user.nombre);
      setEmail(user.email);
      setPassword('');
      setServerError(null);
      setSuccessMessage(null);
      setValidationErrors({});
      setShowDeleteConfirm(false);
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    if (!nombre.trim()) errors.nombre = 'El nombre es requerido';
    if (!email.trim()) errors.email = 'El correo es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Correo no válido';
    if (password && password.length < 6) errors.password = 'La contraseña debe tener al menos 6 caracteres';
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setServerError(null);
    setSuccessMessage(null);

    const payload: Record<string, string> = {};
    if (nombre !== user.nombre) payload.nombre = nombre;
    if (email !== user.email) payload.email = email;
    if (password) payload.password = password;

    if (Object.keys(payload).length === 0) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await api.patch(`/usuarios/${user.id}`, payload);
      login({ ...user, ...response.data });
      setPassword('');
      onClose();
      alert(USUARIOS_TEXTS.profile.successMessage);
      await logout();
      navigate('/login');
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Error al actualizar el perfil');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/usuarios/${user.id}`);
      await logout();
    } catch (err: any) {
      setServerError(err?.response?.data?.message || 'Error al eliminar la cuenta');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const memberSince = new Date(user.createdAt).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg bg-slate-950 border border-slate-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-900">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black text-sm select-none">
              {user.nombre.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || <User className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-tight">{USUARIOS_TEXTS.profile.title}</h2>
              <p className="text-xs text-slate-500">{USUARIOS_TEXTS.profile.memberSince} <strong className="text-slate-400">{memberSince}</strong></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white p-2 rounded-xl hover:bg-slate-900 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

          {/* Feedback messages */}
          {serverError && (
            <div className="flex items-center gap-2 text-sm text-red-400 bg-red-950/30 border border-red-900/40 rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}
          {successMessage && (
            <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-950/30 border border-emerald-900/40 rounded-xl px-4 py-3">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {USUARIOS_TEXTS.profile.nameLabel}
            </label>
            <input
              id="profile-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => handleEnterTransition(e, 'profile-email')}
              placeholder={USUARIOS_TEXTS.profile.namePlaceholder}
              className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all ${validationErrors.nombre ? 'border-red-600' : 'border-slate-850'}`}
            />
            {validationErrors.nombre && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.nombre}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {USUARIOS_TEXTS.profile.emailLabel}
            </label>
            <input
              id="profile-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => handleEnterTransition(e, 'profile-password')}
              placeholder={USUARIOS_TEXTS.profile.emailPlaceholder}
              className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all ${validationErrors.email ? 'border-red-600' : 'border-slate-850'}`}
            />
            {validationErrors.email && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.email}
              </p>
            )}
          </div>

          {/* Contraseña */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              {USUARIOS_TEXTS.profile.passwordLabel}
            </label>
            <div className="relative">
              <input
                id="profile-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={USUARIOS_TEXTS.profile.passwordPlaceholder}
                className={`w-full bg-slate-900 border rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all ${validationErrors.password ? 'border-red-600' : 'border-slate-850'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {validationErrors.password && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> {validationErrors.password}
              </p>
            )}
          </div>

          {/* Footer actions */}
          <div className="flex flex-col gap-3 pt-2 border-t border-slate-900">

            {/* Aviso de eliminación */}
            {showDeleteConfirm && (
              <div className="bg-red-950/30 border border-red-900/50 rounded-xl px-4 py-3 text-xs text-red-400 space-y-3">
                <p className="font-semibold leading-relaxed">{USUARIOS_TEXTS.profile.deleteConfirm}</p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold px-4 py-1.5 rounded-lg cursor-pointer disabled:opacity-50 transition-all"
                  >
                    {isDeleting ? 'Eliminando...' : 'Sí, eliminar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="text-xs font-semibold text-slate-400 hover:text-white cursor-pointer transition-colors px-2"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              {/* Botón de activar eliminación */}
              {!showDeleteConfirm && (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 text-xs font-semibold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {USUARIOS_TEXTS.profile.deleteButton}
                </button>
              )}
              {showDeleteConfirm && <div />}

              {/* Guardar */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:pointer-events-none text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer"
              >
                {isSubmitting ? USUARIOS_TEXTS.profile.saving : USUARIOS_TEXTS.profile.saveButton}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
