/**
 * Time Off Module
 */
import { Module } from '@nestjs/common';
import { TimeOffController } from './timeoff.controller';
import { TimeOffService } from './timeoff.service';
import { PrismaModule } from '../prisma';

@Module({
  imports: [PrismaModule],
  controllers: [TimeOffController],
  providers: [TimeOffService],
  exports: [TimeOffService],
})
export class TimeOffModule {}
