import { ConfigService } from '@nestjs/config';

// Retorna true si el entorno de ejecucion es produccion
export const isProduction = (configService: ConfigService): boolean =>
  configService.get<string>('NODE_ENV') === 'production';
