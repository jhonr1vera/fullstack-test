import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Home, Users, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { USUARIOS_TEXTS } from '../constants/usuarios.js';
import UserItem, { type UserListData } from '../components/UserItem.js';
import PageSizeSelector from '../components/PageSizeSelector.js';
import type { PaginacionMeta } from '../types/inmuebles.js';

export default function UserList() {
  const { user, logout } = useAuth();

  // Estados de paginación
  const [users, setUsers] = useState<UserListData[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.get<{ data: UserListData[]; meta: PaginacionMeta }>('/usuarios', {
        params: {
          page,
          limit,
        },
      });
      setUsers(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      const message = err?.response?.data?.message || USUARIOS_TEXTS.list.error;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      
      {/* Header unificado con navegación */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Users className="w-8 h-8 text-indigo-500" />
              <h1 className="text-xl font-black tracking-tight text-white">
                {USUARIOS_TEXTS.header.title}
              </h1>
            </div>
            {/* Navegación entre vistas */}
            <nav className="flex items-center gap-4 border-l border-slate-850 pl-6 text-sm font-semibold">
              <Link
                to="/inmuebles"
                className="text-slate-400 hover:text-white transition-colors"
              >
                {USUARIOS_TEXTS.header.navInmuebles}
              </Link>
              <Link
                to="/usuarios"
                className="text-indigo-400 cursor-default"
              >
                {USUARIOS_TEXTS.header.navAgents}
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden md:inline">
              {USUARIOS_TEXTS.header.welcome} <strong className="text-slate-200">{user?.nombre}</strong>
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-sm font-semibold border border-slate-850 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{USUARIOS_TEXTS.header.logoutButton}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Listado principal */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        
        {isLoading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
            <p className="text-slate-400 text-sm">{USUARIOS_TEXTS.list.loading}</p>
          </div>
        ) : error ? (
          <div className="min-h-[400px] flex items-center justify-center text-red-400 font-semibold text-center border border-red-900/30 rounded-2xl bg-red-950/10 p-8 animate-fade-in">
            {error}
          </div>
        ) : users.length === 0 ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 p-8">
            <Home className="w-12 h-12 text-slate-650 mb-3" />
            <p className="text-slate-400 font-medium">{USUARIOS_TEXTS.list.empty}</p>
          </div>
        ) : (
          <>
            {/* detalle de Usuario */}
            <div className="flex flex-col gap-4">
              {users.map((userData) => (
                <UserItem key={userData.id} userData={userData} />
              ))}
            </div>

            {/* Paginación */}
            {meta && (
              <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 rounded-xl px-6 py-4 mt-8 animate-in fade-in duration-200">
                <PageSizeSelector
                  pageSize={limit}
                  onChange={(size) => {
                    setLimit(size);
                    setPage(1);
                  }}
                />

                {meta.totalPages > 1 && (
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-slate-400">
                      {USUARIOS_TEXTS.pagination.pageLabel} <strong className="text-slate-200">{meta.page}</strong> {USUARIOS_TEXTS.pagination.ofLabel} <strong className="text-slate-200">{meta.totalPages}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={meta.page === 1}
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 disabled:opacity-30 disabled:pointer-events-none p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => setPage((prev) => Math.min(prev + 1, meta.totalPages))}
                        disabled={meta.page === meta.totalPages}
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-355 disabled:opacity-30 disabled:pointer-events-none p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}
