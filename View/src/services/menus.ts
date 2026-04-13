/**
 * Menu Service
 * Fetches menus, dishes, themes, diets from PostgREST via Supabase client.
 */

import { supabase } from '../lib/supabase';

// ── Types matching UUID-based PostgREST schema ──────────────────

export interface Diet {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface Theme {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface MenuImage {
  id: string;
  menu_id: string;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface Allergen {
  id: string;
  name: string;
  icon_url: string | null;
}

export interface DishAllergen {
  allergens: Allergen;
}

export interface Dish {
  id: string;
  title: string;
  description: string | null;
  photo_url: string | null;
  course_type: 'entree' | 'plat' | 'dessert';
  dish_allergens?: DishAllergen[];
}

export interface MenuDish {
  dishes: Dish;
}

export interface MenuFromAPI {
  id: string;
  title: string;
  description: string | null;
  conditions: string | null;
  person_min: number;
  price_per_person: number;
  remaining_qty: number;
  status: 'published' | 'draft';
  diet_id: string | null;
  theme_id: string | null;
  is_seasonal: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  diets: Diet | null;
  themes: Theme | null;
  menu_images: MenuImage[];
  menu_dishes: MenuDish[];
}

// Frontend-friendly format
export interface Menu {
  id: string;
  name: string;
  theme: string;
  themeId: string | null;
  description: string;
  dietary: string[];
  minPersons: number;
  maxPersons: number;
  pricePerPerson: number;
  image: string;
  images: MenuImage[];
  allergens: string[];
  deliveryNotes?: string;
  stockQuantity: number;
  dishes: {
    entrees: Dish[];
    mains: Dish[];
    desserts: Dish[];
  };
}

export interface MenuFilters {
  page?: number;
  limit?: number;
  status?: string;
  dietId?: string;
  themeId?: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Default fallback image
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format';

/**
 * Transform API menu to frontend format
 */
function transformMenu(apiMenu: MenuFromAPI): Menu {
  const primaryImage = apiMenu.menu_images?.find((img) => img.is_primary);
  const firstImage = apiMenu.menu_images?.[0];
  const imageUrl = primaryImage?.image_url || firstImage?.image_url || FALLBACK_IMAGE;

  const images = [...(apiMenu.menu_images || [])].sort(
    (a, b) => a.display_order - b.display_order,
  );

  // Extract dishes from the join table
  const allDishes = (apiMenu.menu_dishes || []).map((md) => md.dishes).filter(Boolean);
  const entrees = allDishes.filter((d) => d.course_type === 'entree');
  const mains = allDishes.filter((d) => d.course_type === 'plat');
  const desserts = allDishes.filter((d) => d.course_type === 'dessert');

  const dietary: string[] = [];
  if (apiMenu.diets?.name) {
    dietary.push(apiMenu.diets.name.toLowerCase());
  }

  // Extract allergens from all dishes (deduplicated)
  const allergenSet = new Set<string>();
  for (const dish of allDishes) {
    if (dish.dish_allergens) {
      for (const da of dish.dish_allergens) {
        if (da.allergens?.name) {
          allergenSet.add(da.allergens.name);
        }
      }
    }
  }

  return {
    id: apiMenu.id,
    name: apiMenu.title,
    theme: apiMenu.themes?.name || 'Non défini',
    themeId: apiMenu.theme_id,
    description: apiMenu.description || '',
    dietary: dietary.length > 0 ? dietary : ['classique'],
    minPersons: apiMenu.person_min,
    maxPersons: apiMenu.person_min * 5,
    pricePerPerson: Number(apiMenu.price_per_person),
    image: imageUrl,
    images,
    allergens: [...allergenSet].sort(),
    deliveryNotes: apiMenu.conditions || undefined,
    stockQuantity: apiMenu.remaining_qty,
    dishes: { entrees, mains, desserts },
  };
}

// PostgREST select that deeply joins images, dishes, allergens
const MENU_SELECT = `
  *,
  diets (*),
  themes (*),
  menu_images (*),
  menu_dishes (
    dishes (
      *,
      dish_allergens (
        allergens (*)
      )
    )
  )
`.replace(/\s+/g, '');

/**
 * Fetch published menus with pagination
 */
export async function getMenus(
  filters: MenuFilters = {},
): Promise<{ menus: Menu[]; meta: PaginationMeta }> {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('menus')
    .select(MENU_SELECT, { count: 'exact' })
    .eq('status', filters.status ?? 'published')
    .range(from, to)
    .order('created_at', { ascending: false });

  if (filters.dietId) query = query.eq('diet_id', filters.dietId);
  if (filters.themeId) query = query.eq('theme_id', filters.themeId);

  const { data, error, count } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  const totalPages = Math.ceil(total / limit);

  return {
    menus: (data as unknown as MenuFromAPI[]).map(transformMenu),
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  };
}

/**
 * Fetch single menu by UUID
 */
export async function getMenuById(id: string): Promise<Menu> {
  const { data, error } = await supabase
    .from('menus')
    .select(MENU_SELECT)
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return transformMenu(data as unknown as MenuFromAPI);
}

/**
 * Get all themes
 */
export async function getThemes(): Promise<Theme[]> {
  const { data, error } = await supabase
    .from('themes')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data as Theme[];
}

/**
 * Get all diets
 */
export async function getDiets(): Promise<Diet[]> {
  const { data, error } = await supabase
    .from('diets')
    .select('*')
    .order('name');

  if (error) throw new Error(error.message);
  return data as Diet[];
}

