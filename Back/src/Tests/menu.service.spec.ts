/**
 * Menu Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { MenuService } from '../menu/menu.service';
import { PrismaService } from '../prisma';

describe('MenuService', () => {
  let service: MenuService;
  let prisma: PrismaService;

  const mockMenu = {
    id: 'menu-1',
    name: 'Weekly Special',
    description: 'Delicious weekly menu',
    price: 29.99,
    isAvailable: true,
    dishes: [],
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: PrismaService,
          useValue: {
            menu: {
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

    service = module.get<MenuService>(MenuService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated menus', async () => {
      jest.spyOn(prisma.menu, 'findMany').mockResolvedValue([mockMenu] as any);
      jest.spyOn(prisma.menu, 'count').mockResolvedValue(1);

      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return menu by id', async () => {
      jest.spyOn(prisma.menu, 'findUnique').mockResolvedValue(mockMenu as any);

      const result = await service.findOne('menu-1');
      expect(result.name).toBe('Weekly Special');
    });

    it('should throw NotFoundException if menu not found', async () => {
      jest.spyOn(prisma.menu, 'findUnique').mockResolvedValue(null);
      await expect(service.findOne('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create new menu', async () => {
      jest.spyOn(prisma.menu, 'create').mockResolvedValue(mockMenu as any);

      const result = await service.create({
        name: 'Weekly Special',
        description: 'Delicious weekly menu',
        price: 29.99,
      });

      expect(result.name).toBe('Weekly Special');
    });
  });

  describe('update', () => {
    it('should update menu', async () => {
      const updated = { ...mockMenu, price: 34.99 };
      jest.spyOn(prisma.menu, 'findUnique').mockResolvedValue(mockMenu as any);
      jest.spyOn(prisma.menu, 'update').mockResolvedValue(updated as any);

      const result = await service.update('menu-1', { price: 34.99 });
      expect(result.price).toBe(34.99);
    });
  });

  describe('delete', () => {
    it('should delete menu', async () => {
      jest.spyOn(prisma.menu, 'findUnique').mockResolvedValue(mockMenu as any);
      jest.spyOn(prisma.menu, 'delete').mockResolvedValue(mockMenu as any);

      await expect(service.delete('menu-1')).resolves.not.toThrow();
    });
  });
});
