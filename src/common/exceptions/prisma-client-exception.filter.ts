import {
  ArgumentsHost,
  Catch,
  HttpException,
  HttpServer,
  HttpStatus,
  Logger,
  Provider,
} from '@nestjs/common';
import { APP_FILTER, BaseExceptionFilter, HttpAdapterHost } from '@nestjs/core';

import { Prisma } from '@prisma/client';

export type ErrorCodesStatusMappingType = {
  [key: string]:
    | number
    | {
        statusCode?: number;
        errorMessage?: string;
      };
};

/**
 * {@link PrismaClientExceptionFilter}는 {@link Prisma.PrismaClientKnownRequestError} 예외를 잡습니다.
 */
@Catch(Prisma?.PrismaClientKnownRequestError)
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  private readonly logger = new Logger(PrismaClientExceptionFilter.name);

  /**
   * 기본 오류 코드 매핑
   *
   * Prisma 클라이언트(쿼리 엔진)에 대한 오류 코드 정의
   * 참고: https://www.prisma.io/docs/reference/api-reference/error-reference#prisma-client-query-engine
   */
  private readonly defaultMapping = {
    P2000: HttpStatus.BAD_REQUEST,
    P2002: HttpStatus.CONFLICT,
    P2025: HttpStatus.NOT_FOUND,
  };

  private readonly userDefinedMapping?: ErrorCodesStatusMappingType;

  constructor(
    applicationRef?: HttpServer,
    errorCodesStatusMapping?: ErrorCodesStatusMappingType,
  ) {
    super(applicationRef);
    this.userDefinedMapping = errorCodesStatusMapping;
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    this.catchClientKnownRequestError(exception, host);
  }

  private catchClientKnownRequestError(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost,
  ): void {
    const statusCode =
      this.userDefinedStatusCode(exception) ||
      this.defaultStatusCode(exception);

    const message =
      this.userDefinedExceptionMessage(exception) ||
      this.defaultExceptionMessage(exception);

    if (host.getType() === 'http') {
      if (statusCode === undefined) {
        super.catch(exception, host);
        return;
      }

      super.catch(new HttpException({ statusCode, message }, statusCode), host);
    }
  }

  private userDefinedStatusCode(
    exception: Prisma.PrismaClientKnownRequestError,
  ): number | undefined {
    const userDefinedValue = this.userDefinedMapping?.[exception.code];
    return typeof userDefinedValue === 'number'
      ? userDefinedValue
      : userDefinedValue?.statusCode;
  }

  private defaultStatusCode(
    exception: Prisma.PrismaClientKnownRequestError,
  ): number | undefined {
    return this.defaultMapping[exception.code];
  }

  private userDefinedExceptionMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string | undefined {
    const userDefinedValue = this.userDefinedMapping?.[exception.code];
    return typeof userDefinedValue === 'number'
      ? undefined
      : userDefinedValue?.errorMessage;
  }

  private defaultExceptionMessage(
    exception: Prisma.PrismaClientKnownRequestError,
  ): string {
    const shortMessage = exception.message.substring(
      exception.message.indexOf('→'),
    );
    return (
      `[${exception.code}]: ` +
      shortMessage
        .substring(shortMessage.indexOf('\n'))
        .replace(/\n/g, '')
        .trim()
    );
  }
}

export function providePrismaClientExceptionFilter(
  errorCodesStatusMapping?: ErrorCodesStatusMappingType,
): Provider {
  return {
    provide: APP_FILTER,
    useFactory: ({
      httpAdapter,
    }: HttpAdapterHost): PrismaClientExceptionFilter => {
      return new PrismaClientExceptionFilter(
        httpAdapter,
        errorCodesStatusMapping,
      );
    },
    inject: [HttpAdapterHost],
  };
}
