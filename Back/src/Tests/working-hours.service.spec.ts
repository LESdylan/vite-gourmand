/**
 * Working Hours Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkingHoursService } from '../working-hours/working-hours.service';
import { PrismaService } from '../prisma';

describe('WorkingHoursService', () => {
  let service: WorkingHoursService;
  let prisma: PrismaService;

  const mockHours = {
    id: 'hours-1',
    dayOfWeek: 1,
    openTime: '09:00',
    closeTime: '18:00',
    isClosed: false,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorkingHoursService,
        {
          provide: PrismaService,
          useValue: {
            workingHours: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              upsert: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<WorkingHoursService>(WorkingHoursService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all working hours', async () => {
      jest.spyOn(prisma.workingHours, 'findMany').mockResolvedValue([mockHours] as any);

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });

  describe('findByDay', () => {
    it('should return hours for specific day', async () => {
      jest.spyOn(prisma.workingHours, 'findUnique').mockResolvedValue(mockHours as any);

      const result = await service.findByDay(1);
      expect(result.openTime).toBe('09:00');
    });

    it('should throw NotFoundException', async () => {
      jest.spyOn(prisma.workingHours, 'findUnique').mockResolvedValue(null);
      await expect(service.findByDay(7)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update working hours', async () => {
      const updated = { ...mockHours, closeTime: '20:00' };
      jest.spyOn(prisma.workingHours, 'upsert').mockResolvedValue(updated as any);

      const result = await service.update(1, {
        openTime: '09:00',
        closeTime: '20:00',
      });

      expect(result.closeTime).toBe('20:00');
    });
  });

  describe('toggleClosed', () => {
    it('should toggle closed status', async () => {
      const toggled = { ...mockHours, isClosed: true };
      jest.spyOn(prisma.workingHours, 'findUnique').mockResolvedValue(mockHours as any);
      jest.spyOn(prisma.workingHours, 'update').mockResolvedValue(toggled as any);

      const result = await service.toggleClosed(1);
      expect(result.isClosed).toBe(true);
    });
  });

  describe('isOpen', () => {
    it('should return true when open', async () => {
      jest.spyOn(prisma.workingHours, 'findUnique').mockResolvedValue(mockHours as any);

      const result = await service.isOpen(1, '12:00');
      expect(result).toBe(true);
    });

    it('should return false when closed', async () => {
      const closedHours = { ...mockHours, isClosed: true };
      jest.spyOn(prisma.workingHours, 'findUnique').mockResolvedValue(closedHours as any);

      const result = await service.isOpen(1, '12:00');
      expect(result).toBe(false);
    });
  });
});
