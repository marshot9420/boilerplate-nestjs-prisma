import { APP } from '@/constants';
import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Boilerplate - API')
  .setDescription('Boilerplate Open API Specification')
  .setVersion(APP.VERSION)
  .build();
