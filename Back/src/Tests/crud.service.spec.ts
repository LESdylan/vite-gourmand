/**
 * CRUD Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { CrudService } from '../crud/crud.service';
import { PrismaService } from '../prisma';

describe('CrudService', () => {
  let service: CrudService;
  let prisma: any;

  const mockData = [
    { id: '1', name: 'Item 1' },
    { id: '2', name: 'Item 2' },
  ];

  beforeEach(async () => {
    const mockPrisma = {
      testModel: {
        findMany: jest.fn().mockResolvedValue(mockData),
        findUnique: jest.fn().mockResolvedValue(mockData[0]),
        create: jest.fn().mockResolvedValue(mockData[0]),
        update: jest.fn().mockResolvedValue(mockData[0]),
        delete: jest.fn().mockResolvedValue(mockData[0]),
        count: jest.fn().mockResolvedValue(2),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CrudService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<CrudService>(CrudService);
    prisma = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated results', async () => {
      const result = await service.findAll('testModel', {
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return single item', async () => {
      const result = await service.findOne('testModel', '1');
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('create', () => {
    it('should create item', async () => {
      const result = await service.create('testModel', { name: 'New Item' });
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('update', () => {
    it('should update item', async () => {
      const result = await service.update('testModel', '1', { name: 'Updated' });
      expect(result).toEqual(mockData[0]);
    });
  });

  describe('delete', () => {
    it('should delete item', async () => {
      await expect(service.delete('testModel', '1')).resolves.not.toThrow();
    });
  });

  describe('exists', () => {
    it('should return true for existing item', async () => {
      const result = await service.exists('testModel', { id: '1' });
      expect(result).toBe(true);
    });
  });
});
