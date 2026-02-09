/**
 * Dish Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DishService } from '../dish/dish.service';
import { PrismaService } from '../prisma';

describe('DishService', () => {
  let service: DishService;
  let prisma: PrismaService;

  const mockDish = {
    id: 'dish-1',
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon',
    price: 24.99,
    isAvailable: true,
    categoryId: 'cat-1',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DishService,
        {
          provide: PrismaService,
          useValue: {
            dish: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<DishService>(DishService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated dishes', async () => {
      jest.spyOn(prisma.dish, 'findMany').mockResolvedValue([mockDish] as any);
      jest.spyOn(prisma.dish, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });

    it('should filter by category', async () => {
      jest.spyOn(prisma.dish, 'findMany').mockResolvedValue([mockDish] as any);
      jest.spyOn(prisma.dish, 'count').mockResolvedValue(1);

      await service.findAll({ page: 1, limit: 10, categoryId: 'cat-1' });
      expect(prisma.dish.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ categoryId: 'cat-1' }),
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return dish by id', async () => {
      jest.spyOn(prisma.dish, 'findUnique').mockResolvedValue(mockDish as any);

      const result = await service.findOne('dish-1');
      expect(result.name).toBe('Grilled Salmon');
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.dish, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new dish', async () => {
      jest.spyOn(prisma.dish, 'create').mockResolvedValue(mockDish as any);

      const result = await service.create({
        name: 'Grilled Salmon',
        description: 'Fresh Atlantic salmon',
        price: 24.99,
        categoryId: 'cat-1',
      });

      expect(result.name).toBe('Grilled Salmon');
    });
  });

  describe('toggleAvailability', () => {
    it('should toggle dish availability', async () => {
      const toggled = { ...mockDish, isAvailable: false };
      jest.spyOn(prisma.dish, 'findUnique').mockResolvedValue(mockDish as any);
      jest.spyOn(prisma.dish, 'update').mockResolvedValue(toggled as any);

      const result = await service.toggleAvailability('dish-1');
      expect(result.isAvailable).toBe(false);
    });
  });
});
