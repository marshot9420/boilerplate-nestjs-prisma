import { ModuleMetadata, Type } from '@nestjs/common';

import { Prisma } from '@prisma/client';

export interface IPrismaModuleOptions {
  /**
   * "true"로 설정하면 `PrismaModule`을 전역 모듈로 등록합니다.
   * 참고: https://docs.nestjs.com/modules#global-modules
   */
  isGlobal?: boolean;

  prismaServiceOptions?: IPrismaServiceOptions;
}

export interface IPrismaServiceOptions {
  /**
   * 옵션을 `PrismaClient`에 직접 전달합니다.
   * 참고: https://www.prisma.io/docs/reference/api-reference/prisma-client-reference/#prismaclient
   */
  prismaOptions?: Prisma.PrismaClientOptions;

  /**
   * "true"로 설정하면, `PrismaClient`가 명시적으로 연결 풀을 생성하여 첫 번째 쿼리가 즉시 응답합니다.
   *
   * 대부분의 경우 `PrismaClient`의 지연 연결 동작이 충분합니다. `PrismaClient`의 첫 번째 쿼리는 연결 풀을 생성합니다.
   * 참고: https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-management
   */
  explicitConnect?: boolean;

  /**
   * Prisma 미들웨어를 적용하여 DB 쿼리 전후에 작업을 수행합니다.
   *
   * 참고: https://www.prisma.io/docs/concepts/components/prisma-client/middleware
   */
  middlewares?: Array<Prisma.Middleware>;
}

export interface IPrismaOptionsFactory {
  createPrismaOptions(): Promise<IPrismaServiceOptions> | IPrismaServiceOptions;
}

export interface IPrismaModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  isGlobal?: boolean;
  useExisting?: Type<IPrismaOptionsFactory>;
  useClass?: Type<IPrismaOptionsFactory>;
  useFactory?: (
    ...args: unknown[]
  ) => Promise<IPrismaServiceOptions> | IPrismaServiceOptions;
  inject?: Type<unknown>[];
}
