import { Controller, Get, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { UsuariosService } from './usuarios.service.js';
import { UpdateUsuarioDto } from './dto/update-usuario.dto.js';
import { QueryUsuarioDto } from './dto/query-usuario.dto.js';
import { CurrentUser } from '../shared/decorators/current-user.decorator.js';
import type * as client from '@prisma/client';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  async findAll(@Query() query: QueryUsuarioDto) {
    return this.usuariosService.findAll(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.usuariosService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @CurrentUser() user: client.User,
  ) {
    return this.usuariosService.update(id, updateUsuarioDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: client.User ) {
    return this.usuariosService.remove(id, user.id);
  }
}
