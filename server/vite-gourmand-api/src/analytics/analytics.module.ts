// src/analytics/analytics.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MenuStats, MenuStatsSchema } from './analytics.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: MenuStats.name, schema: MenuStatsSchema }]),
  ],
  exports: [MongooseModule],
})
export class AnalyticsModule {}
