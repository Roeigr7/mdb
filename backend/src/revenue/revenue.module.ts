import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { RevenueController } from './revenue.controller.js';
import { RevenueService } from './revenue.service.js';

@Module({
  imports: [AuthModule],
  controllers: [RevenueController],
  providers: [RevenueService],
})
export class RevenueModule {}
