/**
 * Order Controller
 * ================
 * REST API endpoints for order operations
 */

import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto';
import { CurrentUser, Roles } from '../common';
import type { UserPayload } from '../common/decorators/current-user.decorator';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  /**
   * POST /api/orders - Place new order
   */
  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: UserPayload) {
    return this.orderService.create(dto, user.id);
  }

  /**
   * GET /api/orders - Get user's orders (or all for admin)
   */
  @Get()
  findAll(@Query() query: OrderQueryDto, @CurrentUser() user: UserPayload) {
    if (user.role === 'admin' || user.role === 'employee') {
      return this.orderService.findAll(query);
    }
    return this.orderService.findUserOrders(user.id, query);
  }

  /**
   * GET /api/orders/:id - Get order details
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.role === 'admin' ? undefined : user.id;
    return this.orderService.findOne(id, userId);
  }

  /**
   * PATCH /api/orders/:id/status - Update order status (employee/admin)
   */
  @Roles('admin', 'employee')
  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, dto);
  }

  /**
   * DELETE /api/orders/:id - Cancel order
   */
  @Delete(':id')
  cancel(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: UserPayload,
  ) {
    const userId = user.role === 'admin' ? undefined : user.id;
    return this.orderService.cancel(id, userId);
  }
}
