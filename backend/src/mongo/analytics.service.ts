import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { MongoClient, Db, Collection, ServerApiVersion } from 'mongodb';
import {
  MenuAnalytics,
  UserActivityLog,
  OrderSnapshot,
  DashboardStats,
  AuditLog,
  SearchAnalytics,
  MONGO_COLLECTIONS,
} from './schemas';

/**
 * Storage Management Configuration
 * - Atlas free tier has 512MB limit
 * - We set cleanup threshold at 85% to proactively manage space
 * - Data is prioritized by relevance (recent data > old data)
 */
interface StorageStats {
  totalSizeMB: number;
  usedPercentage: number;
  collections: Record<string, { count: number; sizeMB: number }>;
}

/**
 * Data Retention Policy (days)
 * Lower = less relevant, cleaned first
 */
const RETENTION_POLICY = {
  [MONGO_COLLECTIONS.USER_ACTIVITY]: 30,      // Activity logs: 30 days
  [MONGO_COLLECTIONS.SEARCH_ANALYTICS]: 30,   // Search analytics: 30 days  
  [MONGO_COLLECTIONS.AUDIT_LOGS]: 90,         // Audit logs: 90 days (compliance)
  [MONGO_COLLECTIONS.ORDER_SNAPSHOTS]: 180,   // Order history: 6 months
  [MONGO_COLLECTIONS.MENU_ANALYTICS]: 365,    // Menu analytics: 1 year
  [MONGO_COLLECTIONS.DASHBOARD_STATS]: 365,   // Dashboard stats: 1 year
} as const;

/**
 * Cleanup priority (lower = cleaned first when storage is critical)
 */
