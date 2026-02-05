/**
 * LoggingModule - Real-time log streaming infrastructure
 * WebSocket-based log distribution system
 */

import { Module, Global } from '@nestjs/common';
import { LogEmitter } from './log.emitter';
import { LogGateway } from './log.gateway';

@Global()
@Module({
  providers: [LogEmitter, LogGateway],
  exports: [LogEmitter],
})
export class LoggingModule {}
