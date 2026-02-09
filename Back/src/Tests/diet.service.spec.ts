/**
 * Diet Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DietService } from '../diet/diet.service';
import { PrismaService } from '../prisma';

describe('DietService', () => {
  let service: DietService;
  let prisma: PrismaService;

  const mockDiet = {
    id: 'diet-1',
    name: 'Vegetarian',
    description: 'No meat products',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DietService,
        {
          provide: PrismaService,
          useValue: {
            diet: {
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

    service = module.get<DietService>(DietService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all diets', async () => {
      jest.spyOn(prisma.diet, 'findMany').mockResolvedValue([mockDiet] as any);
      jest.spyOn(prisma.diet, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return diet by id', async () => {
      jest.spyOn(prisma.diet, 'findUnique').mockResolvedValue(mockDiet as any);

      const result = await service.findOne('diet-1');
      expect(result.name).toBe('Vegetarian');
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.diet, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new diet', async () => {
      jest.spyOn(prisma.diet, 'create').mockResolvedValue(mockDiet as any);

      const result = await service.create({
        name: 'Vegetarian',
        description: 'No meat products',
      });

      expect(result.name).toBe('Vegetarian');
    });
  });

  describe('update', () => {
    it('should update diet', async () => {
      const updated = { ...mockDiet, name: 'Vegan' };
      jest.spyOn(prisma.diet, 'findUnique').mockResolvedValue(mockDiet as any);
      jest.spyOn(prisma.diet, 'update').mockResolvedValue(updated as any);

      const result = await service.update('diet-1', { name: 'Vegan' });
      expect(result.name).toBe('Vegan');
    });
  });

  describe('delete', () => {
    it('should delete diet', async () => {
      jest.spyOn(prisma.diet, 'findUnique').mockResolvedValue(mockDiet as any);
      jest.spyOn(prisma.diet, 'delete').mockResolvedValue(mockDiet as any);

      await expect(service.delete('diet-1')).resolves.not.toThrow();
    });
  });
});
