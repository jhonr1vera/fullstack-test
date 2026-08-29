import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { CreateInmuebleDto } from './dto/create-inmueble.dto.js';
import { UpdateInmuebleDto } from './dto/update-inmueble.dto.js';
import { UpdateEstadoInmuebleDto } from './dto/update-estado-inmueble.dto.js';
import { QueryInmuebleDto } from './dto/query-inmueble.dto.js';
import { IWhereClause, IOrderByClause, EstadosInmuebleEnum } from './models/common.js';
import { CatalogosService } from '../catalogos/catalogos.service.js';

@Injectable()
export class InmueblesService {
  constructor(private readonly prisma: PrismaService, private readonly catalogoService: CatalogosService) {}

  async create(createDto: CreateInmuebleDto, vendedorId: string) {
    // Validamos que el tipo de inmueble exista y este activo
    await this.catalogoService.validarTipoActivo(createDto.tipoInmuebleId);

    const item = await this.prisma.inmueble.create({
      data: {
        direccion: createDto.direccion,
        precio: createDto.precio,
        habitaciones: createDto.habitaciones,
        metrosCuadrados: createDto.metrosCuadrados,
        tipoInmuebleId: createDto.tipoInmuebleId,
        vendedorId,
        estado: EstadosInmuebleEnum.DISPONIBLE,
      },
    });

    return this.findOne(item.id);
  }

  async findAll(queryDto: QueryInmuebleDto, currentUserId: string) {
    const limit = queryDto.limit ?? 10;
    const page = queryDto.page ?? 1;
    const skip = (page - 1) * limit;

    const whereClause: IWhereClause = {
      deletedAt: null,
    };

    if (queryDto.estado) {
      whereClause.estado = queryDto.estado;
    }

    if (queryDto.tipoInmuebleId) {
      whereClause.tipoInmuebleId = queryDto.tipoInmuebleId;
    }

    if (queryDto.precioMin) {
      whereClause.precio = {
        ...whereClause.precio,
        gte: queryDto.precioMin,
      };
    }

    if (queryDto.precioMax) {
      whereClause.precio = {
        ...whereClause.precio,
        lte: queryDto.precioMax,
      };
    }

    if (queryDto.search) {
      whereClause.direccion = {
        contains: queryDto.search,
        mode: 'insensitive',
      };
    }

    if (queryDto.soloMios === 'true') {
      whereClause.vendedorId = currentUserId;
    }

    const sortOrder = queryDto.order?.toLowerCase() === 'asc' ? 'asc' : 'desc';
    const orderByClause: IOrderByClause = {};
    if (queryDto.orderBy === 'precio') {
      orderByClause.precio = sortOrder;
    } else {
      orderByClause.createdAt = sortOrder;
    }

    const [items, total] = await Promise.all([
      this.prisma.inmueble.findMany({
        where: whereClause,
        take: limit,
        skip: skip,
        orderBy: orderByClause,
        include: {
          vendedor: {
            select: {
              id: true,
              nombre: true,
              email: true,
              activo: true,
            },
          },
          tipoInmueble: true,
        },
      }),
      this.prisma.inmueble.count({
        where: whereClause,
      }),
    ]);

    const mappedItems = items.map((item) => ({
      ...item,
      precio: Number(item.precio),
    }));

    if (mappedItems.length === 0) {
      throw new NotFoundException('No se encontraron inmuebles');
    }


    return {
      data: mappedItems,
      meta: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async findOne(id: string) {
    const item = await this.prisma.inmueble.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        vendedor: {
          select: {
            id: true,
            nombre: true,
            email: true,
            activo: true,
          },
        },
        tipoInmueble: true,
      },
    });

    if (!item) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    return {
      ...item,
      precio: Number(item.precio),
    };
  }

  async update(id: string, updateDto: UpdateInmuebleDto, loggedInUserId: string) {

    const hasUpdates = updateDto && Object.values(updateDto).some(val => val !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException('No se proporcionaron datos para actualizar');
    }

    const item = await this.prisma.inmueble.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    if (item.vendedorId !== loggedInUserId) {
      throw new ForbiddenException('Solo el dueño del inmueble puede editarlo');
    }

    if (item.estado === EstadosInmuebleEnum.VENDIDO) {
      throw new ConflictException({
        statusCode: 409,
        code: 'PROPERTY_SOLD',
        message: 'No se puede editar un inmueble que ya ha sido vendido',
      });
    }

    const updateData: Partial<UpdateInmuebleDto> = {};

    if (updateDto.direccion) {
      updateData.direccion = updateDto.direccion;
    }

    if (updateDto.precio) {
      updateData.precio = updateDto.precio;
    }

    if (updateDto.habitaciones !== undefined) {
      updateData.habitaciones = updateDto.habitaciones;
    }

    if (updateDto.metrosCuadrados !== undefined) {
      updateData.metrosCuadrados = updateDto.metrosCuadrados;
    }

    if (updateDto.tipoInmuebleId) {
      // Validamos que el tipo de inmueble exista y este activo
      const tipoInmueble = await this.catalogoService.validarTipoActivo(updateDto.tipoInmuebleId);
      updateData.tipoInmuebleId = tipoInmueble.id;
    }

    await this.prisma.inmueble.update({
      where: { id },
      data: updateData,
    });

    return this.findOne(id);
  }

  async updateEstado(id: string, updateEstadoDto: UpdateEstadoInmuebleDto, loggedInUserId: string) {
    const item = await this.prisma.inmueble.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Inmueble no encontrado');
    }

    if (item.vendedorId !== loggedInUserId) {
      throw new ForbiddenException('Solo el dueño del inmueble puede cambiar su estado');
    }

    const currentEstado = item.estado;
    const targetEstado = updateEstadoDto.estado;

    if (currentEstado === targetEstado) {
      return this.findOne(id);
    }

    let isValid = false;

    if (currentEstado === EstadosInmuebleEnum.DISPONIBLE && targetEstado === EstadosInmuebleEnum.RESERVADO) {
      isValid = true;
    } else if (currentEstado === EstadosInmuebleEnum.RESERVADO && (targetEstado === EstadosInmuebleEnum.DISPONIBLE || targetEstado === EstadosInmuebleEnum.VENDIDO)) {
      isValid = true;
    }

    if (!isValid) {
      throw new ConflictException({
        statusCode: 409,
        code: 'INVALID_STATE_TRANSITION',
        message: `Transición de estado inválida de ${currentEstado} a ${targetEstado}`,
      });
    }

    await this.prisma.inmueble.update({
      where: { id },
      data: { estado: targetEstado },
    });

    return this.findOne(id);
  }

  async remove(id: string, loggedInUserId: string) {
    const item = await this.prisma.inmueble.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!item) {
      throw new NotFoundException('Inmueble no encontrado o ya eliminado');
    }

    if (item.vendedorId !== loggedInUserId) {
      throw new ForbiddenException('Solo el dueño del inmueble puede eliminarlo');
    }

    await this.prisma.inmueble.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return { message: 'Inmueble eliminado exitosamente' };
  }
}
