/**
 * Test Data Seed Script
 * ======================
 * 
 * Generates comprehensive test data for all order statuses and edge cases.
 * This seed is designed to test the complete order lifecycle.
 * 
 * Run with: npx tsx prisma/seed-test-data.ts
 * Or via: npm run seed:test
 */

import { PrismaClient } from '../src/generated/prisma/client';
import * as bcrypt from 'bcrypt';

// @ts-expect-error - Prisma 7 type signature
const prisma: PrismaClient = new PrismaClient({});
const SALT_ROUNDS = 10;

// Order statuses for testing
const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'ready',
  'delivering',
  'delivered',
  'completed',
  'cancelled',
] as const;

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

async function main() {
  console.log('🧪 Starting TEST DATA seed...\n');

  // ============================================
  // 1. Create Test Users (one per role)
  // ============================================
  console.log('👤 Creating test users...');
  
  const password = await hashPassword('Test123!');

  // Ensure roles exist
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, libelle: 'admin' },
  });

  const managerRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: { id: 2, libelle: 'manager' },
  });

  const clientRole = await prisma.role.upsert({
    where: { id: 3 },
    update: {},
    create: { id: 3, libelle: 'client' },
  });

  // Create test users
  const testAdmin = await prisma.user.upsert({
    where: { email: 'test.admin@test.com' },
    update: {},
    create: {
      email: 'test.admin@test.com',
      password,
      first_name: 'Test Admin',
      telephone_number: '+33600000001',
      city: 'Paris',
      country: 'France',
      postal_address: '1 Test Street',
      roleId: adminRole.id,
    },
  });

  const testManager = await prisma.user.upsert({
    where: { email: 'test.manager@test.com' },
    update: {},
    create: {
      email: 'test.manager@test.com',
      password,
      first_name: 'Test Manager',
      telephone_number: '+33600000002',
      city: 'Lyon',
      country: 'France',
      postal_address: '2 Test Avenue',
      roleId: managerRole.id,
    },
  });

  const testClient = await prisma.user.upsert({
    where: { email: 'test.client@test.com' },
    update: {},
    create: {
      email: 'test.client@test.com',
      password,
      first_name: 'Test Client',
      telephone_number: '+33600000003',
      city: 'Marseille',
      country: 'France',
      postal_address: '3 Test Boulevard',
      roleId: clientRole.id,
    },
  });

  console.log(`   ✅ Created 3 test users`);

  // ============================================
  // 2. Create Test Menus
  // ============================================
  console.log('📋 Creating test menus...');

  const testMenus = await Promise.all([
    prisma.menu.upsert({
      where: { id: 1000 },
      update: {},
      create: {
        id: 1000,
        title: 'Test Menu - Small Event',
        person_min: 10,
        price_per_person: 35.0,
        description: 'Test menu for small events',
        remaining_qty: 50,
      },
    }),
    prisma.menu.upsert({
      where: { id: 1001 },
      update: {},
      create: {
        id: 1001,
        title: 'Test Menu - Large Event',
        person_min: 50,
        price_per_person: 65.0,
        description: 'Test menu for large events',
        remaining_qty: 20,
      },
    }),
    prisma.menu.upsert({
      where: { id: 1002 },
      update: {},
      create: {
        id: 1002,
        title: 'Test Menu - Premium',
        person_min: 10,
        price_per_person: 120.0,
        description: 'Premium test menu',
        remaining_qty: 10,
      },
    }),
  ]);

  console.log(`   ✅ Created ${testMenus.length} test menus`);

  // ============================================
  // 3. Create Orders in ALL Statuses
  // ============================================
  console.log('📦 Creating orders in all statuses...');

  // Delete existing test orders
  await prisma.order.deleteMany({
    where: { order_number: { startsWith: 'TEST-' } },
  });

  const baseDate = new Date();
  const testOrders = [];

  for (let i = 0; i < ORDER_STATUSES.length; i++) {
    const status = ORDER_STATUSES[i];
    const orderDate = new Date(baseDate);
    orderDate.setDate(orderDate.getDate() - (ORDER_STATUSES.length - i));

    const prestationDate = new Date(orderDate);
    prestationDate.setDate(prestationDate.getDate() + 7);

    const order = await prisma.order.create({
      data: {
        order_number: `TEST-${status.toUpperCase()}-001`,
        order_date: orderDate,
        prestation_date: prestationDate,
        delivery_hour: '18:00',
        menu_price: 350 + (i * 100),
        person_number: 10 + (i * 5),
        delivery_price: 50,
        status,
        material_lending: i % 2 === 0,
        get_back_material: i % 3 === 0,
        userId: testClient.id,
        menus: { connect: [{ id: testMenus[i % testMenus.length].id }] },
      },
    });
    testOrders.push(order);
  }

  console.log(`   ✅ Created ${testOrders.length} orders (one per status)`);

  // ============================================
  // 4. Create Additional Test Scenarios
  // ============================================
  console.log('🎯 Creating edge case scenarios...');

  // Order with multiple menus
  const multiMenuOrder = await prisma.order.create({
    data: {
      order_number: 'TEST-MULTI-MENU-001',
      order_date: new Date(),
      prestation_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      delivery_hour: '19:00',
      menu_price: 1500,
      person_number: 30,
      delivery_price: 75,
      status: 'pending',
      material_lending: true,
      get_back_material: true,
      userId: testClient.id,
      menus: { connect: testMenus.map(m => ({ id: m.id })) },
    },
  });

  // Large order (stress test)
  const largeOrder = await prisma.order.create({
    data: {
      order_number: 'TEST-LARGE-001',
      order_date: new Date(),
      prestation_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      delivery_hour: '12:00',
      menu_price: 6500,
      person_number: 100,
      delivery_price: 0, // Free delivery for large orders
      status: 'confirmed',
      material_lending: true,
      get_back_material: true,
      userId: testClient.id,
    },
  });

  // Minimum order
  const minOrder = await prisma.order.create({
    data: {
      order_number: 'TEST-MIN-001',
      order_date: new Date(),
      prestation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      delivery_hour: '18:00',
      menu_price: 350,
      person_number: 10,
      delivery_price: 30,
      status: 'pending',
      material_lending: false,
      get_back_material: false,
      userId: testClient.id,
      menus: { connect: [{ id: testMenus[0].id }] },
    },
  });

  console.log('   ✅ Created edge case orders');

  // ============================================
  // 5. Create Test Reviews
  // ============================================
  console.log('⭐ Creating test reviews...');

  await prisma.publish.deleteMany({
    where: { description: { startsWith: 'TEST-REVIEW' } },
  });

  const reviewStatuses = ['pending', 'approved', 'rejected'];
  const testReviews = [];

  for (let i = 0; i < reviewStatuses.length; i++) {
    const review = await prisma.publish.create({
      data: {
        note: String(3 + (i % 3)),
        description: `TEST-REVIEW: Status ${reviewStatuses[i]} - Sample review text`,
        status: reviewStatuses[i],
        userId: testClient.id,
      },
    });
    testReviews.push(review);
  }

  console.log(`   ✅ Created ${testReviews.length} test reviews`);

  // ============================================
  // Summary
  // ============================================
  console.log('\n========================================');
  console.log('✅ TEST DATA SEED COMPLETED!');
  console.log('========================================');
  console.log('Users: 3 (admin, manager, client)');
  console.log('Menus: 3');
  console.log(`Orders: ${testOrders.length + 3} (all statuses + edge cases)`);
  console.log(`Reviews: ${testReviews.length}`);
  console.log('========================================');
  console.log('\n🔐 TEST CREDENTIALS (all same password):');
  console.log('   Email: test.admin@test.com    / Test123!');
  console.log('   Email: test.manager@test.com  / Test123!');
  console.log('   Email: test.client@test.com   / Test123!');
  console.log('========================================');
  console.log('\n📦 ORDERS BY STATUS:');
  for (const status of ORDER_STATUSES) {
    console.log(`   ${status}: TEST-${status.toUpperCase()}-001`);
  }
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
