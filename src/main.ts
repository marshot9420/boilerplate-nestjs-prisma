import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';

import * as cookieParser from 'cookie-parser';
// import * as expressBasicAuth from 'express-basic-auth';

import {
  CustomLoggerService,
  HttpExceptionFilter,
  PrismaClientExceptionFilter,
  SuccessInterceptor,
} from './common';
import { corsConfig, swaggerConfig } from './configs';
import { API_URL, APP } from './constants';

import { AppModule } from './app.module';

class Application {
  private logger = new Logger(Application.name);
  private HOST: string;
  private PORT: string;
  private DEV_MODE: boolean;

  constructor(private app: NestExpressApplication) {
    this.app = app;
    this.HOST = process.env.HOST;
    this.PORT = process.env.PORT;
    this.DEV_MODE = process.env.NODE_ENV === APP.NODE_ENV.DEVELOPMENT;
  }

  private async setUpOpenAPI() {
    // this.app.use(
    //   [API_URL.SWAGGER.DOCS, API_URL.SWAGGER.DOCS_JSON],
    //   expressBasicAuth({
    //     challenge: true,
    //     users: {
    //       [process.env.ADMIN_USER]: process.env.ADMIN_PASSWORD,
    //     },
    //   }),
    // );

    const document = SwaggerModule.createDocument(this.app, swaggerConfig);

    SwaggerModule.setup(API_URL.SWAGGER.DOCS, this.app, document);
  }

  private async setUpGlobalMiddleware() {
    this.app.enableCors(corsConfig(this.DEV_MODE));

    this.app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    this.app.useGlobalInterceptors(new SuccessInterceptor());
    this.app.useGlobalFilters(
      new HttpExceptionFilter(),
      new PrismaClientExceptionFilter(),
    );

    this.setUpOpenAPI();
    this.app.use(cookieParser(process.env.COOKIE_SECRET));
  }

  async bootstrap() {
    await this.setUpGlobalMiddleware();

    await this.app.listen(this.PORT);
  }

  startLog() {
    this.logger.log(`✅ 서버가 ${this.HOST}:${this.PORT} 에서 실행 중입니다🚀`);
  }
}

async function init() {
  const server = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: CustomLoggerService,
    bufferLogs: true,
  });
  const app = new Application(server);

  await app.bootstrap();

  app.startLog();
}

init();
