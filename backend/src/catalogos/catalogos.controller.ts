import { Controller, Get } from '@nestjs/common';
import { CatalogosService } from './catalogos.service.js';
import { Public } from '../shared/decorators/public.decorator.js';

@Controller('tipos-inmueble')
export class CatalogosController {
  constructor(private readonly catalogosService: CatalogosService) {}

  @Public()
  @Get()
  async getTiposInmueble() {
    return this.catalogosService.getTiposInmueble();
  }
}
