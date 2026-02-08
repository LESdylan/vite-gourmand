import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Stock Calculator Service
 * 
 * Subject requirement: "from the ingredients table we should be able to count stock of menus and stock each dishes too"
 * 
 * Calculates available stock (how many servings/orders possible) based on ingredient availability.
 */

@Injectable()
export class StockCalculatorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Calculate maximum servings possible for a specific dish
   * based on current ingredient stock.
   * 
   * @param dishId - The dish to calculate stock for
   * @returns Maximum number of servings possible (0 if any ingredient is out of stock)
   */
  async calculateDishStock(dishId: number): Promise<number> {
    // Get all ingredients needed for this dish
    const dishIngredients = await this.prisma.dishIngredient.findMany({
      where: { dish_id: dishId },
      include: {
        ingredient: true,
      },
    });

    if (dishIngredients.length === 0) {
      // No ingredients defined = unlimited stock (or dish is incomplete)
      return Infinity;
    }

    // For each ingredient, calculate how many servings we can make
    const servingsPerIngredient = dishIngredients.map((di) => {
      if (di.quantity === 0) return Infinity; // Avoid division by zero
      return Math.floor(di.ingredient.current_stock / di.quantity);
    });

    // The bottleneck ingredient determines max servings
    return Math.min(...servingsPerIngredient);
  }

  /**
   * Calculate maximum orders possible for a specific menu
   * based on current ingredient stock and menu composition.
   * 
   * Strategy:
   * 1. Get all dishes in the menu
   * 2. For each dish, calculate max servings
   * 3. Multiply by person_min (each order requires person_min servings)
   * 4. Return the minimum across all dishes
   * 
   * @param menuId - The menu to calculate stock for
   * @returns Maximum number of orders possible
   */
  async calculateMenuStock(menuId: number): Promise<number> {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        dishes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    if (menu.dishes.length === 0) {
      // No dishes = unlimited stock (or menu is incomplete)
      return Infinity;
    }

    // For each dish in the menu, calculate stock
    const stockPerDish = await Promise.all(
      menu.dishes.map((dish) => this.calculateDishStock(dish.id))
    );

    // The bottleneck dish determines max servings
    const maxServings = Math.min(...stockPerDish);

    // Each order requires person_min servings
    // So max orders = maxServings / person_min
    if (menu.person_min === 0) return Infinity; // Avoid division by zero
    return Math.floor(maxServings / menu.person_min);
  }

  /**
   * Calculate stock for all menus at once.
   * Useful for admin dashboard showing menu availability.
   * 
   * @returns Array of { menuId, menuTitle, availableStock }
   */
  async calculateAllMenusStock(): Promise<Array<{ menuId: number; menuTitle: string; availableStock: number }>> {
    const menus = await this.prisma.menu.findMany({
      where: { status: 'published' },
      select: { id: true, title: true },
    });

    const results = await Promise.all(
      menus.map(async (menu) => {
        const stock = await this.calculateMenuStock(menu.id);
        return {
          menuId: menu.id,
          menuTitle: menu.title,
          availableStock: stock === Infinity ? -1 : stock, // -1 = unlimited
        };
      })
    );

    return results;
  }

  /**
   * Check if a menu has sufficient stock for a given order quantity.
   * 
   * @param menuId - The menu being ordered
   * @param personNumber - Number of persons in the order
   * @returns true if sufficient stock, false otherwise
   */
  async hasStockForOrder(menuId: number, personNumber: number): Promise<boolean> {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
    });

    if (!menu) return false;

    // Check menu.remaining_qty (manual stock field from subject)
    if (menu.remaining_qty < 1) return false;

    // Check ingredient-based stock
    const maxOrders = await this.calculateMenuStock(menuId);
    
    // Each order requires (personNumber / person_min) "units" of the menu
    const ordersNeeded = Math.ceil(personNumber / menu.person_min);
    
    return maxOrders >= ordersNeeded;
  }

  /**
   * Get low-stock alerts for ingredients below min_stock_level.
   * 
   * @returns Array of ingredients needing restocking
   */
  async getLowStockAlerts(): Promise<Array<{
    id: number;
    name: string;
    currentStock: number;
    minStockLevel: number;
    unit: string;
  }>> {
    const ingredients = await this.prisma.ingredient.findMany({
      where: {
        current_stock: {
          lt: this.prisma.ingredient.fields.min_stock_level, // current_stock < min_stock_level
        },
      },
      select: {
        id: true,
        name: true,
        current_stock: true,
        min_stock_level: true,
        unit: true,
      },
    });

    return ingredients.map((ing) => ({
      id: ing.id,
      name: ing.name,
      currentStock: ing.current_stock,
      minStockLevel: ing.min_stock_level,
      unit: ing.unit,
    }));
  }

  /**
   * Deduct ingredients from stock when an order is confirmed.
   * 
   * @param menuId - The menu being ordered
   * @param personNumber - Number of persons in the order
   */
  async deductStockForOrder(menuId: number, personNumber: number): Promise<void> {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        dishes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    // Deduct manual stock
    await this.prisma.menu.update({
      where: { id: menuId },
      data: { remaining_qty: { decrement: 1 } },
    });

    // Deduct ingredient stock
    for (const dish of menu.dishes) {
      for (const di of dish.ingredients) {
        const quantityNeeded = di.quantity * personNumber;
        await this.prisma.ingredient.update({
          where: { id: di.ingredient_id },
          data: {
            current_stock: {
              decrement: quantityNeeded,
            },
          },
        });
      }
    }
  }

  /**
   * Restore ingredients to stock when an order is cancelled.
   * 
   * @param menuId - The menu that was ordered
   * @param personNumber - Number of persons in the cancelled order
   */
  async restoreStockForOrder(menuId: number, personNumber: number): Promise<void> {
    const menu = await this.prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        dishes: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    if (!menu) {
      throw new Error(`Menu ${menuId} not found`);
    }

    // Restore manual stock
    await this.prisma.menu.update({
      where: { id: menuId },
      data: { remaining_qty: { increment: 1 } },
    });

    // Restore ingredient stock
    for (const dish of menu.dishes) {
      for (const di of dish.ingredients) {
        const quantityToRestore = di.quantity * personNumber;
        await this.prisma.ingredient.update({
          where: { id: di.ingredient_id },
          data: {
            current_stock: {
              increment: quantityToRestore,
            },
          },
        });
      }
    }
  }
}
