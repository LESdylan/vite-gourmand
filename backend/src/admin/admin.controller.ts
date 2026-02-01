/**
 * Admin Controller
 * ================
 * REST API endpoints for admin dashboard
 */

import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AdminQueryDto, CreateEmployeeDto } from './dto';
import { Roles } from '../common';

@Controller('admin')
@Roles('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  /**
   * GET /api/admin/stats - Get dashboard statistics
   */
  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  /**
   * GET /api/admin/users - Get all users
   */
  @Get('users')
  getUsers(@Query() query: AdminQueryDto) {
    return this.adminService.getUsers(query);
  }

  /**
   * GET /api/admin/orders - Get all orders
   */
  @Get('orders')
  getOrders(@Query() query: AdminQueryDto) {
    return this.adminService.getOrders(query);
  }

  /**
   * POST /api/admin/employees - Create new employee
   */
  @Post('employees')
  createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  /**
   * GET /api/admin/roles - Get all roles
   */
  @Get('roles')
  getRoles() {
    return this.adminService.getRoles();
  }
}
