/**
 * Order Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrderService } from '../order/order.service';
import { PrismaService } from '../prisma';

describe('OrderService', () => {
  let service: OrderService;
  let prisma: PrismaService;

  const mockOrder = {
    id: 'order-1',
    orderNumber: 'ORD-001',
    userId: 'user-1',
    status: 'PENDING',
    totalAmount: 59.99,
    items: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        {
          provide: PrismaService,
          useValue: {
            order: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByUser', () => {
    it('should return user orders', async () => {
      jest.spyOn(prisma.order, 'findMany').mockResolvedValue([mockOrder] as any);
      jest.spyOn(prisma.order, 'count').mockResolvedValue(1);

      const result = await service.findByUser('user-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return order by id for owner', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

      const result = await service.findOne('order-1', 'user-1');
      expect(result.orderNumber).toBe('ORD-001');
    });

    it('should throw ForbiddenException for non-owner', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(mockOrder as any);

      await expect(
        service.findOne('order-1', 'other-user'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw NotFoundException if order not found', async () => {
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(null);

      await expect(
        service.findOne('invalid', 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new order', async () => {
      jest.spyOn(prisma.order, 'create').mockResolvedValue(mockOrder as any);

      const result = await service.create('user-1', {
        items: [{ dishId: 'dish-1', quantity: 2 }],
        deliveryAddressId: 'addr-1',
      });

      expect(result.orderNumber).toBeDefined();
    });
  });

  describe('cancel', () => {
    it('should cancel pending order', async () => {
      const pendingOrder = { ...mockOrder, status: 'PENDING' };
      const cancelledOrder = { ...mockOrder, status: 'CANCELLED' };

      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(pendingOrder as any);
      jest.spyOn(prisma.order, 'update').mockResolvedValue(cancelledOrder as any);

      const result = await service.cancel('order-1', 'user-1');
      expect(result.status).toBe('CANCELLED');
    });

    it('should throw ForbiddenException for non-pending order', async () => {
      const deliveredOrder = { ...mockOrder, status: 'DELIVERED' };
      jest.spyOn(prisma.order, 'findUnique').mockResolvedValue(deliveredOrder as any);

      await expect(
        service.cancel('order-1', 'user-1'),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
