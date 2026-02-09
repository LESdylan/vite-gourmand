/**
 * Allergen Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AllergenService } from '../allergen/allergen.service';
import { PrismaService } from '../prisma';

describe('AllergenService', () => {
  let service: AllergenService;
  let prisma: PrismaService;

  const mockAllergen = {
    id: 'allergen-1',
    name: 'Peanuts',
    description: 'Contains peanuts',
    icon: '🥜',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AllergenService,
        {
          provide: PrismaService,
          useValue: {
            allergen: {
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

    service = module.get<AllergenService>(AllergenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all allergens', async () => {
      jest.spyOn(prisma.allergen, 'findMany').mockResolvedValue([mockAllergen] as any);
      jest.spyOn(prisma.allergen, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return allergen by id', async () => {
      jest.spyOn(prisma.allergen, 'findUnique').mockResolvedValue(mockAllergen as any);

      const result = await service.findOne('allergen-1');
      expect(result.name).toBe('Peanuts');
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.allergen, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new allergen', async () => {
      jest.spyOn(prisma.allergen, 'create').mockResolvedValue(mockAllergen as any);

      const result = await service.create({
        name: 'Peanuts',
        description: 'Contains peanuts',
        icon: '🥜',
      });

      expect(result.name).toBe('Peanuts');
    });
  });

  describe('update', () => {
    it('should update allergen', async () => {
      const updated = { ...mockAllergen, icon: '🌰' };
      jest.spyOn(prisma.allergen, 'findUnique').mockResolvedValue(mockAllergen as any);
      jest.spyOn(prisma.allergen, 'update').mockResolvedValue(updated as any);

      const result = await service.update('allergen-1', { icon: '🌰' });
      expect(result.icon).toBe('🌰');
    });
  });

  describe('delete', () => {
    it('should delete allergen', async () => {
      jest.spyOn(prisma.allergen, 'findUnique').mockResolvedValue(mockAllergen as any);
      jest.spyOn(prisma.allergen, 'delete').mockResolvedValue(mockAllergen as any);

      await expect(service.delete('allergen-1')).resolves.not.toThrow();
    });
  });
});
