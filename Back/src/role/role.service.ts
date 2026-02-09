/**
 * Role & Permission Service
 */
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreatePermissionDto, UpdatePermissionDto, CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // ============ Permissions ============

  /**
   * Get all permissions
   */
  async findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get permission by ID
   */
  async findPermissionById(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    return permission;
  }

  /**
   * Get permission by name
   */
  async findPermissionByName(name: string) {
    return this.prisma.permission.findUnique({
      where: { name },
    });
  }

  /**
   * Create permission
   */
  async createPermission(dto: CreatePermissionDto) {
    // Check for duplicate name
    const existing = await this.prisma.permission.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Permission with this name already exists');
    }

    return this.prisma.permission.create({
      data: {
        name: dto.name,
        description: dto.description,
        resource: dto.resource,
        action: dto.action,
      },
    });
  }

  /**
   * Update permission
   */
  async updatePermission(id: number, dto: UpdatePermissionDto) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Check for duplicate name
    if (dto.name && dto.name !== permission.name) {
      const existing = await this.prisma.permission.findUnique({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Permission with this name already exists');
      }
    }

    return this.prisma.permission.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Delete permission
   */
  async deletePermission(id: number) {
    const permission = await this.prisma.permission.findUnique({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException('Permission not found');
    }

    // Remove from all roles first
    await this.prisma.rolePermission.deleteMany({
      where: { permission_id: id },
    });

    return this.prisma.permission.delete({
      where: { id },
    });
  }

  // ============ Roles ============

  /**
   * Get all roles
   */
  async findAllRoles() {
    return this.prisma.role.findMany({
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  /**
   * Get role by ID
   */
  async findRoleById(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
        users: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    return role;
  }

  /**
   * Get role by name
   */
  async findRoleByName(name: string) {
    return this.prisma.role.findUnique({
      where: { name },
      include: {
        permissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Create role
   */
  async createRole(dto: CreateRoleDto) {
    // Check for duplicate name
    const existing = await this.prisma.role.findUnique({
      where: { name: dto.name },
    });

    if (existing) {
      throw new ConflictException('Role with this name already exists');
    }

    const role = await this.prisma.role.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    // Assign permissions if provided
    if (dto.permissionIds && dto.permissionIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: dto.permissionIds.map((permissionId) => ({
          role_id: role.id,
          permission_id: permissionId,
        })),
      });
    }

    return this.findRoleById(role.id);
  }

  /**
   * Update role
   */
  async updateRole(id: number, dto: UpdateRoleDto) {
    const role = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Check for duplicate name
    if (dto.name && dto.name !== role.name) {
      const existing = await this.prisma.role.findUnique({
        where: { name: dto.name },
      });

      if (existing) {
        throw new ConflictException('Role with this name already exists');
      }
    }

    // Update role basic info
    await this.prisma.role.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
      },
    });

    // Update permissions if provided
    if (dto.permissionIds) {
      // Remove all existing permissions
      await this.prisma.rolePermission.deleteMany({
        where: { role_id: id },
      });

      // Add new permissions
      if (dto.permissionIds.length > 0) {
        await this.prisma.rolePermission.createMany({
          data: dto.permissionIds.map((permissionId) => ({
            role_id: id,
            permission_id: permissionId,
          })),
        });
      }
    }

    return this.findRoleById(id);
  }

  /**
   * Delete role
   */
  async deleteRole(id: number) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    if (role._count.users > 0) {
      throw new ConflictException('Cannot delete role with assigned users');
    }

    // Remove all permissions
    await this.prisma.rolePermission.deleteMany({
      where: { role_id: id },
    });

    return this.prisma.role.delete({
      where: { id },
    });
  }

  /**
   * Assign permissions to role
   */
  async assignPermissions(roleId: number, permissionIds: number[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    // Get existing permissions
    const existingPermissions = await this.prisma.rolePermission.findMany({
      where: { role_id: roleId },
      select: { permission_id: true },
    });

    const existingIds = existingPermissions.map((p: { permission_id: number }) => p.permission_id);
    const newIds = permissionIds.filter((id) => !existingIds.includes(id));

    if (newIds.length > 0) {
      await this.prisma.rolePermission.createMany({
        data: newIds.map((permissionId) => ({
          role_id: roleId,
          permission_id: permissionId,
        })),
      });
    }

    return this.findRoleById(roleId);
  }

  /**
   * Remove permissions from role
   */
  async removePermissions(roleId: number, permissionIds: number[]) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException('Role not found');
    }

    await this.prisma.rolePermission.deleteMany({
      where: {
        role_id: roleId,
        permission_id: { in: permissionIds },
      },
    });

    return this.findRoleById(roleId);
  }

  /**
   * Check if user has permission
   */
  async userHasPermission(userId: number, permissionName: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.userRole) {
      return false;
    }

    return user.userRole.permissions.some(
      (rp: { permission: { name: string } }) => rp.permission.name === permissionName,
    );
  }

  /**
   * Get user permissions
   */
  async getUserPermissions(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRole: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user || !user.userRole) {
      return [];
    }

    return user.userRole.permissions.map((rp: { permission: { id: number; name: string; description: string | null; resource: string | null; action: string | null } }) => rp.permission);
  }
}
