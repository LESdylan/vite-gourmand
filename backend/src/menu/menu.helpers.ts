/**
 * Menu Service Helpers
 * ====================
 * Small, focused functions for menu operations
 */

import { MenuQueryDto } from './dto';

/**
 * Menu where input type for queries
 */
interface MenuWhereInput {
  dietId?: number;
  themeId?: number;
  OR?: Array<{ title?: { contains: string; mode: string }; description?: { contains: string; mode: string } }>;
  person_min?: { lte: number };
  price_per_person?: { lte: number };
}

/**
 * Build Prisma where clause from query parameters
 */
export function buildMenuWhereClause(query: MenuQueryDto): MenuWhereInput {
  const where: MenuWhereInput = {};

  if (query.dietId) {
    where.dietId = query.dietId;
  }

  if (query.themeId) {
    where.themeId = query.themeId;
  }

  if (query.search) {
    where.OR = [
      { title: { contains: query.search, mode: 'insensitive' } },
      { description: { contains: query.search, mode: 'insensitive' } },
    ];
  }

  if (query.minPersons) {
    where.person_min = { lte: query.minPersons };
  }

  if (query.maxPrice) {
    where.price_per_person = { lte: query.maxPrice };
  }

  return where;
}

/**
 * Build pagination parameters
 */
export function buildPagination(query: MenuQueryDto): { skip: number; take: number } {
  const page = query.page ?? 1;
  const limit = query.limit ?? 10;
  return {
    skip: (page - 1) * limit,
    take: limit,
  };
}

/**
 * Calculate total pages
 */
export function calculateTotalPages(totalItems: number, limit: number): number {
  return Math.ceil(totalItems / limit);
}

/**
 * Standard menu include for fetching related data
 */
export const menuInclude = {
  diet: true,
  theme: true,
  dishes: {
    include: {
      allergens: true,
    },
  },
} as const;

/**
 * Transform menu data for API response
 */
export function transformMenuResponse(menu: any) {
  return {
    id: menu.id,
    title: menu.title,
    personMin: menu.person_min,
    pricePerPerson: menu.price_per_person,
    description: menu.description,
    remainingQty: menu.remaining_qty,
    diet: menu.diet?.libelle ?? null,
    theme: menu.theme?.libelle ?? null,
    dishes: menu.dishes?.map(transformDishResponse) ?? [],
  };
}

/**
 * Transform dish data for API response
 */
function transformDishResponse(dish: any) {
  return {
    id: dish.id,
    title: dish.title_dish,
    photo: dish.photo,
    allergens: dish.allergens?.map((a: any) => a.libelle) ?? [],
  };
}
