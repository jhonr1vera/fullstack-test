import { Injectable, NotFoundException, ConflictException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { QueryUsuarioDto } from './dto/query-usuario.dto.js';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryUsuarioDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: { deletedAt: null },
        take: limit,
        skip,
      }),
      this.prisma.user.count({
        where: { deletedAt: null },
      }),
    ]);

    const data = users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);

    return {
      data,
      meta: {
        total: Number(total),
        page,
        limit,
        totalPages: Math.ceil(Number(total) / limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt !== null) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async update(id: string, updateDto: UpdateUsuarioDto, loggedInUserId: string) {
    if (id !== loggedInUserId) {
      throw new ForbiddenException('Solo puedes editar tu propia cuenta');
    }

    const hasUpdates = updateDto && Object.values(updateDto).some(val => val !== undefined);
    if (!hasUpdates) {
      throw new BadRequestException('No se envio ningun dato para actualizar');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt !== null) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const dataToUpdate: any = {};

    if (updateDto.nombre) {
      dataToUpdate.nombre = updateDto.nombre;
    }

    if (updateDto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: updateDto.email! },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException({
          statusCode: 409,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'El correo electrónico ya está en uso por otro usuario',
        });
      }
      dataToUpdate.email = updateDto.email;
    }

    if (updateDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateDto.password, 10);
    }

    await this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.findOne(id);
  }

  async remove(id: string, loggedInUserId: string) {
    if (id !== loggedInUserId) {
      throw new ForbiddenException('Solo puedes eliminar tu propia cuenta');
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user || user.deletedAt !== null) {
      throw new NotFoundException('Usuario no encontrado o ya eliminado');
    }

    // Hacemos softdelete de los inmuebles disponibles y reservados del usuario
    await this.prisma.inmueble.updateMany({
      where: {
        vendedorId: id,
        deletedAt: null,
        estado: { in: ['DISPONIBLE', 'RESERVADO'] },
      },
      data: { deletedAt: new Date() },
    });

    await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        activo: false,
      },
    });

    return { message: 'Cuenta eliminada exitosamente' };
  }
}
