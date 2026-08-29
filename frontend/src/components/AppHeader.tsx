import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, Users, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { USUARIOS_TEXTS } from '../constants/usuarios.js';
import MiPerfil from './MiPerfil.js';

type ActiveView = 'inmuebles' | 'usuarios';

interface AppHeaderProps {
  activeView: ActiveView;
  maxWidth?: string;
  /** Slot opcional: botón de acción extra (ej. "Crear Inmueble") */
  action?: React.ReactNode;
}

export default function AppHeader({
  activeView,
  maxWidth = 'max-w-7xl',
  action,
}: AppHeaderProps) {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className={`${maxWidth} mx-auto px-4 py-4 flex justify-between items-center`}>

          {/* Logo + Navegación */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {activeView === 'inmuebles'
                ? <Home className="w-8 h-8 text-indigo-500" />
                : <Users className="w-8 h-8 text-indigo-500" />
              }
              <h1 className="text-2xl font-black tracking-tight text-white">
                {activeView === 'inmuebles'
                  ? INMUEBLES_TEXTS.header.title
                  : USUARIOS_TEXTS.header.title
                }
              </h1>
            </div>

            <nav className="flex items-center gap-4 border-l border-slate-850 pl-6 text-sm font-semibold">
              {activeView === 'inmuebles' ? (
                <>
                  <span className="text-indigo-400 cursor-default">{INMUEBLES_TEXTS.header.navInmuebles}</span>
                  <Link to="/usuarios" className="text-slate-400 hover:text-white transition-colors">
                    {INMUEBLES_TEXTS.header.navAgents}
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/inmuebles" className="text-slate-400 hover:text-white transition-colors">
                    {USUARIOS_TEXTS.header.navInmuebles}
                  </Link>
                  <span className="text-indigo-400 cursor-default">{USUARIOS_TEXTS.header.navAgents}</span>
                </>
              )}
            </nav>
          </div>

          {/* Acciones */}
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:inline">
              {INMUEBLES_TEXTS.header.welcome}{' '}
              <strong className="text-slate-200">{user?.nombre}</strong>
            </span>

            {/* Slot para acción extra (ej. Crear Inmueble) */}
            {action}

            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-slate-850 transition-all cursor-pointer"
            >
              <UserCircle className="w-4 h-4" />
              <span className="hidden sm:inline">{USUARIOS_TEXTS.profile.title}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-slate-850 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{INMUEBLES_TEXTS.header.logoutButton}</span>
            </button>
          </div>

        </div>
      </header>

      <MiPerfil isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
    </>
  );
}
