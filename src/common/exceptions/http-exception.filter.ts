import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Response } from 'express';

import { IErrorResponse, IResponseEntity } from '../types';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const status = exception.getStatus();
    const error = exception.getResponse() as string | IErrorResponse;

    this.logger.error(
      `HTTP 예외: ${status} ${exception.name} - ${exception.message}`,
    );

    const isValidationError =
      typeof error !== 'string' && error.statusCode === HttpStatus.BAD_REQUEST;

    const responseEntity: IResponseEntity = {
      success: false,
      statusCode: status,
      data: isValidationError ? error.message : error,
    };

    response.status(status).json(responseEntity);
  }
}
