/**
 * Theme Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ThemeService } from '../theme/theme.service';
import { PrismaService } from '../prisma';

describe('ThemeService', () => {
  let service: ThemeService;
  let prisma: PrismaService;

  const mockTheme = {
    id: 'theme-1',
    name: 'Italian',
    description: 'Italian cuisine',
    color: '#FF5722',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        {
          provide: PrismaService,
          useValue: {
            theme: {
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

    service = module.get<ThemeService>(ThemeService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all themes', async () => {
      jest.spyOn(prisma.theme, 'findMany').mockResolvedValue([mockTheme] as any);
      jest.spyOn(prisma.theme, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return theme by id', async () => {
      jest.spyOn(prisma.theme, 'findUnique').mockResolvedValue(mockTheme as any);

      const result = await service.findOne('theme-1');
      expect(result.name).toBe('Italian');
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.theme, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new theme', async () => {
      jest.spyOn(prisma.theme, 'create').mockResolvedValue(mockTheme as any);

      const result = await service.create({
        name: 'Italian',
        description: 'Italian cuisine',
        color: '#FF5722',
      });

      expect(result.name).toBe('Italian');
    });
  });

  describe('update', () => {
    it('should update theme', async () => {
      const updated = { ...mockTheme, color: '#4CAF50' };
      jest.spyOn(prisma.theme, 'findUnique').mockResolvedValue(mockTheme as any);
      jest.spyOn(prisma.theme, 'update').mockResolvedValue(updated as any);

      const result = await service.update('theme-1', { color: '#4CAF50' });
      expect(result.color).toBe('#4CAF50');
    });
  });

  describe('delete', () => {
    it('should delete theme', async () => {
      jest.spyOn(prisma.theme, 'findUnique').mockResolvedValue(mockTheme as any);
      jest.spyOn(prisma.theme, 'delete').mockResolvedValue(mockTheme as any);

      await expect(service.delete('theme-1')).resolves.not.toThrow();
    });
  });
});
