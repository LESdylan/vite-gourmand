/**
 * Menu Service
 * ============
 * Business logic for menu operations
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto, UpdateMenuDto, MenuQueryDto } from './dto';
import {
  buildMenuWhereClause,
  buildPagination,
  calculateTotalPages,
  menuInclude,
  transformMenuResponse,
} from './menu.helpers';

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated list of menus with filters
   */
  async findAll(query: MenuQueryDto) {
    const where = buildMenuWhereClause(query);
    const pagination = buildPagination(query);

    const [menus, total] = await this.fetchMenusWithCount(where, pagination);

    return this.buildPaginatedResponse(menus, total, query);
  }

  /**
   * Get single menu by ID with all details
   */
  async findOne(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: menuInclude,
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return transformMenuResponse(menu);
  }

  /**
   * Create new menu (admin only)
   */
  async create(dto: CreateMenuDto) {
    const menu = await this.prisma.menu.create({
      data: this.mapDtoToMenuData(dto),
      include: menuInclude,
    });

    return transformMenuResponse(menu);
  }

  /**
   * Update existing menu (admin only)
   */
  async update(id: number, dto: UpdateMenuDto) {
    await this.ensureMenuExists(id);

    const menu = await this.prisma.menu.update({
      where: { id },
      data: this.mapDtoToMenuData(dto),
      include: menuInclude,
    });

    return transformMenuResponse(menu);
  }

  /**
   * Delete menu (admin only)
   */
  async remove(id: number) {
    await this.ensureMenuExists(id);
    await this.prisma.menu.delete({ where: { id } });
    return { message: 'Menu deleted successfully' };
  }

  // ============================================
  // Private Helper Methods
  // ============================================

  private async fetchMenusWithCount(where: any, pagination: { skip: number; take: number }) {
    return Promise.all([
      this.prisma.menu.findMany({
        where,
        ...pagination,
        include: menuInclude,
        orderBy: { title: 'asc' },
      }),
      this.prisma.menu.count({ where }),
    ]);
  }

  private buildPaginatedResponse(menus: any[], total: number, query: MenuQueryDto) {
    const limit = query.limit ?? 10;
    return {
      data: menus.map(transformMenuResponse),
      meta: {
        total,
        page: query.page ?? 1,
        limit,
        totalPages: calculateTotalPages(total, limit),
      },
    };
  }

  private async ensureMenuExists(id: number): Promise<void> {
    const exists = await this.prisma.menu.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
  }

  private mapDtoToMenuData(dto: CreateMenuDto | UpdateMenuDto) {
    const data: any = {};
    
    if (dto.title !== undefined) data.title = dto.title;
    if (dto.personMin !== undefined) data.person_min = dto.personMin;
    if (dto.pricePerPerson !== undefined) data.price_per_person = dto.pricePerPerson;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.remainingQty !== undefined) data.remaining_qty = dto.remainingQty;
    if (dto.dietId !== undefined) data.dietId = dto.dietId;
    if (dto.themeId !== undefined) data.themeId = dto.themeId;
    
    return data;
  }
}
