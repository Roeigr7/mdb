import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AuthModule } from './auth/auth.module.js';
import { DocumentsModule } from './documents/documents.module.js';
import { ExpensesModule } from './expenses/expenses.module.js';
import { MaterialsModule } from './materials/materials.module.js';
import { isObserveEnabled, ObserveModule } from './observe.js';
import { ProjectsModule } from './projects/projects.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { RevenueModule } from './revenue/revenue.module.js';
import { SuppliersModule } from './suppliers/suppliers.module.js';
import { UsersModule } from './users/users.module.js';

const observeImports = isObserveEnabled()
  ? [
      ObserveModule.forRoot({
        appKey: process.env.OBSERVE_APP_KEY!,
        appSecret: process.env.OBSERVE_APP_SECRET!,
        serviceId: process.env.OBSERVE_SERVICE_ID?.trim() || 'backend',
      }),
    ]
  : [];

@Module({
  imports: [
    ...observeImports,
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AnalyticsModule,
    ProjectsModule,
    MaterialsModule,
    DocumentsModule,
    ExpensesModule,
    RevenueModule,
    SuppliersModule,
    AuthModule,
    UsersModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
