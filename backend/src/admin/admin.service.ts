/**
 * Admin Service
 * =============
 * Business logic for admin dashboard operations
 */

import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AdminQueryDto, CreateEmployeeDto } from './dto';
import * as bcrypt from 'bcrypt';
import {
  buildUserWhereClause,
  buildAdminOrderWhereClause,
  calculateStats,
  transformAdminUserResponse,
} from './admin.helpers';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get dashboard statistics
   */
  async getStats() {
    const stats = await this.fetchDashboardStats();
    return calculateStats(stats);
  }

  /**
   * Get all users with pagination
   */
  async getUsers(query: AdminQueryDto) {
    const where = buildUserWhereClause(query);
    return this.fetchUsersWithPagination(where, query);
  }

  /**
   * Get all orders with pagination
   */
  async getOrders(query: AdminQueryDto) {
    const where = buildAdminOrderWhereClause(query);
    return this.fetchOrdersWithPagination(where, query);
  }

  /**
   * Create new employee
   */
  async createEmployee(dto: CreateEmployeeDto) {
    await this.ensureEmailNotTaken(dto.email);
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        first_name: dto.firstName,
        telephone_number: dto.telephoneNumber ?? '',
        city: '',
        country: 'France',
        postal_address: '',
        roleId: dto.roleId,
      },
      include: { role: true },
    });

    return transformAdminUserResponse(user);
  }

  /**
   * Get all roles
   */
  async getRoles() {
    const roles = await this.prisma.role.findMany();
    return roles.map((r) => ({ id: r.id, name: r.libelle }));
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async fetchDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalOrders, pendingOrders, todayOrders, revenueResult] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.order.count(),
        this.prisma.order.count({ where: { status: 'pending' } }),
        this.prisma.order.count({ where: { order_date: { gte: today } } }),
        this.prisma.order.aggregate({
          _sum: { menu_price: true, delivery_price: true },
          where: { status: { in: ['completed', 'delivered'] } },
        }),
      ]);

    const revenue =
      (revenueResult._sum.menu_price ?? 0) +
      (revenueResult._sum.delivery_price ?? 0);

    return { totalUsers, totalOrders, pendingOrders, todayOrders, revenue };
  }

  private async fetchUsersWithPagination(where: any, query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { role: true, _count: { select: { orders: true } } },
        orderBy: { id: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map(transformAdminUserResponse),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async fetchOrdersWithPagination(where: any, query: AdminQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { id: true, email: true, first_name: true } },
        },
        orderBy: { order_date: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map((o) => ({
        id: o.id,
        orderNumber: o.order_number,
        date: o.order_date,
        status: o.status,
        total: o.menu_price + o.delivery_price,
        customer: o.user
          ? { id: o.user.id, name: o.user.first_name, email: o.user.email }
          : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async ensureEmailNotTaken(email: string): Promise<void> {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Email already in use');
    }
  }
}
