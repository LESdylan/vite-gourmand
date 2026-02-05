/**
 * LogClient - WebSocket connection to log stream
 * Handles reconnection and clean shutdown
 */

import { io, Socket } from 'socket.io-client';
import type { StructuredLog, LogOptions } from './types.js';
import { formatLog, printWaiting, printConnected, printDisconnected } from './formatter.js';

const DEFAULT_URL = 'http://localhost:3000';

export class LogClient {
  private socket: Socket | null = null;
  private url: string;
  private options: LogOptions;

  constructor(url = DEFAULT_URL, options: LogOptions = {}) {
    this.url = url;
    this.options = options;
  }

  connect(): void {
    const query = this.buildQuery();
    this.socket = io(`${this.url}/logs`, { query, reconnection: true });
    
    this.socket.on('connect', () => printConnected(this.url));
    this.socket.on('disconnect', () => printDisconnected());
    this.socket.on('log', (log: StructuredLog) => this.handleLog(log));

    printWaiting();
    this.setupShutdown();
  }

  private buildQuery(): Record<string, string> {
    const query: Record<string, string> = {};
    if (this.options.level) query.level = this.options.level;
    if (this.options.source) query.source = this.options.source;
    return query;
  }

  private handleLog(log: StructuredLog): void {
    console.log(formatLog(log));
  }

  private setupShutdown(): void {
    const cleanup = (): void => {
      console.log('\n');
      this.socket?.disconnect();
      process.exit(0);
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  }

  disconnect(): void {
    this.socket?.disconnect();
  }
}
