import { Injectable, NotFoundException } from '@nestjs/common';
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
}
