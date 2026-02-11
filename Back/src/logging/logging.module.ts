/**
 * Logging Module
 */
import { Module, Global } from '@nestjs/common';
import { HttpLogInterceptor } from './http-log.interceptor';
import { LogService } from './log.service';
import { LogController } from './log.controller';

@Global()
@Module({
  controllers: [LogController],
  providers: [HttpLogInterceptor, LogService],
  exports: [HttpLogInterceptor, LogService],
})
export class LoggingModule {}
