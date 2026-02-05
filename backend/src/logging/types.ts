/**
 * Logging Types - Structured log format for streaming
 * Fly.io-inspired log schema
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'api' | 'db' | 'auth' | 'ws' | 'system' | 'order';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  meta?: LogMeta;
}

export interface LogMeta {
  method?: string;
  path?: string;
  statusCode?: number;
  duration?: number;
  userId?: string | number;
  requestId?: string;
  instance?: string;
  region?: string;
}

export interface LogFilter {
  level?: LogLevel;
  source?: LogSource;
  since?: Date;
}

export const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};
