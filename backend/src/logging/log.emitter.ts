/**
 * LogEmitter - Event-based log distribution
 * Decouples log production from consumption
 */

import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import type { StructuredLog, LogLevel, LogSource, LogMeta } from './types';

@Injectable()
export class LogEmitter {
  private readonly emitter = new EventEmitter();

  /**
   * Subscribe to log events
   */
  onLog(callback: (log: StructuredLog) => void): void {
    this.emitter.on('log', callback);
  }

  /**
   * Unsubscribe from log events
   */
  offLog(callback: (log: StructuredLog) => void): void {
    this.emitter.off('log', callback);
  }

  /**
   * Emit a structured log event
   */
  emit(level: LogLevel, source: LogSource, message: string, meta?: LogMeta): void {
    const log: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
      meta,
    };
    this.emitter.emit('log', log);
  }

  info(source: LogSource, message: string, meta?: LogMeta): void {
    this.emit('info', source, message, meta);
  }

  warn(source: LogSource, message: string, meta?: LogMeta): void {
    this.emit('warn', source, message, meta);
  }

  error(source: LogSource, message: string, meta?: LogMeta): void {
    this.emit('error', source, message, meta);
  }

  debug(source: LogSource, message: string, meta?: LogMeta): void {
    this.emit('debug', source, message, meta);
  }
}
