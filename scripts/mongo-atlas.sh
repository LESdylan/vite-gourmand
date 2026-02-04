#!/bin/bash

# ============================================
# MONGODB ATLAS MANAGEMENT SCRIPT
# ============================================
# This script manages MongoDB Atlas connection, storage, and cleanup
# Run with: ./scripts/mongo-atlas.sh [command]
# Or via Makefile: make mongo-atlas-[command]
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_PATH="./backend"

# Load environment
if [ -f "$BACKEND_PATH/.env" ]; then
    export $(grep -v '^#' "$BACKEND_PATH/.env" | xargs)
fi

print_header() {
    echo -e "\n${BLUE}============================================${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}============================================${NC}\n"
}

print_ok() { echo -e "${GREEN}✅ $1${NC}"; }
print_warn() { echo -e "${YELLOW}⚠️  $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }

# Test MongoDB Atlas connection
test_connection() {
    print_header "TESTING MONGODB ATLAS CONNECTION"
    
    cd "$BACKEND_PATH"
    
    npx tsx -e "
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
if (!uri) {
    console.error('❌ MONGODB_URI not set');
    process.exit(1);
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        await client.connect();
        await client.db('admin').command({ ping: 1 });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        
        const db = client.db('vite_gourmand');
        const collections = await db.listCollections().toArray();
        console.log('📂 Collections:', collections.map(c => c.name).join(', ') || 'none');
        
        const stats = await db.stats();
        const sizeMB = (stats.dataSize / (1024 * 1024)).toFixed(2);
        console.log('💾 Database size:', sizeMB, 'MB');
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    } finally {
        await client.close();
    }
}

run();
"
    
    cd - > /dev/null
}

# Get storage statistics
storage_stats() {
    print_header "MONGODB ATLAS STORAGE STATISTICS"
    
    cd "$BACKEND_PATH"
    
    npx tsx -e "
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const maxStorageMB = parseInt(process.env.MONGODB_MAX_STORAGE_MB || '450', 10);

const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function run() {
    try {
        await client.connect();
        const db = client.db('vite_gourmand');
        
        const stats = await db.stats();
        const totalSizeMB = stats.dataSize / (1024 * 1024);
        const usedPercent = (totalSizeMB / maxStorageMB * 100).toFixed(1);
        
        console.log('📊 STORAGE OVERVIEW');
        console.log('==================');
        console.log('Total Size:', totalSizeMB.toFixed(2), 'MB /', maxStorageMB, 'MB');
        console.log('Used:', usedPercent + '%');
        console.log('');
        
        const collections = [
            'menu_analytics', 'user_activity_logs', 'order_snapshots',
            'dashboard_stats', 'audit_logs', 'search_analytics'
        ];
        
        console.log('📂 COLLECTION BREAKDOWN');
        console.log('=======================');
        
        for (const collName of collections) {
            try {
                const collStats = await db.command({ collStats: collName });
                const sizeMB = (collStats.size / (1024 * 1024)).toFixed(3);
                const count = collStats.count;
                console.log(collName.padEnd(25), count.toString().padStart(6), 'docs |', sizeMB.padStart(8), 'MB');
            } catch {
                console.log(collName.padEnd(25), '     0 docs |    0.000 MB');
            }
        }
        
        if (parseFloat(usedPercent) > 85) {
            console.log('');
            console.log('⚠️  WARNING: Storage usage above 85%! Consider running cleanup.');
        }
    } finally {
        await client.close();
    }
}

run();
"
    
    cd - > /dev/null
}

# Run cleanup
run_cleanup() {
    print_header "RUNNING STORAGE CLEANUP"
    
    cd "$BACKEND_PATH"
    
    npx tsx -e "
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const RETENTION_DAYS = {
    'user_activity_logs': 30,
    'search_analytics': 30,
    'audit_logs': 90,
    'order_snapshots': 180,
    'menu_analytics': 365,
    'dashboard_stats': 365,
};

const CLEANUP_PRIORITY = [
    'user_activity_logs',
    'search_analytics', 
    'audit_logs',
    'order_snapshots',
    'menu_analytics',
    'dashboard_stats',
];

async function run() {
    try {
        await client.connect();
        const db = client.db('vite_gourmand');
        
        const beforeStats = await db.stats();
        const beforeSizeMB = beforeStats.dataSize / (1024 * 1024);
        
        console.log('🧹 Starting cleanup...');
        console.log('Before:', beforeSizeMB.toFixed(2), 'MB');
        console.log('');
        
        let totalDeleted = 0;
        
        for (const collName of CLEANUP_PRIORITY) {
            const retentionDays = RETENTION_DAYS[collName] || 30;
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - retentionDays);
            
            const timestampField = collName === 'order_snapshots' ? 'createdAt' : 'timestamp';
            
            try {
                const collection = db.collection(collName);
                const result = await collection.deleteMany({
                    [timestampField]: { \$lt: cutoff }
                });
                
                if (result.deletedCount > 0) {
                    console.log('🗑️ ', collName + ':', result.deletedCount, 'documents deleted (>' + retentionDays + ' days old)');
                    totalDeleted += result.deletedCount;
                }
            } catch (error) {
                console.log('⚠️ ', collName + ': skipped (collection may not exist)');
            }
        }
        
        const afterStats = await db.stats();
        const afterSizeMB = afterStats.dataSize / (1024 * 1024);
        const freedMB = beforeSizeMB - afterSizeMB;
        
        console.log('');
        console.log('✅ Cleanup complete!');
        console.log('Documents deleted:', totalDeleted);
        console.log('Space freed:', freedMB.toFixed(2), 'MB');
        console.log('After:', afterSizeMB.toFixed(2), 'MB');
    } finally {
        await client.close();
    }
}

