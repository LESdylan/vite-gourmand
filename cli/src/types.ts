/**
 * Log Types - Shared with backend
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
export type LogSource = 'api' | 'db' | 'auth' | 'ws' | 'system' | 'order';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  source: LogSource;
  message: string;
  meta?: {
    method?: string;
    path?: string;
    statusCode?: number;
    duration?: number;
    userId?: string | number;
  };
}

export interface LogOptions {
  level?: LogLevel;
  source?: LogSource;
  follow?: boolean;
}
