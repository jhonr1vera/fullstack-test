
export interface IWhereClause {
  deletedAt: null;
  estado?: string;
  tipoInmuebleId?: string;
  precio?: {
    gte?: number;
    lte?: number;
  };
  direccion?: {
    contains: string;
    mode: 'insensitive';
  };
  vendedorId?: string;
}

export interface IOrderByClause {
  precio?: 'asc' | 'desc';
  createdAt?: 'asc' | 'desc';
}

export enum EstadosInmuebleEnum {
  DISPONIBLE = 'DISPONIBLE',
  VENDIDO = 'VENDIDO',
  RESERVADO = 'RESERVADO',
}