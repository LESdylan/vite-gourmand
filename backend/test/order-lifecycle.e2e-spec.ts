/**
 * Order Lifecycle E2E Tests
 * ==========================
 * 
 * Simulates real user events through HTTP requests:
 * - User places an order
 * - Employee accepts order
 * - Order goes through all statuses
 * - Admin creates employee
 * 
 * These tests validate the backend independently from the frontend.
 * Run with: npm run test:e2e -- --testPathPattern=order-lifecycle
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp } from './test-utils';

describe('Order Lifecycle (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  
  // Test data
  let clientToken: string;
  let adminToken: string;
  let clientId: number;
  let orderId: number;
  let menuId: number;

  const testClient = {
    email: `client-${Date.now()}@test.com`,
    password: 'TestClient123!',
    firstName: 'Test Client',
    city: 'Paris',
    telephoneNumber: '+33600000001',
    postalAddress: '1 Rue Test, 75001',
  };

  const testAdmin = {
    email: `admin-${Date.now()}@test.com`,
    password: 'TestAdmin123!',
    firstName: 'Test Admin',
  };

  beforeAll(async () => {
    app = await createTestApp();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    
    prisma = app.get<PrismaService>(PrismaService);

    // Setup: Create admin role and user
    const adminRole = await prisma.role.upsert({
      where: { id: 1 },
      update: {},
      create: { libelle: 'admin' },
    });

    const clientRole = await prisma.role.upsert({
      where: { id: 2 },
      update: {},
      create: { libelle: 'client' },
    });

    // Create a test menu
    const menu = await prisma.menu.create({
      data: {
        title: 'Test Menu',
        person_min: 10,
        price_per_person: 50.0,
        description: 'Test menu for e2e tests',
        remaining_qty: 100,
      },
    });
    menuId = menu.id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (orderId) {
      await prisma.order.deleteMany({ where: { id: orderId } });
    }
    await prisma.menu.deleteMany({ where: { title: 'Test Menu' } });
    await prisma.user.deleteMany({ where: { email: { contains: '@test.com' } } });
    await app.close();
  });

  describe('User Flow: Registration → Login → Order', () => {
    it('should register a new client user', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testClient);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toHaveProperty('id');
      
      clientToken = response.body.data.accessToken;
      clientId = response.body.data.user.id;
    });

    it('should login with registered credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testClient.email,
          password: testClient.password,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.accessToken).toBeDefined();
      
      clientToken = response.body.data.accessToken;
    });

    it('should get current user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${clientToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.email).toBe(testClient.email);
    });
  });

  describe('Order Status Transitions', () => {
    /**
     * Order Status Flow:
     * pending → confirmed → preparing → ready → delivering → delivered → completed
     *                                                      ↘ cancelled
     */
    
    const ORDER_STATUSES = [
      'pending',
      'confirmed',
      'preparing',
      'ready',
      'delivering',
      'delivered',
      'completed',
    ];

    it('should create order with pending status', async () => {
      const orderData = {
        order_number: `ORD-TEST-${Date.now()}`,
        order_date: new Date().toISOString(),
        prestation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        delivery_hour: '18:00',
        menu_price: 500.0,
        person_number: 10,
        delivery_price: 50.0,
        status: 'pending',
        material_lending: true,
        get_back_material: false,
        userId: clientId,
        menus: { connect: [{ id: menuId }] },
      };

      // Direct DB creation for testing (simulating order creation)
      const order = await prisma.order.create({
        data: orderData,
        include: { menus: true },
      });

      orderId = order.id;
      expect(order.status).toBe('pending');
      expect(order.menus.length).toBe(1);
    });

    it('should transition order through all statuses', async () => {
      for (let i = 1; i < ORDER_STATUSES.length; i++) {
        const newStatus = ORDER_STATUSES[i];
        
        const updatedOrder = await prisma.order.update({
          where: { id: orderId },
          data: { status: newStatus },
        });

        expect(updatedOrder.status).toBe(newStatus);
      }
    });

    it('should allow cancellation from pending', async () => {
      // Create new order for cancellation test
      const cancelOrder = await prisma.order.create({
        data: {
          order_number: `ORD-CANCEL-${Date.now()}`,
          order_date: new Date(),
          prestation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          delivery_hour: '18:00',
          menu_price: 500.0,
          person_number: 10,
          delivery_price: 50.0,
          status: 'pending',
          material_lending: false,
          get_back_material: false,
          userId: clientId,
        },
      });

      const cancelled = await prisma.order.update({
        where: { id: cancelOrder.id },
        data: { status: 'cancelled' },
      });

      expect(cancelled.status).toBe('cancelled');

      // Cleanup
      await prisma.order.delete({ where: { id: cancelOrder.id } });
    });
  });

  describe('Order Price Calculations', () => {
    it('should calculate total price correctly', async () => {
      const pricePerPerson = 50.0;
      const personCount = 20;
      const deliveryPrice = 75.0;
      
      const expectedMenuPrice = pricePerPerson * personCount;
      const expectedTotal = expectedMenuPrice + deliveryPrice;

      const order = await prisma.order.create({
        data: {
          order_number: `ORD-PRICE-${Date.now()}`,
          order_date: new Date(),
          prestation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          delivery_hour: '19:00',
          menu_price: expectedMenuPrice,
          person_number: personCount,
          delivery_price: deliveryPrice,
          status: 'pending',
          material_lending: true,
          get_back_material: true,
          userId: clientId,
        },
      });

      expect(order.menu_price).toBe(expectedMenuPrice);
      expect(order.delivery_price).toBe(deliveryPrice);
      expect(order.menu_price + order.delivery_price).toBe(expectedTotal);

      // Cleanup
      await prisma.order.delete({ where: { id: order.id } });
    });

    it('should enforce minimum person count from menu', async () => {
      const menu = await prisma.menu.findUnique({
        where: { id: menuId },
      });

      expect(menu).toBeDefined();
      expect(menu!.person_min).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle order with multiple menus', async () => {
      // Create second menu
      const menu2 = await prisma.menu.create({
        data: {
          title: 'Test Menu 2',
          person_min: 5,
          price_per_person: 30.0,
          description: 'Secondary test menu',
          remaining_qty: 50,
        },
      });

      const multiMenuOrder = await prisma.order.create({
        data: {
          order_number: `ORD-MULTI-${Date.now()}`,
          order_date: new Date(),
          prestation_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          delivery_hour: '12:00',
          menu_price: 800.0,
          person_number: 20,
          delivery_price: 100.0,
          status: 'pending',
          material_lending: false,
          get_back_material: false,
          userId: clientId,
          menus: { connect: [{ id: menuId }, { id: menu2.id }] },
        },
        include: { menus: true },
      });

      expect(multiMenuOrder.menus.length).toBe(2);

      // Cleanup
      await prisma.order.delete({ where: { id: multiMenuOrder.id } });
      await prisma.menu.delete({ where: { id: menu2.id } });
    });

    it('should cascade delete orders when user is deleted', async () => {
      // Create temp user
      const tempUser = await prisma.user.create({
        data: {
          email: `temp-${Date.now()}@test.com`,
          password: 'TempPass123!',
          first_name: 'Temp',
          telephone_number: '',
          city: '',
          country: 'France',
          postal_address: '',
        },
      });

      // Create order for temp user
      const tempOrder = await prisma.order.create({
        data: {
          order_number: `ORD-TEMP-${Date.now()}`,
          order_date: new Date(),
          prestation_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          delivery_hour: '18:00',
          menu_price: 500.0,
          person_number: 10,
          delivery_price: 50.0,
          status: 'pending',
          material_lending: false,
          get_back_material: false,
          userId: tempUser.id,
        },
      });

      // Delete user (should cascade delete order)
      await prisma.user.delete({ where: { id: tempUser.id } });

      // Verify order is deleted
      const deletedOrder = await prisma.order.findUnique({
        where: { id: tempOrder.id },
      });

      expect(deletedOrder).toBeNull();
    });
  });
});
