/**
 * MongoDB Analytics Types
 * =======================
 * Shared types for all MongoDB analytics collections.
 */

import { ObjectId } from 'mongodb';

// Base document with common fields
export interface BaseDocument {
  _id?: ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Menu Analytics
export interface MenuAnalytics extends BaseDocument {
  menuId: string;
  menuTitle: string;
  period: string; // "2026-02-01"
  periodType: 'daily' | 'weekly' | 'monthly';
  viewCount: number;
  orderCount: number;
  totalRevenue: number;
  averageRating: number;
  ratingCount: number;
  ordersByDiet: Record<string, number>;
  ordersByTheme: Record<string, number>;
  peakHours: number[];
}

// Revenue by Menu
export interface RevenueByMenu extends BaseDocument {
  menuId: string;
  menuTitle: string;
  period: string;
  periodType: 'daily' | 'weekly' | 'monthly';
  orderCount: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalPersons: number;
  deliveryRevenue: number;
  discountTotal: number;
}

// Dashboard Stats
export interface DashboardStats extends BaseDocument {
  date: string;
  type: 'daily' | 'weekly' | 'monthly';
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  newUsers: number;
  activeUsers: number;
  returningUsers: number;
  topMenus: Array<{ id: string; title: string; count: number }>;
  dietDistribution: Record<string, number>;
  ordersByHour: Record<string, number>;
  ordersByDayOfWeek: Record<string, number>;
  computedAt: Date;
}

// Search Analytics
export interface SearchAnalytics extends BaseDocument {
  query: string;
  normalizedQuery: string;
  resultsCount: number;
  clickedResults: string[];
  filters: {
    diet?: string;
    theme?: string;
    priceRange?: { min: number; max: number };
  };
  userId?: string;
  sessionId: string;
  convertedToOrder: boolean;
  timestamp: Date;
}

// User Activity Log
export interface UserActivityLog extends BaseDocument {
  userId: string;
  sessionId: string;
  action: 'view_menu' | 'place_order' | 'search' | 'login' | 'logout';
  targetType: 'menu' | 'dish' | 'order' | 'category' | 'page';
  targetId?: string;
  targetName?: string;
  searchContext?: { query: string; filters: Record<string, unknown> };
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Audit Log
export interface AuditLog extends BaseDocument {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  action: 'create' | 'update' | 'delete' | 'login' | 'logout';
  entityType: string;
  entityId?: string;
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

// Order Snapshot (denormalized)
export interface OrderSnapshot extends BaseDocument {
  orderId: string;
  orderNumber: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    city?: string;
  };
  orderDate: Date;
  deliveryDate: Date;
  deliveryHour: string;
  personNumber: number;
  status: string;
  menuPrice: number;
  deliveryPrice: number;
  discountAmount: number;
  totalPrice: number;
  menus: Array<{
    id: string;
    title: string;
    price: number;
    diet?: string;
    dishes?: string[];
  }>;
  materialLending: boolean;
  tags: string[];
}

// Storage info for cleanup
export interface StorageInfo {
  totalSizeMB: number;
  maxStorageMB: number;
  usedPercent: number;
  collections: CollectionStats[];
}

export interface CollectionStats {
  name: string;
  count: number;
  sizeMB: number;
  avgDocSizeKB: number;
}