const CLEANUP_PRIORITY = [
  MONGO_COLLECTIONS.USER_ACTIVITY,      // Least critical - session data
  MONGO_COLLECTIONS.SEARCH_ANALYTICS,   // Search patterns - can be regenerated
  MONGO_COLLECTIONS.AUDIT_LOGS,         // Important but older ones less relevant
  MONGO_COLLECTIONS.ORDER_SNAPSHOTS,    // Historical orders
  MONGO_COLLECTIONS.MENU_ANALYTICS,     // Business insights - keep longer
  MONGO_COLLECTIONS.DASHBOARD_STATS,    // Pre-computed stats - most valuable
];

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AnalyticsService.name);
  private client!: MongoClient;
  private db!: Db;
  private isConnected = false;

  // Storage limits from environment
  private readonly maxStorageMB = parseInt(process.env.MONGODB_MAX_STORAGE_MB || '450', 10);
  private readonly cleanupThreshold = parseInt(process.env.MONGODB_CLEANUP_THRESHOLD_PERCENT || '85', 10);

  // Collections
  private menuAnalytics!: Collection<MenuAnalytics>;
  private userActivityLogs!: Collection<UserActivityLog>;
  private orderSnapshots!: Collection<OrderSnapshot>;
  private dashboardStats!: Collection<DashboardStats>;
  private auditLogs!: Collection<AuditLog>;
  private searchAnalytics!: Collection<SearchAnalytics>;

  /**
   * Check if MongoDB is available. Analytics features are optional.
   */
  isAvailable(): boolean {
    return this.isConnected;
  }

  async onModuleInit() {
    // Don't await - connect in background so the HTTP server starts immediately
    // MongoDB is optional; the app works without it
    this.connect().catch((err) => {
      this.logger.warn(`MongoDB background connect failed: ${err?.message || err}`);
    });
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/vite_gourmand?authSource=admin';
    const isAtlas = uri.includes('mongodb+srv') || uri.includes('mongodb.net');

    try {
      // Configure client for Atlas or local
      const clientOptions = isAtlas ? {
        serverApi: {
          version: ServerApiVersion.v1,
          strict: true,
          deprecationErrors: true,
        },
        maxPoolSize: 10,
        minPoolSize: 1,
        retryWrites: true,
        retryReads: true,
        tls: true,
        tlsAllowInvalidCertificates: false,
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        serverSelectionTimeoutMS: 10000,
      } : {};

      this.client = new MongoClient(uri, clientOptions);
      await this.client.connect();
      
      // Ping to confirm connection
      await this.client.db('admin').command({ ping: 1 });
      
      this.db = this.client.db('vite_gourmand');
      this.isConnected = true;

      // Initialize collections
      this.menuAnalytics = this.db.collection(MONGO_COLLECTIONS.MENU_ANALYTICS);
      this.userActivityLogs = this.db.collection(MONGO_COLLECTIONS.USER_ACTIVITY);
      this.orderSnapshots = this.db.collection(MONGO_COLLECTIONS.ORDER_SNAPSHOTS);
      this.dashboardStats = this.db.collection(MONGO_COLLECTIONS.DASHBOARD_STATS);
      this.auditLogs = this.db.collection(MONGO_COLLECTIONS.AUDIT_LOGS);
      this.searchAnalytics = this.db.collection(MONGO_COLLECTIONS.SEARCH_ANALYTICS);

      // Create TTL indexes for automatic cleanup
      await this.ensureIndexes();

      if (process.env.NODE_ENV !== 'test') {
        const connectionType = isAtlas ? 'MongoDB Atlas' : 'Local MongoDB';
        this.logger.log(`✅ ${connectionType} connected successfully`);
        
        // Check storage on startup
        await this.checkAndCleanupStorage();
      }
    } catch (error) {
      this.logger.warn('⚠️ MongoDB connection failed - analytics features disabled');
      this.logger.warn(`Reason: ${error instanceof Error ? error.message : String(error)}`);
      this.isConnected = false;
      // Don't throw - allow app to start without MongoDB
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.close();
      this.isConnected = false;
    }
  }

  // ============================================
  // STORAGE MANAGEMENT
  // ============================================

  /**
   * Ensure TTL indexes exist for automatic data expiration
   */
  private async ensureIndexes(): Promise<void> {
    try {
      // TTL index for user activity (30 days)
      await this.userActivityLogs.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: RETENTION_POLICY[MONGO_COLLECTIONS.USER_ACTIVITY] * 86400 }
      );

      // TTL index for search analytics (30 days)
      await this.searchAnalytics.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: RETENTION_POLICY[MONGO_COLLECTIONS.SEARCH_ANALYTICS] * 86400 }
      );

      // TTL index for audit logs (90 days)
      await this.auditLogs.createIndex(
        { timestamp: 1 },
        { expireAfterSeconds: RETENTION_POLICY[MONGO_COLLECTIONS.AUDIT_LOGS] * 86400 }
      );

      // Regular indexes for performance
      await this.menuAnalytics.createIndex({ menuId: 1, period: 1 }, { unique: true });
      await this.orderSnapshots.createIndex({ orderId: 1 }, { unique: true });
      await this.orderSnapshots.createIndex({ 'user.id': 1 });
      await this.dashboardStats.createIndex({ date: 1, type: 1 }, { unique: true });

      this.logger.log('✅ MongoDB indexes created/verified');
    } catch (error) {
      this.logger.warn('⚠️ Some indexes may already exist:', error);
    }
  }

  /**
   * Get current storage statistics
   */
  async getStorageStats(): Promise<StorageStats> {
    if (!this.isConnected) {
      return { totalSizeMB: 0, usedPercentage: 0, collections: {} };
    }
    const stats = await this.db.stats();
    const totalSizeMB = stats.dataSize / (1024 * 1024);
    const usedPercentage = (totalSizeMB / this.maxStorageMB) * 100;

    const collections: Record<string, { count: number; sizeMB: number }> = {};
    
    for (const collName of Object.values(MONGO_COLLECTIONS)) {
      try {
        const collStats = await this.db.command({ collStats: collName });
        collections[collName] = {
          count: collStats.count || 0,
          sizeMB: (collStats.size || 0) / (1024 * 1024),
        };
      } catch {
        collections[collName] = { count: 0, sizeMB: 0 };
      }
    }

    return { totalSizeMB, usedPercentage, collections };
  }

  /**
   * Check storage and cleanup if threshold exceeded
   */
  async checkAndCleanupStorage(): Promise<{ cleaned: boolean; deletedCount: number; freedMB: number }> {
    if (!this.isConnected) {
      return { cleaned: false, deletedCount: 0, freedMB: 0 };
    }
    const stats = await this.getStorageStats();
    
    this.logger.log(`📊 Storage: ${stats.totalSizeMB.toFixed(2)}MB / ${this.maxStorageMB}MB (${stats.usedPercentage.toFixed(1)}%)`);

    if (stats.usedPercentage < this.cleanupThreshold) {
      return { cleaned: false, deletedCount: 0, freedMB: 0 };
    }

    this.logger.warn(`⚠️ Storage threshold exceeded (${this.cleanupThreshold}%), starting cleanup...`);
    
    let totalDeleted = 0;
    const startSize = stats.totalSizeMB;

    // Clean collections in priority order until we're under 70%
    for (const collName of CLEANUP_PRIORITY) {
      const currentStats = await this.getStorageStats();
      if (currentStats.usedPercentage < 70) break;

      const deleted = await this.cleanupCollection(collName);
      totalDeleted += deleted;
      this.logger.log(`🗑️ Cleaned ${deleted} documents from ${collName}`);
    }

    const endStats = await this.getStorageStats();
    const freedMB = startSize - endStats.totalSizeMB;

    this.logger.log(`✅ Cleanup complete: ${totalDeleted} documents removed, ${freedMB.toFixed(2)}MB freed`);

    return { cleaned: true, deletedCount: totalDeleted, freedMB };
  }

  /**
   * Clean old data from a specific collection
   */
  private async cleanupCollection(collName: string): Promise<number> {
    const retentionDays = RETENTION_POLICY[collName as keyof typeof RETENTION_POLICY] || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const collection = this.db.collection(collName);
    
    // Different timestamp field names per collection
    const timestampField = collName === MONGO_COLLECTIONS.ORDER_SNAPSHOTS ? 'createdAt' : 'timestamp';
    
    const result = await collection.deleteMany({
      [timestampField]: { $lt: cutoffDate },
    });

    return result.deletedCount;
  }

  /**
   * Aggressive cleanup - reduce retention by half when critically low on space
   */
  async emergencyCleanup(): Promise<{ deletedCount: number; freedMB: number }> {
    if (!this.isConnected) {
      return { deletedCount: 0, freedMB: 0 };
    }
    this.logger.warn('🚨 Emergency cleanup initiated - halving retention periods');
    
    const startStats = await this.getStorageStats();
    let totalDeleted = 0;

    for (const collName of CLEANUP_PRIORITY) {
      const normalRetention = RETENTION_POLICY[collName as keyof typeof RETENTION_POLICY] || 30;
      const emergencyRetention = Math.max(7, Math.floor(normalRetention / 2)); // At least 7 days
      
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - emergencyRetention);

      const collection = this.db.collection(collName);
      const timestampField = collName === MONGO_COLLECTIONS.ORDER_SNAPSHOTS ? 'createdAt' : 'timestamp';
      
      const result = await collection.deleteMany({
        [timestampField]: { $lt: cutoffDate },
      });

      totalDeleted += result.deletedCount;
    }

    const endStats = await this.getStorageStats();
    const freedMB = startStats.totalSizeMB - endStats.totalSizeMB;

    return { deletedCount: totalDeleted, freedMB };
  }

  // ============================================
  // USER ACTIVITY TRACKING
  // ============================================

  async logActivity(activity: Omit<UserActivityLog, '_id' | 'timestamp'>): Promise<void> {
    if (!this.isConnected) return;
    await this.userActivityLogs.insertOne({
      ...activity,
      timestamp: new Date(),
    } as UserActivityLog);
  }

  async trackMenuView(userId: number, menuId: number, menuTitle: string, sessionId: string): Promise<void> {
    if (!this.isConnected) return;
    await this.logActivity({
      userId,
      sessionId,
      action: 'view_menu',
      targetType: 'menu',
      targetId: menuId,
      targetName: menuTitle,
    });

    // Also increment view count in menu analytics
    await this.incrementMenuViews(menuId, menuTitle);
  }

  async trackSearch(
    query: string,
    resultsCount: number,
    filters: UserActivityLog['filters'],
    userId?: number,
    sessionId?: string,
  ): Promise<void> {
    if (!this.isConnected) return;
    await this.searchAnalytics.insertOne({
      query,
      normalizedQuery: query.toLowerCase().trim(),
      resultsCount,
      clickedResults: [],
      filters: filters || {},
      userId,
      sessionId: sessionId || '',
      convertedToOrder: false,
      timestamp: new Date(),
    } as SearchAnalytics);
  }

  // ============================================
  // MENU ANALYTICS
  // ============================================

  async incrementMenuViews(menuId: number, menuTitle: string): Promise<void> {
    if (!this.isConnected) return;
    const period = this.getCurrentPeriod('daily');
    
    await this.menuAnalytics.updateOne(
      { menuId, period, periodType: 'daily' },
      {
        $inc: { viewCount: 1 },
        $set: { menuTitle, updatedAt: new Date() },
        $setOnInsert: {
          orderCount: 0,
          totalRevenue: 0,
          averageRating: 0,
          ratingCount: 0,
          ordersByDiet: {},
          ordersByTheme: {},
          peakHours: [],
          createdAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async recordMenuOrder(
    menuId: number,
    menuTitle: string,
    revenue: number,
    diet?: string,
    theme?: string,
  ): Promise<void> {
    if (!this.isConnected) return;
    const period = this.getCurrentPeriod('daily');
    const hour = new Date().getHours();

    const update: any = {
      $inc: { orderCount: 1, totalRevenue: revenue },
      $set: { menuTitle, updatedAt: new Date() },
      $push: { peakHours: hour },
      $setOnInsert: {
        viewCount: 0,
        averageRating: 0,
        ratingCount: 0,
        createdAt: new Date(),
      },
    };

    if (diet) {
      update.$inc[`ordersByDiet.${diet}`] = 1;
    }
    if (theme) {
      update.$inc[`ordersByTheme.${theme}`] = 1;
    }

    await this.menuAnalytics.updateOne(
      { menuId, period, periodType: 'daily' },
      update,
      { upsert: true },
    );
  }

  async getTopMenus(limit = 10, periodType: 'daily' | 'weekly' | 'monthly' = 'monthly'): Promise<MenuAnalytics[]> {
    if (!this.isConnected) return [];
    return this.menuAnalytics
      .find({ periodType })
      .sort({ orderCount: -1 })
      .limit(limit)
      .toArray();
  }

  // ============================================
  // ORDER SNAPSHOTS
  // ============================================

  async createOrderSnapshot(order: Omit<OrderSnapshot, '_id' | 'createdAt'>): Promise<void> {
    if (!this.isConnected) return;
    await this.orderSnapshots.insertOne({
      ...order,
      createdAt: new Date(),
    } as OrderSnapshot);
  }

  async getOrderHistory(userId: number, limit = 50): Promise<OrderSnapshot[]> {
    if (!this.isConnected) return [];
    return this.orderSnapshots
      .find({ 'user.id': userId })
      .sort({ orderDate: -1 })
      .limit(limit)
      .toArray();
  }

  async getRecentOrders(limit = 100): Promise<OrderSnapshot[]> {
    if (!this.isConnected) return [];
    return this.orderSnapshots
      .find({})
      .sort({ orderDate: -1 })
      .limit(limit)
      .toArray();
  }

  // ============================================
  // DASHBOARD STATISTICS
  // ============================================

  async updateDashboardStats(): Promise<void> {
    if (!this.isConnected) return;
    const today = this.getCurrentPeriod('daily');
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    // Aggregate from order snapshots
    const pipeline = [
      { $match: { orderDate: { $gte: startOfDay } } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          cancelledOrders: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          totalRevenue: { $sum: '$totalPrice' },
        },
      },
    ];

    const [result] = await this.orderSnapshots.aggregate(pipeline).toArray();

    await this.dashboardStats.updateOne(
      { date: today, type: 'daily' },
      {
        $set: {
          totalOrders: result?.totalOrders || 0,
          completedOrders: result?.completedOrders || 0,
          cancelledOrders: result?.cancelledOrders || 0,
          pendingOrders: result?.pendingOrders || 0,
          totalRevenue: result?.totalRevenue || 0,
          averageOrderValue: result?.totalOrders > 0 
            ? (result?.totalRevenue / result?.totalOrders) 
            : 0,
          computedAt: new Date(),
        },
      },
      { upsert: true },
    );
  }

  async getDashboardStats(date?: string, type: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<DashboardStats | null> {
    if (!this.isConnected) return null;
    const targetDate = date || this.getCurrentPeriod(type);
    return this.dashboardStats.findOne({ date: targetDate, type });
  }

  // ============================================
  // AUDIT LOGGING
  // ============================================

  async logAudit(audit: Omit<AuditLog, '_id' | 'timestamp'>): Promise<void> {
    if (!this.isConnected) return;
    await this.auditLogs.insertOne({
      ...audit,
      timestamp: new Date(),
    } as AuditLog);
  }

  async getAuditHistory(entityType: AuditLog['entityType'], entityId: number, limit = 50): Promise<AuditLog[]> {
    if (!this.isConnected) return [];
    return this.auditLogs
      .find({ entityType, entityId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();
  }

  // ============================================
  // SEARCH ANALYTICS
  // ============================================

  async getPopularSearches(limit = 20): Promise<Array<{ query: string; count: number }>> {
    if (!this.isConnected) return [];
    const pipeline = [
      {
        $group: {
          _id: '$normalizedQuery',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          query: '$_id',
          count: 1,
        },
      },
    ];

    return this.searchAnalytics.aggregate(pipeline).toArray() as Promise<Array<{ query: string; count: number }>>;
  }

  async getSearchConversionRate(): Promise<number> {
    if (!this.isConnected) return 0;
    const total = await this.searchAnalytics.countDocuments({});
    const converted = await this.searchAnalytics.countDocuments({ convertedToOrder: true });
    return total > 0 ? (converted / total) * 100 : 0;
  }

  // ============================================
  // HELPERS
  // ============================================

  private getCurrentPeriod(type: 'daily' | 'weekly' | 'monthly'): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    switch (type) {
      case 'daily':
        return `${year}-${month}-${day}`;
      case 'weekly':
        const week = this.getWeekNumber(now);
        return `${year}-W${String(week).padStart(2, '0')}`;
      case 'monthly':
        return `${year}-${month}`;
    }
  }

  private getWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }
}