run();
"
    
    cd - > /dev/null
}

# Emergency cleanup (aggressive)
emergency_cleanup() {
    print_header "EMERGENCY CLEANUP (AGGRESSIVE)"
    print_warn "This will halve retention periods to free maximum space!"
    
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Cancelled."
        exit 0
    fi
    
    cd "$BACKEND_PATH"
    
    npx tsx -e "
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const EMERGENCY_RETENTION_DAYS = {
    'user_activity_logs': 7,
    'search_analytics': 7,
    'audit_logs': 30,
    'order_snapshots': 60,
    'menu_analytics': 90,
    'dashboard_stats': 90,
};

async function run() {
    try {
        await client.connect();
        const db = client.db('vite_gourmand');
        
        const beforeStats = await db.stats();
        console.log('🚨 Emergency cleanup starting...');
        console.log('Before:', (beforeStats.dataSize / (1024 * 1024)).toFixed(2), 'MB');
        
        let totalDeleted = 0;
        
        for (const [collName, days] of Object.entries(EMERGENCY_RETENTION_DAYS)) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            
            const timestampField = collName === 'order_snapshots' ? 'createdAt' : 'timestamp';
            
            try {
                const result = await db.collection(collName).deleteMany({
                    [timestampField]: { \$lt: cutoff }
                });
                console.log('🗑️ ', collName + ':', result.deletedCount, 'deleted (>' + days + ' days)');
                totalDeleted += result.deletedCount;
            } catch {}
        }
        
        const afterStats = await db.stats();
        console.log('');
        console.log('✅ Emergency cleanup complete!');
        console.log('Total deleted:', totalDeleted);
        console.log('After:', (afterStats.dataSize / (1024 * 1024)).toFixed(2), 'MB');
    } finally {
        await client.close();
    }
}

run();
"
    
    cd - > /dev/null
}

# Initialize collections with indexes
init_collections() {
    print_header "INITIALIZING MONGODB COLLECTIONS"
    
    cd "$BACKEND_PATH"
    
    npx tsx -e "
const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

const COLLECTIONS = [
    'menu_analytics',
    'user_activity_logs', 
    'order_snapshots',
    'dashboard_stats',
    'audit_logs',
    'search_analytics'
];

async function run() {
    try {
        await client.connect();
        const db = client.db('vite_gourmand');
        
        console.log('📂 Creating collections...');
        
        for (const collName of COLLECTIONS) {
            try {
                await db.createCollection(collName);
                console.log('✅', collName);
            } catch (e) {
                if (e.code === 48) {
                    console.log('ℹ️ ', collName, '(already exists)');
                } else {
                    throw e;
                }
            }
        }
        
        console.log('');
        console.log('📑 Creating indexes...');
        
        // TTL indexes for automatic cleanup
        await db.collection('user_activity_logs').createIndex(
            { timestamp: 1 }, 
            { expireAfterSeconds: 30 * 86400, background: true }
        );
        await db.collection('search_analytics').createIndex(
            { timestamp: 1 },
            { expireAfterSeconds: 30 * 86400, background: true }
        );
        await db.collection('audit_logs').createIndex(
            { timestamp: 1 },
            { expireAfterSeconds: 90 * 86400, background: true }
        );
        
        // Performance indexes
        await db.collection('menu_analytics').createIndex({ menuId: 1, period: 1 }, { unique: true });
        await db.collection('order_snapshots').createIndex({ orderId: 1 }, { unique: true });
        await db.collection('order_snapshots').createIndex({ 'user.id': 1 });
        await db.collection('dashboard_stats').createIndex({ date: 1, type: 1 }, { unique: true });
        
        console.log('✅ All indexes created');
        console.log('');
        console.log('🎉 MongoDB Atlas initialized successfully!');
    } finally {
        await client.close();
    }
}

run();
"
    
    cd - > /dev/null
}

# Show help
show_help() {
    echo "MongoDB Atlas Management Script"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  test          Test MongoDB Atlas connection"
    echo "  stats         Show storage statistics"
    echo "  cleanup       Run normal cleanup (respects retention policy)"
    echo "  emergency     Run emergency cleanup (halves retention periods)"
    echo "  init          Initialize collections and indexes"
    echo "  help          Show this help message"
    echo ""
    echo "Environment variables:"
    echo "  MONGODB_URI                    - Atlas connection string"
    echo "  MONGODB_MAX_STORAGE_MB         - Max storage limit (default: 450)"
    echo "  MONGODB_CLEANUP_THRESHOLD_PERCENT - Cleanup trigger (default: 85)"
}

# Main
case "${1:-help}" in
    test)
        test_connection
        ;;
    stats)
        storage_stats
        ;;
    cleanup)
        run_cleanup
        ;;
    emergency)
        emergency_cleanup
        ;;
    init)
        init_collections
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac
