/**
 * Session Service
 */
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateSessionDto } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new session
   */
  async createSession(userId: number, dto: CreateSessionDto) {
    // Default expiration: 7 days
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    return this.prisma.userSession.create({
      data: {
        user_id: userId,
        token: dto.token,
        device_info: dto.device_info,
        ip_address: dto.ip_address,
        expires_at: expiresAt,
      },
    });
  }

  /**
   * Get session by token
   */
  async getSessionByToken(token: string) {
    return this.prisma.userSession.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            role: true,
          },
        },
      },
    });
  }

  /**
   * Get all sessions for user
   */
  async getUserSessions(userId: number, currentToken?: string) {
    const sessions = await this.prisma.userSession.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        device_info: true,
        ip_address: true,
        created_at: true,
        expires_at: true,
        token: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Mark the current session
    return sessions.map((session: { id: number; device_info: string | null; ip_address: string | null; created_at: Date; expires_at: Date; token: string }) => ({
      id: session.id,
      device_info: session.device_info,
      ip_address: session.ip_address,
      created_at: session.created_at,
      expires_at: session.expires_at,
      is_current: currentToken ? session.token === currentToken : false,
    }));
  }

  /**
   * Get active sessions for user
   */
  async getActiveSessions(userId: number) {
    return this.prisma.userSession.findMany({
      where: {
        user_id: userId,
        expires_at: { gt: new Date() },
      },
      select: {
        id: true,
        device_info: true,
        ip_address: true,
        created_at: true,
        expires_at: true,
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Validate session token
   */
  async validateSession(token: string) {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
    });

    if (!session) {
      return { valid: false, reason: 'Session not found' };
    }

    if (session.expires_at < new Date()) {
      // Clean up expired session
      await this.prisma.userSession.delete({ where: { id: session.id } });
      return { valid: false, reason: 'Session expired' };
    }

    return { valid: true, userId: session.user_id };
  }

  /**
   * Revoke specific session
   */
  async revokeSession(sessionId: number, userId: number) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    if (session.user_id !== userId) {
      throw new ForbiddenException('Cannot revoke other user\'s sessions');
    }

    return this.prisma.userSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Revoke all sessions for user (except current)
   */
  async revokeAllSessions(userId: number, exceptToken?: string) {
    const where: any = { user_id: userId };

    if (exceptToken) {
      where.token = { not: exceptToken };
    }

    return this.prisma.userSession.deleteMany({ where });
  }

  /**
   * Extend session expiration
   */
  async extendSession(token: string, days: number = 7) {
    const session = await this.prisma.userSession.findUnique({
      where: { token },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + days);

    return this.prisma.userSession.update({
      where: { id: session.id },
      data: { expires_at: newExpiration },
    });
  }

  /**
   * Clean up expired sessions (scheduled job)
   */
  async cleanupExpiredSessions() {
    const result = await this.prisma.userSession.deleteMany({
      where: {
        expires_at: { lt: new Date() },
      },
    });

    return { deletedCount: result.count };
  }

  /**
   * Get session count by user (admin)
   */
  async getSessionStats() {
    const total = await this.prisma.userSession.count();
    const active = await this.prisma.userSession.count({
      where: { expires_at: { gt: new Date() } },
    });
    const expired = total - active;

    const byUser = await this.prisma.userSession.groupBy({
      by: ['user_id'],
      _count: { id: true },
      where: { expires_at: { gt: new Date() } },
    });

    return {
      total,
      active,
      expired,
      usersWithActiveSessions: byUser.length,
    };
  }

  /**
   * Get all sessions (admin)
   */
  async getAllSessions(options: { userId?: number; active?: boolean }) {
    const where: any = {};

    if (options.userId) {
      where.user_id = options.userId;
    }

    if (options.active !== undefined) {
      if (options.active) {
        where.expires_at = { gt: new Date() };
      } else {
        where.expires_at = { lt: new Date() };
      }
    }

    return this.prisma.userSession.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Force revoke session (admin)
   */
  async adminRevokeSession(sessionId: number) {
    const session = await this.prisma.userSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      throw new NotFoundException('Session not found');
    }

    return this.prisma.userSession.delete({
      where: { id: sessionId },
    });
  }

  /**
   * Force revoke all sessions for user (admin)
   */
  async adminRevokeAllUserSessions(userId: number) {
    return this.prisma.userSession.deleteMany({
      where: { user_id: userId },
    });
  }
}
