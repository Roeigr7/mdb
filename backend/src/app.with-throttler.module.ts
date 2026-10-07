import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppModule } from './app.module.js';

/**
 * Local/runtime wrapper. Kept off the Vercel import graph: @nestjs/throttler
 * is CommonJS and Vercel's Node loader cannot require the ESM Nest packages.
 */
@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    AppModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppWithThrottlerModule {}
