import { Module } from '@nestjs/common';
import { InmueblesService } from './inmuebles.service.js';
import { InmueblesController } from './inmuebles.controller.js';
import { CatalogosModule } from '../catalogos/catalogos.module.js';

@Module({
  imports: [CatalogosModule],
  controllers: [InmueblesController],
  providers: [InmueblesService],
  exports: [InmueblesService],
})
export class InmueblesModule {}
