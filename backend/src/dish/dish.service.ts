/**
 * Dish Service
 * ============
 * Business logic for dish operations
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDishDto, UpdateDishDto, DishQueryDto } from './dto';
import {
  buildDishWhereClause,
  dishInclude,
  transformDishResponse,
} from './dish.helpers';

@Injectable()
export class DishService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get paginated list of dishes
   */
  async findAll(query: DishQueryDto) {
    const where = buildDishWhereClause(query);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [dishes, total] = await Promise.all([
      this.prisma.dish.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: dishInclude,
      }),
      this.prisma.dish.count({ where }),
    ]);

    return {
      data: dishes.map(transformDishResponse),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Get single dish by ID
   */
  async findOne(id: number) {
    const dish = await this.prisma.dish.findUnique({
      where: { id },
      include: dishInclude,
    });

    if (!dish) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }

    return transformDishResponse(dish);
  }

  /**
   * Create new dish (admin only)
   */
  async create(dto: CreateDishDto) {
    const dish = await this.prisma.dish.create({
      data: {
        title_dish: dto.titleDish,
        photo: dto.photo,
        menuId: dto.menuId,
        allergens: dto.allergenIds
          ? { connect: dto.allergenIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: dishInclude,
    });

    return transformDishResponse(dish);
  }

  /**
   * Update existing dish (admin only)
   */
  async update(id: number, dto: UpdateDishDto) {
    await this.ensureDishExists(id);

    const dish = await this.prisma.dish.update({
      where: { id },
      data: {
        title_dish: dto.titleDish,
        photo: dto.photo,
        menuId: dto.menuId,
        allergens: dto.allergenIds
          ? { set: dto.allergenIds.map((id: number) => ({ id })) }
          : undefined,
      },
      include: dishInclude,
    });

    return transformDishResponse(dish);
  }

  /**
   * Delete dish (admin only)
   */
  async remove(id: number) {
    await this.ensureDishExists(id);
    await this.prisma.dish.delete({ where: { id } });
    return { message: 'Dish deleted successfully' };
  }

  private async ensureDishExists(id: number): Promise<void> {
    const exists = await this.prisma.dish.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Dish with ID ${id} not found`);
    }
  }
}
