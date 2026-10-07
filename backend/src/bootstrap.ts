import { ValidationPipe, type Type } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalHttpExceptionFilter } from './common/filters/global-http-exception.filter.js';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter.js';
import { validateEnv } from './config/env.validation.js';
import { isObserveEnabled, ObserveInstrument } from './observe.js';

async function loadAppModule(): Promise<Type> {
  if (process.env.VERCEL) {
    const { AppModule } = await import('./app.module.js');
    return AppModule;
  }

  const { AppWithThrottlerModule } = await import(
    './app.with-throttler.module.js'
  );
  return AppWithThrottlerModule;
}

export async function createApp() {
  validateEnv();
  const appModule = await loadAppModule();

  const app = await NestFactory.create(
    appModule,
    isObserveEnabled() ? { instrument: ObserveInstrument } : undefined,
  );

  const corsOrigins = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
  app.enableCors({
    origin: corsOrigins,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(
    new PrismaExceptionFilter(),
    new GlobalHttpExceptionFilter(),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('MBD Dashboard API')
    .setDescription('API documentation for MBD Dashboard')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Paste the accessToken from POST /auth/login',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  await app.init();
  return app;
}
