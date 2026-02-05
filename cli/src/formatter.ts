/**
 * LogFormatter - Fly.io-style log output
 * Clean, colored, timestamped logs
 */

import chalk from 'chalk';
import type { StructuredLog, LogLevel } from './types.js';

const LEVEL_COLORS: Record<LogLevel, (s: string) => string> = {
  debug: chalk.gray,
  info: chalk.blue,
  warn: chalk.yellow,
  error: chalk.red,
};

const SOURCE_COLORS: Record<string, (s: string) => string> = {
  api: chalk.cyan,
  db: chalk.magenta,
  auth: chalk.green,
  ws: chalk.blue,
  system: chalk.gray,
  order: chalk.yellow,
};

export function formatLog(log: StructuredLog): string {
  const time = formatTime(log.timestamp);
  const source = formatSource(log.source);
  const level = formatLevel(log.level);
  const message = formatMessage(log);

  return `${time} ${source}${level} ${message}`;
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return chalk.gray(`${h}:${m}:${s}`);
}

function formatSource(source: string): string {
  const colorFn = SOURCE_COLORS[source] || chalk.white;
  return colorFn(`[${source}]`);
}

function formatLevel(level: LogLevel): string {
  const colorFn = LEVEL_COLORS[level];
  return colorFn(`[${level}]`);
}

function formatMessage(log: StructuredLog): string {
  if (log.meta?.duration !== undefined) {
    return `${log.message}`;
  }
  return log.message;
}

export function printWaiting(): void {
  console.log(chalk.gray('Waiting for logs...'));
  console.log();
}

export function printConnected(url: string): void {
  console.log(chalk.green(`✓ Connected to ${url}`));
}

export function printDisconnected(): void {
  console.log(chalk.yellow('⚠ Disconnected, reconnecting...'));
}
