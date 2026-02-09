/**
 * Admin Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AdminService } from '../admin/admin.service';
import { PrismaService } from '../prisma';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'CLIENT',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: {
            user: {
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

    service = module.get<AdminService>(AdminService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllUsers', () => {
    it('should return paginated users', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([mockUser] as any);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      const result = await service.getAllUsers({ page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });

    it('should filter by role', async () => {
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([mockUser] as any);
      jest.spyOn(prisma.user, 'count').mockResolvedValue(1);

      await service.getAllUsers({ page: 1, limit: 10, role: 'CLIENT' });
      expect(prisma.user.findMany).toHaveBeenCalled();
    });
  });

  describe('createEmployee', () => {
    it('should create employee user', async () => {
      const employee = { ...mockUser, role: 'EMPLOYEE' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prisma.user, 'create').mockResolvedValue(employee as any);

      const result = await service.createEmployee({
        email: 'employee@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        password: 'password123',
      });

      expect(result.role).toBe('EMPLOYEE');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const updated = { ...mockUser, role: 'EMPLOYEE' };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updated as any);

      const result = await service.updateUserRole('user-1', { role: 'EMPLOYEE' });
      expect(result.role).toBe('EMPLOYEE');
    });

    it('should throw NotFoundException for invalid user', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(
        service.updateUserRole('invalid', { role: 'ADMIN' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('toggleUserActive', () => {
    it('should toggle user active status', async () => {
      const toggled = { ...mockUser, isActive: false };
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(toggled as any);

      const result = await service.toggleUserActive('user-1');
      expect(result.isActive).toBe(false);
    });
  });
});
