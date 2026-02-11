/**
 * Menu Types and Fallback Data
 *
 * This file provides:
 * 1. Type definitions for menus
 * 2. Fallback static data when API is unavailable
 *
 * NOTE: Primary data should come from the API via useMenus hook.
 * This static data is only used as a fallback.
 */

export type DietaryType =
  | 'classique'
  | 'végétarien'
  | 'vegan'
  | 'sans-gluten'
  | 'sans-lactose'
  | 'halal'
  | 'casher'
  | 'bio';

export interface MenuComposition {
  entreeDishes: string[];
  mainDishes: string[];
  dessertDishes: string[];
}

export interface Menu {
  id: string;
  name: string;
  theme: string;
  description: string;
  composition?: MenuComposition;
  dietary: DietaryType[];
  minPersons: number;
  maxPersons: number;
  pricePerPerson: number;
  image: string;
  allergens: string[];
  deliveryNotes?: string;
  stockQuantity: number;
  dishes?: {
    entrees: { id: number; title: string; description: string | null; photo_url: string | null }[];
    mains: { id: number; title: string; description: string | null; photo_url: string | null }[];
    desserts: { id: number; title: string; description: string | null; photo_url: string | null }[];
  };
}

// Default fallback image
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format';

/**
 * Empty menus array - data comes from API
 * Use the useMenus hook to fetch real data
 */
export const menus: Menu[] = [];

/**
 * Get menu by ID (fallback, prefer API)
 * @deprecated Use menuService.getMenuById() instead
 */
export function getMenuById(id: string): Menu | undefined {
  return menus.find((menu) => menu.id === id);
}

/**
 * Get all themes (fallback, prefer API)
 * @deprecated Use menuService.getThemes() instead
 */
export function getAllThemes(): string[] {
  return ['Gastronomie', 'Mariage', 'Entreprise', 'Anniversaire', 'Végétarien', 'Vegan', 'Fêtes'];
}

/**
 * Get all dietary types
 */
export function getAllDietaryTypes(): DietaryType[] {
  return [
    'classique',
    'végétarien',
    'vegan',
    'sans-gluten',
    'sans-lactose',
    'halal',
    'casher',
    'bio',
  ];
}

/**
 * Filter menus by theme (fallback)
 * @deprecated Use API filters instead
 */
export function getMenusByTheme(theme: string): Menu[] {
  return menus.filter((menu) => menu.theme === theme);
}

/**
 * Filter menus by dietary type (fallback)
 * @deprecated Use API filters instead
 */
export function getMenusByDietary(dietary: DietaryType): Menu[] {
  return menus.filter((menu) => menu.dietary.includes(dietary));
}
