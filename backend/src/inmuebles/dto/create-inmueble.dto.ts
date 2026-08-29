import { IsInt, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateInmuebleDto {
  @IsString({ message: 'La dirección debe ser texto' })
  @IsNotEmpty({ message: 'La dirección es obligatoria' })
  direccion: string;

  @IsNumber({}, { message: 'El precio debe ser un número válido' })
  @IsInt({ message: 'El precio debe ser un número entero' })
  @Min(1, { message: 'El precio debe ser mayor que cero' })
  precio: number;

  @IsInt({ message: 'El número de habitaciones debe ser un entero' })
  @Min(0, { message: 'El número de habitaciones no puede ser negativo' })
  habitaciones: number;

  @IsInt({ message: 'Los metros cuadrados deben ser un entero' })
  @Min(1, { message: 'Los metros cuadrados deben ser al menos 1' })
  metrosCuadrados: number;

  @IsUUID('all', { message: 'El tipo de inmueble debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El tipo de inmueble es obligatorio' })
  tipoInmuebleId: string;
}
