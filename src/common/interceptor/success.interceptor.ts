import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';

import { Response } from 'express';
import { map, Observable } from 'rxjs';

import { IResponseEntity } from '../types';

@Injectable()
export class SuccessInterceptor implements NestInterceptor {
  private readonly logger = new Logger(SuccessInterceptor.name);

  intercept(
    context: ExecutionContext,
    next: CallHandler<unknown>,
  ): Observable<IResponseEntity> | Promise<Observable<IResponseEntity>> {
    const response = context.switchToHttp().getResponse<Response>();
    const request = context.switchToHttp().getRequest<Request>();
    const status: number = response.statusCode;

    return next.handle().pipe(
      map((data) => {
        const responseEntity: IResponseEntity = {
          success: true,
          statusCode: status,
          data,
        };

        this.logger.log(
          `HTTP (${request.method}) - 상태 코드: ${status} | URL: ${request.url}`,
        );

        if (status >= 400 && status < 500) {
          this.logger.warn(
            `4xx 에러 발생: ${status} - ${request.method} ${request.url}`,
          );
        }

        return responseEntity;
      }),
    );
  }
}
