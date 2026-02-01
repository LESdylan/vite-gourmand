/**
 * Dish Service Helpers
 * ====================
 * Small, focused functions for dish operations
 */

import { DishQueryDto } from './dto';

/**
 * Build where clause for dish queries
 */
export function buildDishWhereClause(query: DishQueryDto) {
  const where: any = {};

  if (query.menuId) {
    where.menuId = query.menuId;
  }

  if (query.search) {
    where.title_dish = { contains: query.search, mode: 'insensitive' };
  }

  return where;
}

/**
 * Standard dish include for fetching related data
 */
export const dishInclude = {
  allergens: true,
  menu: {
    select: {
      id: true,
      title: true,
    },
  },
} as const;

/**
 * Transform dish for API response
 */
export function transformDishResponse(dish: any) {
  return {
    id: dish.id,
    title: dish.title_dish,
    photo: dish.photo,
    menu: dish.menu ? { id: dish.menu.id, title: dish.menu.title } : null,
    allergens: dish.allergens?.map((a: any) => ({
      id: a.id,
      name: a.libelle,
    })) ?? [],
  };
}
