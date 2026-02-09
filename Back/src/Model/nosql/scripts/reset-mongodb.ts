/**
 * MongoDB Reset Script
 * ====================
 * Drops all collections and reinitializes.
 * ⚠️ DESTRUCTIVE - Use with caution!
 * Run via: npx tsx src/Model/nosql/scripts/reset-mongodb.ts
 */

import { IndexDescription, IndexSpecification } from 'mongodb';
import { MongoAnalytics, getDb } from '../client/mongo-analytics.client';
import { COLLECTIONS } from '../collections';
import { INDEX_DEFINITIONS } from '../collections/indexes';

async function main(): Promise<void> {
  console.log('[MongoDB Reset] ⚠️  Starting destructive reset...\n');

  try {
    const db = await MongoAnalytics.connect();

    // Drop all analytics collections
    console.log('[Drop] Dropping collections...');
    for (const name of Object.values(COLLECTIONS)) {
      await dropCollectionSafe(name);
    }

    // Recreate collections
    console.log('\n[Create] Creating collections...');
    for (const name of Object.values(COLLECTIONS)) {
      await db.createCollection(name);
      console.log(`  ✅ Created: ${name}`);
    }

    // Recreate indexes
    console.log('\n[Indexes] Creating indexes...');
    for (const def of INDEX_DEFINITIONS) {
      await createIndexes(def.collection, def.indexes);
    }

    // Verify
    console.log('\n[Verify] Checking setup...');
    const collections = await db.listCollections().toArray();
    console.log(`  ✅ ${collections.length} collections ready`);

    console.log('\n[MongoDB Reset] ✅ Reset complete!');
  } catch (error) {
    console.error('[MongoDB Reset] ❌ Failed:', error);
    process.exit(1);
  } finally {
    await MongoAnalytics.disconnect();
  }
}

async function dropCollectionSafe(name: string): Promise<void> {
  const db = await getDb();
  try {
    await db.collection(name).drop();
    console.log(`  🗑️  Dropped: ${name}`);
  } catch (error) {
    if ((error as Error).message.includes('ns not found')) {
      console.log(`  ⏭️  Not found: ${name}`);
    } else {
      throw error;
    }
  }
}

async function createIndexes(
  collectionName: string,
  indexes: IndexDescription[],
): Promise<void> {
  const db = await getDb();
  const collection = db.collection(collectionName);

  for (const index of indexes) {
    // Build options object only with defined values
    const options: { unique?: boolean; expireAfterSeconds?: number } = {};
    if (index.unique === true) options.unique = true;
    if (typeof index.expireAfterSeconds === 'number') {
      options.expireAfterSeconds = index.expireAfterSeconds;
    }

    const name = await collection.createIndex(
      index.key as IndexSpecification,
      options,
    );
    console.log(`  ✅ ${collectionName}: ${name}`);
  }
}

void main();
