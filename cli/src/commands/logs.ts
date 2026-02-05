/**
 * Logs Command - Stream live logs from backend
 * Usage: vg logs [--level info] [--source api]
 */

import { Command } from 'commander';
import { LogClient } from '../client.js';
import type { LogLevel, LogSource } from '../types.js';

interface LogsOptions {
  level?: LogLevel;
  source?: LogSource;
  url: string;
}

export function createLogsCommand(): Command {
  return new Command('logs')
    .description('Stream live logs from the backend')
    .option('-l, --level <level>', 'Filter by log level (debug|info|warn|error)')
    .option('-s, --source <source>', 'Filter by source (api|db|auth|ws|system)')
    .option('-u, --url <url>', 'Backend URL', 'http://localhost:3000')
    .action((opts: LogsOptions) => {
      const client = new LogClient(opts.url, {
        level: opts.level,
        source: opts.source,
      });
      client.connect();
    });
}
