import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { Public } from './shared/decorators/public.decorator.js';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      status: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
