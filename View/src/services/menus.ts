/**
 * Menu Service
 * API calls for menu operations - fetches from backend/Supabase
 */

import { apiRequest } from './api';

// Types matching backend schema
export interface Diet {
  id: number;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface Theme {
  id: number;
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface MenuImage {
  id: number;
  menu_id: number;
  image_url: string;
  alt_text: string | null;
  display_order: number;
  is_primary: boolean;
}

export interface Dish {
  id: number;
  title: string;
  description: string | null;
  photo_url: string | null;
  course_type: 'entrée' | 'plat' | 'dessert';
}

export interface MenuFromAPI {
  id: number;
  title: string;
  description: string | null;
  conditions: string | null;
  person_min: number;
  price_per_person: number;
  remaining_qty: number;
  status: 'published' | 'draft';
  diet_id: number | null;
  theme_id: number | null;
  is_seasonal: boolean;
  available_from: string | null;
  available_until: string | null;
  created_at: string;
  Diet: Diet | null;
  Theme: Theme | null;
  MenuImage: MenuImage[];
  Dish: Dish[];
}

// Frontend-friendly format
export interface Menu {
  id: string;
  name: string;
  theme: string;
  description: string;
  dietary: string[];
  minPersons: number;
  maxPersons: number;
  pricePerPerson: number;
  image: string;
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
  dietId?: number;
  themeId?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface MenuListResponse {
  items: MenuFromAPI[];
  meta: PaginationMeta;
}

// API wrapper response structure (backend wraps all responses)
interface ApiWrapperResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  path: string;
  timestamp: string;
}

// Default fallback image
const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&auto=format';

/**
 * Transform API menu to frontend format
 */
function transformMenu(apiMenu: MenuFromAPI): Menu {
  // Get primary image or first image or fallback
  const primaryImage = apiMenu.MenuImage?.find(img => img.is_primary);
  const firstImage = apiMenu.MenuImage?.[0];
  const imageUrl = primaryImage?.image_url || firstImage?.image_url || FALLBACK_IMAGE;

  // Group dishes by course type
  const entrees = apiMenu.Dish?.filter(d => d.course_type === 'entrée') || [];
  const mains = apiMenu.Dish?.filter(d => d.course_type === 'plat') || [];
  const desserts = apiMenu.Dish?.filter(d => d.course_type === 'dessert') || [];

  // Get dietary info from Diet relation
  const dietary: string[] = [];
  if (apiMenu.Diet?.name) {
    dietary.push(apiMenu.Diet.name.toLowerCase());
  }

  return {
    id: `m${apiMenu.id.toString().padStart(3, '0')}`,
    name: apiMenu.title,
    theme: apiMenu.Theme?.name || 'Non défini',
    description: apiMenu.description || '',
    dietary: dietary.length > 0 ? dietary : ['classique'],
    minPersons: apiMenu.person_min,
    maxPersons: apiMenu.person_min * 5, // Estimate max based on min
    pricePerPerson: Number(apiMenu.price_per_person),
    image: imageUrl,
    allergens: [], // Would need separate allergen fetching
    deliveryNotes: apiMenu.conditions || undefined,
    stockQuantity: apiMenu.remaining_qty,
    dishes: {
      entrees,
      mains,
      desserts,
    },
  };
}

/**
 * Fetch all published menus from API
 */
export async function getMenus(filters: MenuFilters = {}): Promise<{ menus: Menu[]; meta: PaginationMeta }> {
  const params = new URLSearchParams();
  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.status) params.set('status', filters.status);
  if (filters.dietId) params.set('dietId', filters.dietId.toString());
  if (filters.themeId) params.set('themeId', filters.themeId.toString());

  const queryString = params.toString();
  const endpoint = `/api/menus${queryString ? `?${queryString}` : ''}`;
  
  // API returns wrapped response: { success, data: { items, meta } }
  const response = await apiRequest<ApiWrapperResponse<MenuListResponse>>(endpoint);
  
  // Extract data from wrapper
  const data = response.data;
  
  return {
    menus: data.items.map(transformMenu),
    meta: data.meta,
  };
}

/**
 * Fetch single menu by ID
 */
export async function getMenuById(id: number): Promise<Menu> {
  const response = await apiRequest<ApiWrapperResponse<MenuFromAPI>>(`/api/menus/${id}`);
  return transformMenu(response.data);
}

/**
 * Get all available themes
 */
export async function getThemes(): Promise<Theme[]> {
  try {
    const response = await apiRequest<ApiWrapperResponse<Theme[]>>('/api/themes');
    return response.data;
  } catch {
    // Fallback: extract themes from menus
    const { menus } = await getMenus({ limit: 100 });
    const themeNames = [...new Set(menus.map(m => m.theme))];
    return themeNames.map((name, idx) => ({ id: idx + 1, name, description: null, icon_url: null }));
  }
}

/**
 * Get all available diets
 */
export async function getDiets(): Promise<Diet[]> {
  try {
    const response = await apiRequest<ApiWrapperResponse<Diet[]>>('/api/diets');
    return response.data;
  } catch {
    // Fallback: return common diets
    return [
      { id: 1, name: 'classique', description: null, icon_url: null },
      { id: 2, name: 'végétarien', description: null, icon_url: null },
      { id: 3, name: 'vegan', description: null, icon_url: null },
      { id: 4, name: 'sans-gluten', description: null, icon_url: null },
    ];
  }
}
