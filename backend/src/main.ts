import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { createApp } from './bootstrap.js';

async function bootstrap() {
  // Vercel's NestJS detector only accepts an entry file that imports @nestjs/core.
  void NestFactory;
  const app = await createApp();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
