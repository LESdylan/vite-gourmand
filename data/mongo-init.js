// MongoDB Initialization Script
// This script runs when the MongoDB container starts for the first time
// It creates collections, indexes, and initial data

// Switch to the application database
db = db.getSiblingDB('vite_gourmand');

print('🚀 Initializing MongoDB for Vite Gourmand Analytics...');

// ============================================
// CREATE COLLECTIONS WITH SCHEMA VALIDATION
// ============================================

// Menu Analytics Collection
db.createCollection('menu_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['menuId', 'period', 'periodType'],
      properties: {
        menuId: { bsonType: 'int', description: 'PostgreSQL Menu ID' },
        menuTitle: { bsonType: 'string' },
        period: { bsonType: 'string' },
        periodType: { enum: ['daily', 'weekly', 'monthly'] },
        viewCount: { bsonType: 'int', minimum: 0 },
        orderCount: { bsonType: 'int', minimum: 0 },
        totalRevenue: { bsonType: 'double', minimum: 0 },
        averageRating: { bsonType: 'double', minimum: 0, maximum: 5 },
      }
    }
  }
});
print('✅ Created menu_analytics collection');

// User Activity Logs Collection
db.createCollection('user_activity_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['action', 'timestamp'],
      properties: {
        userId: { bsonType: 'int' },
        sessionId: { bsonType: 'string' },
        action: { 
          enum: ['view_menu', 'add_to_cart', 'remove_from_cart', 'place_order', 
                 'search', 'filter', 'view_dish', 'login', 'logout'] 
        },
        targetType: { enum: ['menu', 'dish', 'order', 'category'] },
        targetId: { bsonType: 'int' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});
print('✅ Created user_activity_logs collection');

// Order Snapshots Collection
db.createCollection('order_snapshots', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['orderId', 'orderNumber', 'orderDate'],
      properties: {
        orderId: { bsonType: 'int', description: 'PostgreSQL Order ID' },
        orderNumber: { bsonType: 'string' },
        orderDate: { bsonType: 'date' },
        totalPrice: { bsonType: 'double', minimum: 0 },
        status: { bsonType: 'string' }
      }
    }
  }
});
print('✅ Created order_snapshots collection');

// Dashboard Statistics Collection
db.createCollection('dashboard_stats', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['date', 'type'],
      properties: {
        date: { bsonType: 'string' },
        type: { enum: ['daily', 'weekly', 'monthly'] },
        totalOrders: { bsonType: 'int', minimum: 0 },
        totalRevenue: { bsonType: 'double', minimum: 0 }
      }
    }
  }
});
print('✅ Created dashboard_stats collection');

// Audit Logs Collection
db.createCollection('audit_logs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['action', 'entityType', 'timestamp'],
      properties: {
        action: { enum: ['create', 'update', 'delete', 'login', 'logout', 'permission_change'] },
        entityType: { enum: ['user', 'order', 'menu', 'dish', 'role', 'publish'] },
        entityId: { bsonType: 'int' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});
print('✅ Created audit_logs collection');

// Search Analytics Collection
db.createCollection('search_analytics', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['query', 'timestamp'],
      properties: {
        query: { bsonType: 'string' },
        normalizedQuery: { bsonType: 'string' },
        resultsCount: { bsonType: 'int', minimum: 0 },
        convertedToOrder: { bsonType: 'bool' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});
print('✅ Created search_analytics collection');

// ============================================
// CREATE INDEXES
// ============================================

print('📊 Creating indexes...');

// Menu Analytics indexes
db.menu_analytics.createIndex({ menuId: 1, period: 1 }, { unique: true });
db.menu_analytics.createIndex({ periodType: 1, period: -1 });
print('  ✅ menu_analytics indexes');

// User Activity indexes (with TTL for auto-cleanup after 90 days)
db.user_activity_logs.createIndex({ userId: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ sessionId: 1 });
db.user_activity_logs.createIndex({ action: 1, timestamp: -1 });
db.user_activity_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 7776000 }); // 90 days
print('  ✅ user_activity_logs indexes (with 90-day TTL)');

// Order Snapshots indexes
db.order_snapshots.createIndex({ orderId: 1 }, { unique: true });
db.order_snapshots.createIndex({ 'user.id': 1 });
db.order_snapshots.createIndex({ orderDate: -1 });
db.order_snapshots.createIndex({ status: 1 });
print('  ✅ order_snapshots indexes');

// Dashboard Stats indexes
db.dashboard_stats.createIndex({ date: 1, type: 1 }, { unique: true });
print('  ✅ dashboard_stats indexes');

// Audit Logs indexes (with TTL for auto-cleanup after 1 year)
db.audit_logs.createIndex({ entityType: 1, entityId: 1 });
db.audit_logs.createIndex({ userId: 1, timestamp: -1 });
db.audit_logs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 31536000 }); // 1 year
print('  ✅ audit_logs indexes (with 1-year TTL)');

// Search Analytics indexes
db.search_analytics.createIndex({ normalizedQuery: 1 });
db.search_analytics.createIndex({ timestamp: -1 });
db.search_analytics.createIndex({ convertedToOrder: 1 });
print('  ✅ search_analytics indexes');

// ============================================
// INSERT SAMPLE DATA (for development)
// ============================================

print('📝 Inserting sample analytics data...');

// Sample dashboard stats (minimal required fields)
db.dashboard_stats.insertOne({
  date: new Date().toISOString().split('T')[0],
  type: 'daily',
  totalOrders: NumberInt(0),
  completedOrders: NumberInt(0),
  cancelledOrders: NumberInt(0),
  pendingOrders: NumberInt(0),
  totalRevenue: 0.0,
  averageOrderValue: 0.0,
  newUsers: NumberInt(0),
  activeUsers: NumberInt(0),
  returningUsers: NumberInt(0),
  topMenus: [],
  topDishes: [],
  dietDistribution: {},
  themeDistribution: {},
  ordersByHour: {},
  ordersByDayOfWeek: {},
  computedAt: new Date()
});
print('  ✅ Initial dashboard stats');

print('');
print('🎉 MongoDB initialization complete!');
print('');
print('Collections created:');
print('  - menu_analytics      (menu performance tracking)');
print('  - user_activity_logs  (user behavior, 90-day retention)');
print('  - order_snapshots     (denormalized orders for fast queries)');
print('  - dashboard_stats     (pre-computed admin dashboard data)');
print('  - audit_logs          (change tracking, 1-year retention)');
print('  - search_analytics    (search patterns for recommendations)');
print('');
