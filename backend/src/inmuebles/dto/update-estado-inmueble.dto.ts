import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class UpdateEstadoInmuebleDto {
  @IsString({ message: 'El estado debe ser texto' })
  @IsNotEmpty({ message: 'El estado es obligatorio' })
  @IsIn(['DISPONIBLE', 'RESERVADO', 'VENDIDO'], {
    message: 'El estado debe ser DISPONIBLE, RESERVADO o VENDIDO',
  })
  estado: 'DISPONIBLE' | 'RESERVADO' | 'VENDIDO';
}
