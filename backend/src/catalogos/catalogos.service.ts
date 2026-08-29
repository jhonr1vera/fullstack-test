import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';

@Injectable()
export class CatalogosService {
  constructor(private readonly prisma: PrismaService) { }

  async getTiposInmueble() {
    const tiposInmueble = await this.prisma.tipoInmueble.findMany({
      where: {
        activo: true,
      },
      orderBy: {
        nombre: 'asc',
      },
    });

    if (tiposInmueble.length === 0) {
      throw new NotFoundException('No se encontraron tipos de inmueble');
    }

    return tiposInmueble;
  }

  async validarTipoActivo(id: string) {
    const tipo = await this.prisma.tipoInmueble.findUnique({
      where: { id },
    });

    if (!tipo || !tipo.activo) {
      throw new BadRequestException({
        statusCode: 400,
        code: 'INVALID_PROPERTY_TYPE',
        message: 'El tipo de inmueble especificado no existe o está inactivo',
      });
    }

    return tipo;
  }
}
