import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  OnModuleDestroy,
  Optional,
} from '@nestjs/common';

import { Prisma, PrismaClient } from '@prisma/client';

import { PRISMA_SERVICE_OPTIONS } from './prisma.constant';
import { IPrismaServiceOptions } from './prisma.type';

const prisma = new PrismaClient();

@Injectable()
export class PrismaService
  extends PrismaClient<
    Prisma.PrismaClientOptions,
    'query' | 'info' | 'warn' | 'error'
  >
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(
    @Optional()
    @Inject(PRISMA_SERVICE_OPTIONS)
    private readonly prismaServiceOptions: IPrismaServiceOptions = {},
  ) {
    super(prismaServiceOptions.prismaOptions);

    if (this.prismaServiceOptions.middlewares) {
      this.prismaServiceOptions.middlewares.forEach((middleware) =>
        prisma.$use(middleware),
      );
    }
  }

  async onModuleInit(): Promise<void> {
    this.logger.log('🔄 Prisma 서비스 초기화...');
    if (this.prismaServiceOptions.explicitConnect) {
      await prisma.$connect();

      this.logger.log('✅ Prisma 클라이언트 연결 완료');
    }
  }

  async onModuleDestroy(): Promise<void> {
    await prisma.$disconnect();

    this.logger.log('❌ Prisma 클라이언트 연결 해제');
  }
}
