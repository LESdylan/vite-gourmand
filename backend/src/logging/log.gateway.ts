/**
 * LogGateway - WebSocket server for log streaming
 * Fly.io-style real-time log broadcaster
 */

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { LogEmitter } from './log.emitter';
import type { StructuredLog, LogFilter, LogLevel } from './types';
import { LOG_LEVELS } from './types';

@WebSocketGateway({
  namespace: '/logs',
  cors: { origin: '*' },
})
export class LogGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private clientFilters = new Map<string, LogFilter>();

  constructor(private readonly logEmitter: LogEmitter) {}

  afterInit(): void {
    this.logEmitter.onLog((log) => this.broadcast(log));
    this.logEmitter.info('ws', 'Log streaming gateway initialized');
  }

  handleConnection(client: Socket): void {
    const filter = this.parseFilter(client.handshake.query);
    this.clientFilters.set(client.id, filter);
    this.logEmitter.info('ws', `Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.clientFilters.delete(client.id);
    this.logEmitter.debug('ws', `Client disconnected: ${client.id}`);
  }

  private broadcast(log: StructuredLog): void {
    for (const [clientId, filter] of this.clientFilters) {
      if (this.matchesFilter(log, filter)) {
        this.server.to(clientId).emit('log', log);
      }
    }
  }

  private matchesFilter(log: StructuredLog, filter: LogFilter): boolean {
    if (filter.level && LOG_LEVELS[log.level] < LOG_LEVELS[filter.level]) {
      return false;
    }
    if (filter.source && log.source !== filter.source) {
      return false;
    }
    return true;
  }

  private parseFilter(query: Record<string, unknown>): LogFilter {
    return {
      level: (query.level as LogLevel) || undefined,
      source: query.source as LogFilter['source'],
    };
  }
}
