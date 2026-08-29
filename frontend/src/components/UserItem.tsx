import { Mail, Calendar, User } from 'lucide-react';
import { USUARIOS_TEXTS } from '../constants/usuarios.js';

export interface UserListData {
  id: string;
  nombre: string;
  email: string;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface UserItemProps {
  userData: UserListData;
}

export default function UserItem({ userData }: UserItemProps) {
  // Iniciales del nombre para el avatar
  const initials = userData.nombre
    .split(' ')
    .map((word) => word[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const formattedDate = new Date(userData.createdAt).toLocaleDateString('es-VE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-xl transition-all relative overflow-hidden ${
        !userData.activo ? 'opacity-40 saturate-50 bg-slate-950/40 border-slate-950' : ''
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl bg-indigo-650/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-black tracking-wider text-sm select-none">
          {initials || <User className="w-5 h-5" />}
        </div>

        <div className="space-y-1">
          {/* Nombre y Badge de Estado */}
          <div className="flex items-center gap-2.5">
            <h3 className="font-bold text-base text-slate-100">{userData.nombre}</h3>
            <span
              className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md border ${
                userData.activo
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}
            >
              {userData.activo ? USUARIOS_TEXTS.list.statusActive : USUARIOS_TEXTS.list.statusInactive}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium break-all">
            <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>{userData.email}</span>
          </div>
        </div>
      </div>

      {/* Fecha de registro */}
      <div className="flex items-center gap-1.5 text-xs text-slate-550 sm:text-right self-end sm:self-auto">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>Registrado el <strong>{formattedDate}</strong></span>
      </div>
    </div>
  );
}
