/**
 * Order Service Helpers
 * =====================
 * Small, focused functions for order operations
 */

import { OrderQueryDto } from './dto';
import { OrderStatus } from './dto/update-order-status.dto';

/**
 * Valid status transitions
 */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['delivering'],
  delivering: ['delivered'],
  delivered: ['completed'],
  completed: [],
  cancelled: [],
};

/**
 * Check if status transition is valid
 */
export function isValidStatusTransition(current: string, next: string): boolean {
  return STATUS_TRANSITIONS[current]?.includes(next) ?? false;
}

/**
 * Check if order can be cancelled
 */
export function canCancelOrder(status: string): boolean {
  return ['pending', 'confirmed', 'preparing'].includes(status);
}

/**
 * Generate unique order number
 */
export function generateOrderNumber(): string {
  const date = new Date();
  const datePart = date.toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `ORD-${datePart}-${randomPart}`;
}

/**
 * Calculate delivery fee based on person count
 */
export function calculateDeliveryFee(personNumber: number): number {
  if (personNumber >= 50) return 0;
  if (personNumber >= 30) return 15;
  if (personNumber >= 20) return 25;
  return 35;
}

/**
 * Calculate total order price
 */
export function calculateOrderTotal(
  menus: Array<{ price_per_person: number }>,
  personNumber: number,
): number {
  const menuTotal = menus.reduce((sum, menu) => sum + menu.price_per_person, 0);
  return menuTotal * personNumber;
}

/**
 * Build where clause for order queries
 */
export function buildOrderWhereClause(query: OrderQueryDto, userId?: number) {
  const where: any = {};

  if (userId) {
    where.userId = userId;
  }

  if (query.status) {
    where.status = query.status;
  }

  if (query.userId) {
    where.userId = query.userId;
  }

  return where;
}

/**
 * Standard order include for fetching related data
 */
export const orderInclude = {
  user: {
    select: {
      id: true,
      email: true,
      first_name: true,
      telephone_number: true,
    },
  },
  menus: {
    select: {
      id: true,
      title: true,
      price_per_person: true,
    },
  },
} as const;

/**
 * Transform order for API response
 */
export function transformOrderResponse(order: any) {
  return {
    id: order.id,
    orderNumber: order.order_number,
    orderDate: order.order_date,
    prestationDate: order.prestation_date,
    deliveryHour: order.delivery_hour,
    personNumber: order.person_number,
    menuPrice: order.menu_price,
    deliveryPrice: order.delivery_price,
    totalPrice: order.menu_price + order.delivery_price,
    status: order.status,
    materialLending: order.material_lending,
    getBackMaterial: order.get_back_material,
    user: order.user ? transformUserSummary(order.user) : null,
    menus: order.menus?.map(transformMenuSummary) ?? [],
  };
}

function transformUserSummary(user: any) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    phone: user.telephone_number,
  };
}

function transformMenuSummary(menu: any) {
  return {
    id: menu.id,
    title: menu.title,
    pricePerPerson: menu.price_per_person,
  };
}
