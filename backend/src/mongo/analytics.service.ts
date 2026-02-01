import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection } from 'mongodb';
import {
  MenuAnalytics,
  UserActivityLog,
  OrderSnapshot,
  DashboardStats,
  AuditLog,
  SearchAnalytics,
  MONGO_COLLECTIONS,
} from './schemas';

@Injectable()
export class AnalyticsService implements OnModuleInit, OnModuleDestroy {
  private client!: MongoClient;
  private db!: Db;

  // Collections
  private menuAnalytics!: Collection<MenuAnalytics>;
  private userActivityLogs!: Collection<UserActivityLog>;
  private orderSnapshots!: Collection<OrderSnapshot>;
  private dashboardStats!: Collection<DashboardStats>;
  private auditLogs!: Collection<AuditLog>;
  private searchAnalytics!: Collection<SearchAnalytics>;

  async onModuleInit() {
    const uri = process.env.MONGODB_URI || 'mongodb://root:example@localhost:27017/vite_gourmand?authSource=admin';
    this.client = new MongoClient(uri);
    await this.client.connect();
    this.db = this.client.db('vite_gourmand');

    // Initialize collections
    this.menuAnalytics = this.db.collection(MONGO_COLLECTIONS.MENU_ANALYTICS);
    this.userActivityLogs = this.db.collection(MONGO_COLLECTIONS.USER_ACTIVITY);
    this.orderSnapshots = this.db.collection(MONGO_COLLECTIONS.ORDER_SNAPSHOTS);
    this.dashboardStats = this.db.collection(MONGO_COLLECTIONS.DASHBOARD_STATS);
    this.auditLogs = this.db.collection(MONGO_COLLECTIONS.AUDIT_LOGS);
    this.searchAnalytics = this.db.collection(MONGO_COLLECTIONS.SEARCH_ANALYTICS);

    console.log('✅ MongoDB Analytics Service connected');
  }

  async onModuleDestroy() {
    await this.client.close();
  }

  // ============================================
  // USER ACTIVITY TRACKING
  // ============================================

  async logActivity(activity: Omit<UserActivityLog, '_id' | 'timestamp'>): Promise<void> {
    await this.userActivityLogs.insertOne({
      ...activity,
      timestamp: new Date(),
    } as UserActivityLog);
  }

  async trackMenuView(userId: number, menuId: number, menuTitle: string, sessionId: string): Promise<void> {
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
    await this.orderSnapshots.insertOne({
      ...order,
      createdAt: new Date(),
    } as OrderSnapshot);
  }

  async getOrderHistory(userId: number, limit = 50): Promise<OrderSnapshot[]> {
    return this.orderSnapshots
      .find({ 'user.id': userId })
      .sort({ orderDate: -1 })
      .limit(limit)
      .toArray();
  }

  async getRecentOrders(limit = 100): Promise<OrderSnapshot[]> {
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
    const targetDate = date || this.getCurrentPeriod(type);
    return this.dashboardStats.findOne({ date: targetDate, type });
  }

  // ============================================
  // AUDIT LOGGING
  // ============================================

  async logAudit(audit: Omit<AuditLog, '_id' | 'timestamp'>): Promise<void> {
    await this.auditLogs.insertOne({
      ...audit,
      timestamp: new Date(),
    } as AuditLog);
  }

  async getAuditHistory(entityType: AuditLog['entityType'], entityId: number, limit = 50): Promise<AuditLog[]> {
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
