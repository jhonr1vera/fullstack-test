import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class UpdateInmuebleDto {
  @IsString()
  @IsNotEmpty({ message: 'La dirección no puede estar vacía' })
  @IsOptional()
  direccion?: string;

  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(1, { message: 'El precio debe ser mayor que cero' })
  @IsOptional()
  precio?: number;

  @IsInt({ message: 'El número de habitaciones debe ser un entero' })
  @Min(0, { message: 'El número de habitaciones no puede ser negativo' })
  @IsOptional()
  habitaciones?: number;

  @IsInt({ message: 'Los metros cuadrados deben ser un entero' })
  @Min(1, { message: 'Los metros cuadrados deben ser al menos 1' })
  @IsOptional()
  metrosCuadrados?: number;

  @IsUUID('all', { message: 'El tipo de inmueble debe ser un UUID válido' })
  @IsOptional()
  tipoInmuebleId?: string;
}
