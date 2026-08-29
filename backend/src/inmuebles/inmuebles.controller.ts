import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { InmueblesService } from './inmuebles.service.js';
import { CreateInmuebleDto } from './dto/create-inmueble.dto.js';
import { UpdateInmuebleDto } from './dto/update-inmueble.dto.js';
import { UpdateEstadoInmuebleDto } from './dto/update-estado-inmueble.dto.js';
import { QueryInmuebleDto } from './dto/query-inmueble.dto.js';
import { CurrentUser } from '../shared/decorators/current-user.decorator.js';
import type * as client from '@prisma/client';

@Controller('inmuebles')
export class InmueblesController {
  constructor(private readonly inmueblesService: InmueblesService) {}

  @Post()
  async create(@Body() createInmuebleDto: CreateInmuebleDto, @CurrentUser() user: client.User) {
    return this.inmueblesService.create(createInmuebleDto, user.id);
  }

  @Get()
  async findAll(@Query() query: QueryInmuebleDto, @CurrentUser() user: client.User) {
    return this.inmueblesService.findAll(query, user.id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.inmueblesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateInmuebleDto: UpdateInmuebleDto,
    @CurrentUser() user: client.User,
  ) {
    return this.inmueblesService.update(id, updateInmuebleDto, user.id);
  }

  @Patch(':id/estado')
  async updateEstado(
    @Param('id') id: string,
    @Body() updateEstadoDto: UpdateEstadoInmuebleDto,
    @CurrentUser() user: client.User,
  ) {
    return this.inmueblesService.updateEstado(id, updateEstadoDto, user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: client.User) {
    return this.inmueblesService.remove(id, user.id);
  }
}
