/**
 * Admin Controller
 */
import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { StatsService } from './stats.service';
import { Roles, SafeParseIntPipe } from '../common';
import { CreateEmployeeDto, UpdateRoleDto } from './dto/admin.dto';

@ApiTags('admin')
@Controller('admin')
@ApiBearerAuth()
@Roles('admin')
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly statsService: StatsService,
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getStats() {
    return this.statsService.getDashboardStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with roles' })
  async getUsers() {
    return this.adminService.getAllUsers();
  }

  @Post('employees')
  @ApiOperation({ summary: 'Create employee account' })
  async createEmployee(@Body() dto: CreateEmployeeDto) {
    return this.adminService.createEmployee(dto);
  }

  @Put('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateRole(
    @Param('id', SafeParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.adminService.updateUserRole(id, dto.roleId);
  }

  @Put('users/:id/toggle-active')
  @ApiOperation({ summary: 'Toggle user active status' })
  async toggleActive(@Param('id', SafeParseIntPipe) id: number) {
    return this.adminService.toggleUserActive(id);
  }

  @Get('roles')
  @ApiOperation({ summary: 'List all roles' })
  async getRoles() {
    return this.adminService.getRoles();
  }
}
