/**
 * Logging Module
 */
import { Module, Global } from '@nestjs/common';
import { HttpLogInterceptor } from './http-log.interceptor';

@Global()
@Module({
  providers: [HttpLogInterceptor],
  exports: [HttpLogInterceptor],
})
export class LoggingModule {}
