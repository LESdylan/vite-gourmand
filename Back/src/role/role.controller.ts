/**
 * Role & Permission Controller
 */
import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { Roles, SafeParseIntPipe, CurrentUser } from '../common';
import { CreatePermissionDto, UpdatePermissionDto, CreateRoleDto, UpdateRoleDto, AssignPermissionsDto } from './dto/role.dto';
import { JwtPayload } from '../common/types/request.types';

@ApiTags('roles')
@Controller('roles')
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  // ============ Permission Endpoints ============

  @Get('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'List all permissions' })
  async findAllPermissions() {
    return this.roleService.findAllPermissions();
  }

  @Get('permissions/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get permission by ID' })
  async findPermissionById(@Param('id', SafeParseIntPipe) id: number) {
    return this.roleService.findPermissionById(id);
  }

  @Post('permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Create permission' })
  async createPermission(@Body() dto: CreatePermissionDto) {
    return this.roleService.createPermission(dto);
  }

  @Put('permissions/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update permission' })
  async updatePermission(
    @Param('id', SafeParseIntPipe) id: number,
    @Body() dto: UpdatePermissionDto,
  ) {
    return this.roleService.updatePermission(id, dto);
  }

  @Delete('permissions/:id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete permission' })
  async deletePermission(@Param('id', SafeParseIntPipe) id: number) {
    return this.roleService.deletePermission(id);
  }

  // ============ Role Endpoints ============

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'List all roles' })
  async findAllRoles() {
    return this.roleService.findAllRoles();
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Get role by ID' })
  async findRoleById(@Param('id', SafeParseIntPipe) id: number) {
    return this.roleService.findRoleById(id);
  }

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Create role' })
  async createRole(@Body() dto: CreateRoleDto) {
    return this.roleService.createRole(dto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Update role' })
  async updateRole(
    @Param('id', SafeParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
  ) {
    return this.roleService.updateRole(id, dto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Delete role' })
  async deleteRole(@Param('id', SafeParseIntPipe) id: number) {
    return this.roleService.deleteRole(id);
  }

  // ============ Role Permission Management ============

  @Post(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Assign permissions to role' })
  async assignPermissions(
    @Param('id', SafeParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(id, dto.permissionIds);
  }

  @Delete(':id/permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Remove permissions from role' })
  async removePermissions(
    @Param('id', SafeParseIntPipe) id: number,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.roleService.removePermissions(id, dto.permissionIds);
  }

  // ============ User Permission Check ============

  @Get('users/:userId/permissions')
  @Roles('admin')
  @ApiOperation({ summary: 'Get user permissions' })
  async getUserPermissions(@Param('userId', SafeParseIntPipe) userId: number) {
    return this.roleService.getUserPermissions(userId);
  }

  @Get('users/:userId/check/:permissionName')
  @Roles('admin')
  @ApiOperation({ summary: 'Check if user has permission' })
  async userHasPermission(
    @Param('userId', SafeParseIntPipe) userId: number,
    @Param('permissionName') permissionName: string,
  ) {
    const hasPermission = await this.roleService.userHasPermission(userId, permissionName);
    return { hasPermission };
  }

  // ============ Current User Permissions ============

  @Get('me/permissions')
  @Roles('user', 'admin', 'employee')
  @ApiOperation({ summary: 'Get my permissions' })
  async getMyPermissions(@CurrentUser() user: JwtPayload) {
    return this.roleService.getUserPermissions(user.sub);
  }
}
