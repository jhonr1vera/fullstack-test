export interface TipoInmueble {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export interface Vendedor {
  id: string;
  nombre: string;
  email: string;
}

export const EstadosInmuebleEnum = {
  DISPONIBLE: 'DISPONIBLE',
  RESERVADO: 'RESERVADO',
  VENDIDO: 'VENDIDO',
} as const;

export type EstadosInmuebleEnum = typeof EstadosInmuebleEnum[keyof typeof EstadosInmuebleEnum];

export interface Inmueble {
  id: string;
  direccion: string;
  precio: number;
  habitaciones: number;
  metrosCuadrados: number;
  estado: EstadosInmuebleEnum;
  tipoInmuebleId: string;
  vendedorId: string;
  createdAt: string;
  updatedAt: string;
  tipoInmueble: TipoInmueble;
  vendedor: Vendedor;
}

export interface PaginacionMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface InmueblesResponse {
  data: Inmueble[];
  meta: PaginacionMeta;
}
