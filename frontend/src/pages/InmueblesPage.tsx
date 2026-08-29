import { useState, useEffect } from 'react';
import { LogOut, Search, Filter, Trash2, Home, RefreshCw, ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { EstadosInmuebleEnum } from '../types/inmuebles.js';
import type { Inmueble, TipoInmueble, PaginacionMeta } from '../types/inmuebles.js';

export default function InmueblesPage() {
  const { user, logout } = useAuth();

  // Estados de datos
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<TipoInmueble[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);

  // Estados de carga y actualización
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // filtros
  const [search, setSearch] = useState('');
  const [tipoInmuebleId, setTipoInmuebleId] = useState('');
  const [status, setStatus] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [orderBy, setOrderBy] = useState<'precio' | 'createdAt'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  useEffect(() => {
    const loadPropertyTypes = async () => {
      try {
        const response = await api.get<TipoInmueble[]>('/tipos-inmueble');
        setPropertyTypes(response.data);
      } catch (err) {
        console.error('Error al cargar tipos de inmueble:', err);
      }
    };
    loadPropertyTypes();
  }, []);

  // Cargamos inmuebles
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    const queryParams: Record<string, string | number | boolean> = {
      page,
      limit: 6,
    };

    if (search.trim()) queryParams.search = search.trim();
    if (tipoInmuebleId) queryParams.tipoInmuebleId = tipoInmuebleId;
    if (status) queryParams.estado = status;
    if (minPrice !== '') queryParams.precioMin = minPrice;
    if (maxPrice !== '') queryParams.precioMax = maxPrice;
    if (onlyMine) queryParams.soloMios = true;
    queryParams.orderBy = orderBy;
    queryParams.order = order;

    try {
      const response = await api.get<{ data: Inmueble[]; meta: PaginacionMeta }>('/inmuebles', {
        params: queryParams,
      });
      setProperties(response.data.data);
      setMeta(response.data.meta);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Error al obtener los inmuebles';
      setError(message);
      setProperties([]);
      setMeta(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Disparamos carga al mutar filtros o página
  useEffect(() => {
    fetchProperties();
  }, [page, search, tipoInmuebleId, status, minPrice, maxPrice, onlyMine, orderBy, order]);

  const handleFilterChange = () => {
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(INMUEBLES_TEXTS.alerts.deleteConfirm)) {
      return;
    }

    setIsUpdating(id);
    try {
      await api.delete(`/inmuebles/${id}`);
      await fetchProperties();
    } catch (err: any) {
      alert(err?.response?.data?.message || INMUEBLES_TEXTS.alerts.deleteError);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleStatusChange = async (id: string, newStatus: EstadosInmuebleEnum) => {
    setIsUpdating(id);
    try {
      await api.patch(`/inmuebles/${id}/estado`, { estado: newStatus });
      await fetchProperties();
    } catch (err: any) {
      alert(err?.response?.data?.message || INMUEBLES_TEXTS.alerts.statusError);
    } finally {
      setIsUpdating(null);
    }
  };

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Home className="w-8 h-8 text-indigo-500" />
            <h1 className="text-2xl font-black tracking-tight text-white">
              {INMUEBLES_TEXTS.header.title}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-slate-400 text-sm hidden sm:inline">
              {INMUEBLES_TEXTS.header.welcome} <strong className="text-slate-200">{user?.nombre}</strong>
            </span>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filtros */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 h-fit space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
              <Filter className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-lg">{INMUEBLES_TEXTS.filters.title}</h2>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.searchLabel}</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    handleFilterChange();
                  }}
                  placeholder={INMUEBLES_TEXTS.filters.searchPlaceholder}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.type}</label>
              <select
                value={tipoInmuebleId}
                onChange={(e) => {
                  setTipoInmuebleId(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">{INMUEBLES_TEXTS.filters.all}</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.status}</label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  handleFilterChange();
                }}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="">{INMUEBLES_TEXTS.filters.all}</option>
                <option value={EstadosInmuebleEnum.DISPONIBLE}>{INMUEBLES_TEXTS.status.disponible}</option>
                <option value={EstadosInmuebleEnum.RESERVADO}>{INMUEBLES_TEXTS.status.reservado}</option>
                <option value={EstadosInmuebleEnum.VENDIDO}>{INMUEBLES_TEXTS.status.vendido}</option>
              </select>
            </div>

            {/* Filtro de rango de dinero */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.minPrice}</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setMinPrice(val);
                    handleFilterChange();
                  }}
                  placeholder="Min"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.maxPrice}</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => {
                    const val = e.target.value === '' ? '' : Number(e.target.value);
                    setMaxPrice(val);
                    handleFilterChange();
                  }}
                  placeholder="Max"
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Ordenamiento */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.sortBy}</label>
              <select
                value={orderBy}
                onChange={(e) => {
                  setOrderBy(e.target.value as 'precio' | 'createdAt');
                  handleFilterChange();
                }}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="createdAt">{INMUEBLES_TEXTS.filters.dateOption}</option>
                <option value="precio">{INMUEBLES_TEXTS.filters.priceOption}</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.sortOrder}</label>
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value as 'ASC' | 'DESC');
                  handleFilterChange();
                }}
                className="w-full bg-slate-950/60 border border-slate-850 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
              >
                <option value="DESC">{INMUEBLES_TEXTS.filters.descOption}</option>
                <option value="ASC">{INMUEBLES_TEXTS.filters.ascOption}</option>
              </select>
            </div>

            {/* Filtro de true o false para solo mis inmuebles */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="onlyMine"
                checked={onlyMine}
                onChange={(e) => {
                  setOnlyMine(e.target.checked);
                  handleFilterChange();
                }}
                className="w-4 h-4 text-indigo-600 border-slate-800 rounded bg-slate-950 focus:ring-indigo-500/20"
              />
              <label htmlFor="onlyMine" className="text-sm font-medium text-slate-300 cursor-pointer select-none">
                {INMUEBLES_TEXTS.filters.onlyMine}
              </label>
            </div>
          </div>

          {/* Lista */}
          <div className="lg:col-span-3 space-y-8">
            {isLoading ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center gap-4">
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className="text-slate-400 text-sm">{INMUEBLES_TEXTS.list.loading}</p>
              </div>
            ) : error ? (
              <div className="min-h-[400px] flex items-center justify-center text-red-400 font-semibold text-center border border-red-900/30 rounded-2xl bg-red-950/10 p-8">
                {error}
              </div>
            ) : properties.length === 0 ? (
              <div className="min-h-[400px] flex flex-col items-center justify-center text-center border border-dashed border-slate-800 rounded-2xl bg-slate-900/10 p-8">
                <Home className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 font-medium">{INMUEBLES_TEXTS.list.empty}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => {
                    const isOwner = user?.id === property.vendedorId;

                    let statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
                    if (property.estado === EstadosInmuebleEnum.RESERVADO) {
                      statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/25';
                    } else if (property.estado === EstadosInmuebleEnum.VENDIDO) {
                      statusColor = 'bg-slate-700/20 text-slate-400 border-slate-700/20';
                    }

                    return (
                      <div
                        key={property.id}
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

                          <h3 className="font-bold text-lg text-slate-100 line-clamp-1">
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
                            {property.estado === EstadosInmuebleEnum.DISPONIBLE && (
                              <button
                                disabled={isUpdating === property.id}
                                onClick={() => handleStatusChange(property.id, EstadosInmuebleEnum.RESERVADO)}
                                className="bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>{INMUEBLES_TEXTS.actions.reserve}</span>
                              </button>
                            )}

                            {property.estado === EstadosInmuebleEnum.RESERVADO && (
                              <>
                                <button
                                  disabled={isUpdating === property.id}
                                  onClick={() => handleStatusChange(property.id, EstadosInmuebleEnum.DISPONIBLE)}
                                  className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                  <span>{INMUEBLES_TEXTS.actions.release}</span>
                                </button>
                                <button
                                  disabled={isUpdating === property.id}
                                  onClick={() => handleStatusChange(property.id, EstadosInmuebleEnum.VENDIDO)}
                                  className="bg-slate-700 hover:bg-slate-650 active:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>{INMUEBLES_TEXTS.actions.sell}</span>
                                </button>
                              </>
                            )}

                            {/* Si no se ha vendido, se habilita eliminar */}
                            {property.estado !== EstadosInmuebleEnum.VENDIDO && (
                              <button
                                disabled={isUpdating === property.id}
                                onClick={() => handleDelete(property.id)}
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
                  })}
                </div>

                {/* Paginación */}
                {meta && meta.totalPages > 1 && (
                  <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 rounded-xl px-6 py-4 mt-8">
                    <span className="text-sm text-slate-400">
                      {INMUEBLES_TEXTS.pagination.pageLabel} <strong className="text-slate-200">{meta.page}</strong> {INMUEBLES_TEXTS.pagination.ofLabel} <strong className="text-slate-200">{meta.totalPages}</strong>
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
                        className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-350 disabled:opacity-30 disabled:pointer-events-none p-2 rounded-xl transition-all cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
