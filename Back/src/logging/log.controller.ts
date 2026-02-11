/**
 * Log Controller - REST endpoint for DevBoard log streaming
 */
import { Controller, Get, Delete, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { LogService, StructuredLog } from './log.service';

@Controller('logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'employe')
export class LogController {
  constructor(private readonly logService: LogService) {}

  /**
   * GET /api/logs
   * Fetch recent logs with optional filtering
   */
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
   */
  @Get('stream')
  async *streamLogs(): AsyncGenerator<string> {
    let lastCount = this.logService.getCount();
    
    // Send initial logs
    const initialLogs = this.logService.getLogs({ limit: 50 });
    for (const log of initialLogs) {
      yield `data: ${JSON.stringify(log)}\n\n`;
    }
    
    // Poll for new logs every 500ms
    while (true) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const currentCount = this.logService.getCount();
      
      if (currentCount > lastCount) {
        const newLogs = this.logService.getLogs({ limit: currentCount - lastCount });
        for (const log of newLogs.slice(-(currentCount - lastCount))) {
          yield `data: ${JSON.stringify(log)}\n\n`;
        }
        lastCount = currentCount;
      }
    }
  }

  /**
   * DELETE /api/logs
   * Clear all logs
   */
  @Delete()
  clearLogs(): { message: string } {
    this.logService.clear();
    return { message: 'Logs cleared' };
  }

  /**
   * GET /api/logs/count
   * Get total log count
   */
  @Get('count')
  getLogCount(): { count: number } {
    return { count: this.logService.getCount() };
  }
}
