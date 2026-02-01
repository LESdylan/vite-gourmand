/**
 * Admin Service Helpers
 * =====================
 * Small, focused functions for admin operations
 */

import { AdminQueryDto } from './dto';

/**
 * Build user where clause for admin queries
 */
export function buildUserWhereClause(query: AdminQueryDto) {
  const where: any = {};

  if (query.search) {
    where.OR = [
      { email: { contains: query.search, mode: 'insensitive' } },
      { first_name: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.role) {
    where.role = { libelle: query.role };
  }

  return where;
}

/**
 * Build order where clause for admin queries
 */
export function buildAdminOrderWhereClause(query: AdminQueryDto) {
  const where: any = {};

  if (query.status) {
    where.status = query.status;
  }

  return where;
}

/**
 * Calculate dashboard statistics
 */
export function calculateStats(data: {
  totalUsers: number;
  totalOrders: number;
  pendingOrders: number;
  todayOrders: number;
  revenue: number;
}) {
  return {
    users: { total: data.totalUsers },
    orders: {
      total: data.totalOrders,
      pending: data.pendingOrders,
      today: data.todayOrders,
    },
    revenue: {
      total: data.revenue,
      formatted: `${data.revenue.toFixed(2)} €`,
    },
  };
}

/**
 * Transform user for admin view
 */
export function transformAdminUserResponse(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    phone: user.telephone_number,
    role: user.role?.libelle ?? 'client',
    ordersCount: user._count?.orders ?? 0,
    createdAt: user.createdAt,
  };
}
