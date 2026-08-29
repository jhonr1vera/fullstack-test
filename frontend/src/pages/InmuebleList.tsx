import { useState, useEffect } from 'react';
import { Search, Filter, Home, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { api } from '../services/api.js';
import { INMUEBLES_TEXTS } from '../constants/inmuebles.js';
import { EstadosInmuebleEnum } from '../types/inmuebles.js';
import type { Inmueble, TipoInmueble, PaginacionMeta } from '../types/inmuebles.js';
import AppHeader from '../components/AppHeader.js';
import AddInmueble from '../components/AddInmueble.js';
import EditInmueble from '../components/EditInmueble.js';
import InmuebleDetalle from '../components/InmuebleDetalle.js';
import InmuebleItem from '../components/InmuebleItem.js';
import PageSizeSelector from '../components/PageSizeSelector.js';

export default function InmuebleList() {

  // Estados de datos
  const [properties, setProperties] = useState<Inmueble[]>([]);
  const [propertyTypes, setPropertyTypes] = useState<TipoInmueble[]>([]);
  const [meta, setMeta] = useState<PaginacionMeta | null>(null);

  // Estados de carga y actualización
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filtros y ordenamiento
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [tipoInmuebleId, setTipoInmuebleId] = useState('');
  const [status, setStatus] = useState('');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [orderBy, setOrderBy] = useState<'precio' | 'createdAt'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  // Control de modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Inmueble | null>(null);

  // Debounce para evitar llamadas excesivas en la búsqueda por dirección
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Carga de catálogo de tipos al montar la vista
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

  // Carga principal de inmuebles
  const fetchProperties = async () => {
    setIsLoading(true);
    setError(null);

    const queryParams: Record<string, string | number | boolean> = {
      page,
      limit,
    };

    if (debouncedSearch.trim()) queryParams.search = debouncedSearch.trim();
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

  // Disparar carga de propiedades
  useEffect(() => {
    fetchProperties();
  }, [page, debouncedSearch, tipoInmuebleId, status, minPrice, maxPrice, onlyMine, orderBy, order, limit]);

  const handleFilterChange = () => {
    setPage(1);
  };

  // Borrado lógico del inmueble
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

  // Transición de estados del inmueble
  const handleStatusChange = async (id: string, newStatus: EstadosInmuebleEnum) => {
    setIsUpdating(id);
    try {
      await api.patch(`/inmuebles/${id}/estado`, { estado: newStatus });
      await fetchProperties();
      if (selectedProperty && selectedProperty.id === id) {
        setSelectedProperty((prev) => prev ? { ...prev, estado: newStatus } : null);
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || INMUEBLES_TEXTS.alerts.statusError);
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-12">
      {/* Encabezado */}
      <AppHeader
        activeView="inmuebles"
        action={
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-indigo-600/10"
          >
            <span>{INMUEBLES_TEXTS.modal.title}</span>
          </button>
        }
      />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Panel de Filtros */}
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 h-fit space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-4">
              <Filter className="w-5 h-5 text-indigo-400" />
              <h2 className="font-bold text-lg">{INMUEBLES_TEXTS.filters.title}</h2>
            </div>

            {/* Dirección */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.searchLabel}</label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={INMUEBLES_TEXTS.filters.searchPlaceholder}
                  className="w-full bg-slate-950/60 border border-slate-850 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all"
                />
              </div>
            </div>

            {/* Tipo de Inmueble */}
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

            {/* Estado */}
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

            {/* Rango de precios */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase text-slate-500 block">{INMUEBLES_TEXTS.filters.minPrice}</label>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    const val = e.target.value === '' ? '' : (parsed < 0 ? 0 : parsed);
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
                  min="0"
                  value={maxPrice}
                  onChange={(e) => {
                    const parsed = Number(e.target.value);
                    const val = e.target.value === '' ? '' : (parsed < 0 ? 0 : parsed);
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

            {/* Solo mis inmuebles */}
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

          {/* Listado */}
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
                  {properties.map((property) => (
                    <InmuebleItem
                      key={property.id}
                      property={property}
                      onDetailClick={(prop) => {
                        setSelectedProperty(prop);
                        setIsDetailModalOpen(true);
                      }}
                      onEditClick={(prop) => {
                        setSelectedProperty(prop);
                        setIsEditModalOpen(true);
                      }}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      isUpdating={isUpdating === property.id}
                    />
                  ))}
                </div>

                {/* Paginación */}
                {meta && (
                  <div className="flex justify-between items-center bg-slate-900/20 border border-slate-900/60 rounded-xl px-6 py-4 mt-8">
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
                          {INMUEBLES_TEXTS.pagination.pageLabel} <strong className="text-slate-200">{meta.page}</strong> {INMUEBLES_TEXTS.pagination.ofLabel} <strong className="text-slate-200">{meta.totalPages}</strong>
                        </span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                            disabled={meta.page === 1}
                            className="bg-slate-900 border border-slate-850 hover:bg-slate-800 text-slate-355 disabled:opacity-30 disabled:pointer-events-none p-2 rounded-xl transition-all cursor-pointer"
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
          </div>
        </div>
      </main>

      {/* Modales */}

      <AddInmueble
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchProperties}
        propertyTypes={propertyTypes}
      />

      <InmuebleDetalle
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedProperty(null);
        }}
        property={selectedProperty}
        onEditClick={(prop) => {
          setIsDetailModalOpen(false);
          setSelectedProperty(prop);
          setIsEditModalOpen(true);
        }}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        isUpdating={!!isUpdating}
      />

      <EditInmueble
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedProperty(null);
        }}
        onSuccess={fetchProperties}
        propertyTypes={propertyTypes}
        property={selectedProperty}
      />
    </div>
  );
}
