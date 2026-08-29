import { IsIn, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class QueryInmuebleDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsIn(['DISPONIBLE', 'RESERVADO', 'VENDIDO'])
  @IsOptional()
  estado?: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';

  @IsUUID('all', { message: 'El ID de tipo de inmueble debe ser un UUID válido' })
  @IsOptional()
  tipoInmuebleId?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioMin?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  precioMax?: number;

  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsIn(['true', 'false'])
  @IsOptional()
  soloMios?: string = 'false';

  @IsString()
  @IsIn(['precio', 'createdAt'])
  @IsOptional()
  orderBy?: 'precio' | 'createdAt' = 'createdAt';

  @IsString()
  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}
