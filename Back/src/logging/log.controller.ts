/**
 * Log Controller - REST endpoint for DevBoard log streaming
 */
import {
  Controller,
  Get,
  Delete,
  Query,
  UseGuards,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { LogService, StructuredLog } from './log.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('logs')
export class LogController {
  constructor(
    private readonly logService: LogService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Validate JWT token from query parameter (for SSE which doesn't support headers)
   */
  private validateTokenFromQuery(token: string): boolean {
    if (!token) return false;

    try {
      const secret = this.configService.get<string>('JWT_SECRET') || 'secret';
      const payload = this.jwtService.verify(token, { secret });

      // Check if user has admin or employe role
      const role = payload.role;
      return role === 'admin' || role === 'employe' || role === 'superadmin';
    } catch {
      return false;
    }
  }

  /**
   * GET /api/logs
   * Fetch recent logs with optional filtering
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employe', 'superadmin')
  @Get()
  getLogs(
    @Query('limit') limit?: string,
    @Query('level') level?: string,
    @Query('source') source?: string,
    @Query('since') since?: string,
  ): StructuredLog[] {
    return this.logService.getLogs({
      limit: limit ? parseInt(limit, 10) : undefined,
      level,
      source,
      since,
    });
  }

  /**
   * GET /api/logs/stream
   * SSE endpoint for live log streaming
   * Accepts token via query parameter since EventSource doesn't support headers
   */
  @Public()
  @Get('stream')
  async streamLogs(
    @Query('token') token: string,
    @Res() res: Response,
  ): Promise<void> {
    // Validate token from query parameter
    if (!this.validateTokenFromQuery(token)) {
      throw new UnauthorizedException('Invalid or missing token');
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx buffering
    res.flushHeaders();

    let lastCount = this.logService.getCount();

    // Send initial logs
    const initialLogs = this.logService.getLogs({ limit: 50 });
    for (const log of initialLogs) {
      res.write(`data: ${JSON.stringify(log)}\n\n`);
    }

    // Poll for new logs every 500ms
    const interval = setInterval(() => {
      const currentCount = this.logService.getCount();

      if (currentCount > lastCount) {
        const newLogs = this.logService.getLogs({
          limit: currentCount - lastCount,
        });
        for (const log of newLogs.slice(-(currentCount - lastCount))) {
          res.write(`data: ${JSON.stringify(log)}\n\n`);
        }
        lastCount = currentCount;
      }
    }, 500);

    // Clean up on client disconnect
    res.on('close', () => {
      clearInterval(interval);
      res.end();
    });
  }

  /**
   * DELETE /api/logs
   * Clear all logs
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employe', 'superadmin')
  @Delete()
  clearLogs(): { message: string } {
    this.logService.clear();
    return { message: 'Logs cleared' };
  }

  /**
   * GET /api/logs/count
   * Get total log count
   */
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin', 'employe', 'superadmin')
  @Get('count')
  getLogCount(): { count: number } {
    return { count: this.logService.getCount() };
  }
}
