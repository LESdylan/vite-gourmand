/**
 * Order Service
 * =============
 * Business logic for order operations
 */

import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto';
import {
  generateOrderNumber,
  calculateDeliveryFee,
  calculateOrderTotal,
  isValidStatusTransition,
  canCancelOrder,
  buildOrderWhereClause,
  orderInclude,
  transformOrderResponse,
} from './order.helpers';

@Injectable()
export class OrderService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create new order
   */
  async create(dto: CreateOrderDto, userId: number) {
    const menus = await this.validateAndFetchMenus(dto.menuIds);
    const orderData = this.buildOrderData(dto, userId, menus);

    const order = await this.prisma.order.create({
      data: {
        ...orderData,
        menus: { connect: dto.menuIds.map((id) => ({ id })) },
      },
      include: orderInclude,
    });

    return transformOrderResponse(order);
  }

  /**
   * Get user's orders
   */
  async findUserOrders(userId: number, query: OrderQueryDto) {
    const where = buildOrderWhereClause(query, userId);
    return this.findOrdersWithPagination(where, query);
  }

  /**
   * Get all orders (admin/employee)
   */
  async findAll(query: OrderQueryDto) {
    const where = buildOrderWhereClause(query);
    return this.findOrdersWithPagination(where, query);
  }

  /**
   * Get single order
   */
  async findOne(id: number, userId?: number) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: orderInclude,
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return transformOrderResponse(order);
  }

  /**
   * Update order status (employee/admin)
   */
  async updateStatus(id: number, dto: UpdateOrderStatusDto) {
    const order = await this.ensureOrderExists(id);
    this.validateStatusTransition(order.status, dto.status);

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: dto.status },
      include: orderInclude,
    });

    return transformOrderResponse(updated);
  }

  /**
   * Cancel order
   */
  async cancel(id: number, userId?: number) {
    const order = await this.ensureOrderExists(id);

    if (userId && order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    if (!canCancelOrder(order.status)) {
      throw new BadRequestException(`Cannot cancel order with status: ${order.status}`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: 'cancelled' },
      include: orderInclude,
    });

    return transformOrderResponse(updated);
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async validateAndFetchMenus(menuIds: number[]) {
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });

    if (menus.length !== menuIds.length) {
      throw new BadRequestException('One or more menus not found');
    }

    return menus;
  }

  private buildOrderData(dto: CreateOrderDto, userId: number, menus: any[]) {
    const menuPrice = calculateOrderTotal(menus, dto.personNumber);
    const deliveryPrice = calculateDeliveryFee(dto.personNumber);

    return {
      order_number: generateOrderNumber(),
      order_date: new Date(),
      prestation_date: new Date(dto.prestationDate),
      delivery_hour: dto.deliveryHour,
      person_number: dto.personNumber,
      menu_price: menuPrice,
      delivery_price: deliveryPrice,
      status: 'pending',
      material_lending: dto.materialLending,
      get_back_material: false,
      userId,
    };
  }

  private async findOrdersWithPagination(where: any, query: OrderQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: orderInclude,
        orderBy: { order_date: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders.map(transformOrderResponse),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async ensureOrderExists(id: number) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }
    return order;
  }

  private validateStatusTransition(current: string, next: string) {
    if (!isValidStatusTransition(current, next)) {
      throw new BadRequestException(
        `Invalid status transition: ${current} → ${next}`,
      );
    }
  }
}
