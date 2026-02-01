/**
 * MongoDB Schemas for Analytics and Statistics
 * 
 * These collections complement the PostgreSQL relational data
 * by storing analytics, logs, and denormalized data for fast reads.
 */

// ============================================
// ANALYTICS COLLECTIONS
// ============================================

/**
 * Menu Analytics - Track menu popularity and performance
 */
export interface MenuAnalytics {
  _id?: string;
  menuId: number;              // FK to PostgreSQL Menu.id
  menuTitle: string;           // Denormalized for fast queries
  period: string;              // "2026-02", "2026-W05", "2026-02-01"
  periodType: 'daily' | 'weekly' | 'monthly';
  
  // Metrics
  viewCount: number;
  orderCount: number;
  totalRevenue: number;
  averageRating: number;
  ratingCount: number;
  
  // Breakdown
  ordersByDiet: Record<string, number>;    // { "vegetarian": 15, "vegan": 8 }
  ordersByTheme: Record<string, number>;   // { "italian": 20, "french": 12 }
  peakHours: number[];                     // [12, 13, 19, 20] (most orders)
  
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Activity Log - Track user behavior for recommendations
 */
export interface UserActivityLog {
  _id?: string;
  userId: number;              // FK to PostgreSQL User.id
  sessionId: string;
  
  action: 'view_menu' | 'add_to_cart' | 'remove_from_cart' | 'place_order' | 
          'search' | 'filter' | 'view_dish' | 'login' | 'logout';
  
  // Context
  targetType?: 'menu' | 'dish' | 'order' | 'category';
  targetId?: number;
  targetName?: string;         // Denormalized
  
  // Search/Filter specific
  searchQuery?: string;
  filters?: {
    diet?: string;
    theme?: string;
    priceRange?: [number, number];
    allergenFree?: string[];
  };
  
  // Metadata
  ipAddress?: string;
  userAgent?: string;
  referrer?: string;
  
  timestamp: Date;
}

/**
 * Order Snapshot - Denormalized order for fast analytics queries
 */
export interface OrderSnapshot {
  _id?: string;
  orderId: number;             // FK to PostgreSQL Order.id
  orderNumber: string;
  
  // User info (denormalized)
  user: {
    id: number;
    email: string;
    firstName: string;
    city: string;
    country: string;
  };
  
  // Order details
  orderDate: Date;
  prestationDate: Date;
  deliveryHour: string;
  personNumber: number;
  status: string;
  
  // Pricing
  menuPrice: number;
  deliveryPrice: number;
  totalPrice: number;
  
  // Menus included (denormalized)
  menus: Array<{
    id: number;
    title: string;
    pricePerPerson: number;
    diet?: string;
    theme?: string;
    dishes: Array<{
      id: number;
      title: string;
      allergens: string[];
    }>;
  }>;
  
  // Flags
  materialLending: boolean;
  getBackMaterial: boolean;
  
  // Analytics tags
  tags: string[];              // ["weekend", "large_party", "vegetarian"]
  
  createdAt: Date;
}

/**
 * Dashboard Statistics - Pre-computed stats for admin dashboard
 */
export interface DashboardStats {
  _id?: string;
  date: string;                // "2026-02-01"
  type: 'daily' | 'weekly' | 'monthly';
  
  // Order stats
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  
  // Revenue
  totalRevenue: number;
  averageOrderValue: number;
  
  // Users
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  
  // Popular items
  topMenus: Array<{ id: number; title: string; count: number }>;
  topDishes: Array<{ id: number; title: string; count: number }>;
  
  // Diet preferences
  dietDistribution: Record<string, number>;
  themeDistribution: Record<string, number>;
  
  // Time patterns
  ordersByHour: Record<string, number>;    // { "12": 15, "13": 20 }
  ordersByDayOfWeek: Record<string, number>; // { "monday": 50 }
  
  computedAt: Date;
}

/**
 * Audit Log - Track all changes to critical data
 */
export interface AuditLog {
  _id?: string;
  
  // Who
  userId?: number;
  userEmail?: string;
  userRole?: string;
  
  // What
  action: 'create' | 'update' | 'delete' | 'login' | 'logout' | 'permission_change';
  entityType: 'user' | 'order' | 'menu' | 'dish' | 'role' | 'publish';
  entityId: number;
  
  // Changes
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changedFields?: string[];
  
  // Context
  ipAddress?: string;
  userAgent?: string;
  
  timestamp: Date;
}

/**
 * Search Analytics - Track search patterns
 */
export interface SearchAnalytics {
  _id?: string;
  query: string;
  normalizedQuery: string;     // lowercase, trimmed
  
  resultsCount: number;
  clickedResults: number[];    // IDs of clicked items
  
  filters: {
    diet?: string;
    theme?: string;
    priceRange?: [number, number];
    allergenFree?: string[];
  };
  
  userId?: number;
  sessionId: string;
  convertedToOrder: boolean;
  
  timestamp: Date;
}

// ============================================
// COLLECTION NAMES
// ============================================

export const MONGO_COLLECTIONS = {
  MENU_ANALYTICS: 'menu_analytics',
  USER_ACTIVITY: 'user_activity_logs',
  ORDER_SNAPSHOTS: 'order_snapshots',
  DASHBOARD_STATS: 'dashboard_stats',
  AUDIT_LOGS: 'audit_logs',
  SEARCH_ANALYTICS: 'search_analytics',
} as const;

// ============================================
// INDEXES (for mongo-init.js)
// ============================================

export const MONGO_INDEXES = {
  menu_analytics: [
    { key: { menuId: 1, period: 1 }, unique: true },
    { key: { periodType: 1, period: -1 } },
  ],
  user_activity_logs: [
    { key: { userId: 1, timestamp: -1 } },
    { key: { sessionId: 1 } },
    { key: { action: 1, timestamp: -1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 7776000 }, // TTL: 90 days
  ],
  order_snapshots: [
    { key: { orderId: 1 }, unique: true },
    { key: { 'user.id': 1 } },
    { key: { orderDate: -1 } },
    { key: { status: 1 } },
  ],
  dashboard_stats: [
    { key: { date: 1, type: 1 }, unique: true },
  ],
  audit_logs: [
    { key: { entityType: 1, entityId: 1 } },
    { key: { userId: 1, timestamp: -1 } },
    { key: { timestamp: 1 }, expireAfterSeconds: 31536000 }, // TTL: 1 year
  ],
  search_analytics: [
    { key: { normalizedQuery: 1 } },
    { key: { timestamp: -1 } },
    { key: { convertedToOrder: 1 } },
  ],
};
