import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TimeOffService } from './timeoff.service';
import { PrismaService } from '../prisma';

describe('TimeOffService', () => {
  let service: TimeOffService;
  let prisma: jest.Mocked<PrismaService>;

  const mockTimeOffRequest = {
    id: 1,
    user_id: 1,
    type: 'vacation',
    start_date: new Date('2024-06-01'),
    end_date: new Date('2024-06-05'),
    reason: 'Summer vacation',
    status: 'pending',
    decided_by: null,
    decided_at: null,
    requested_at: new Date(),
    User_TimeOffRequest_user_idToUser: {
      id: 1,
      first_name: 'John',
      last_name: 'Doe',
      email: 'john@example.com',
    },
    User_TimeOffRequest_decided_byToUser: null,
  };

  beforeEach(async () => {
    const mockPrisma = {
      timeOffRequest: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimeOffService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<TimeOffService>(TimeOffService);
    prisma = module.get(PrismaService);
  });

  describe('findAll', () => {
    it('should return all time off requests', async () => {
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      const result = await service.findAll({});

      expect(result).toHaveLength(1);
    });

    it('should filter by status', async () => {
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      await service.findAll({ status: 'pending' });

      expect(prisma.timeOffRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'pending' }),
        }),
      );
    });

    it('should filter by user_id', async () => {
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      await service.findAll({ userId: 1 });

      expect(prisma.timeOffRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ user_id: 1 }),
        }),
      );
    });
  });

  describe('getMyRequests', () => {
    it('should return time off requests for the user', async () => {
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      const result = await service.getMyRequests(1);

      expect(result).toHaveLength(1);
      expect(prisma.timeOffRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { user_id: 1 },
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return a time off request by id', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);

      const result = await service.findById(1);

      expect(result).toEqual(mockTimeOffRequest);
    });

    it('should throw NotFoundException if not found', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createRequest', () => {
    it('should create a new time off request', async () => {
      const createDto = {
        request_type: 'sick',
        start_date: '2024-07-01',
        end_date: '2024-07-02',
        reason: 'Not feeling well',
      };
      (prisma.timeOffRequest.findFirst as jest.Mock).mockResolvedValue(null);
      (prisma.timeOffRequest.create as jest.Mock).mockResolvedValue({
        id: 2,
        user_id: 1,
        type: createDto.request_type,
        start_date: new Date(createDto.start_date),
        end_date: new Date(createDto.end_date),
        reason: createDto.reason,
        status: 'pending',
      });

      const result = await service.createRequest(createDto, 1);

      expect(result.type).toBe('sick');
      expect(result.status).toBe('pending');
    });

    it('should throw BadRequestException if end_date before start_date', async () => {
      const createDto = {
        request_type: 'vacation',
        start_date: '2024-07-05',
        end_date: '2024-07-01',
        reason: 'Invalid dates',
      };

      await expect(service.createRequest(createDto, 1)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if overlapping request exists', async () => {
      const createDto = {
        request_type: 'vacation',
        start_date: '2024-06-03',
        end_date: '2024-06-07',
        reason: 'Overlapping request',
      };
      (prisma.timeOffRequest.findFirst as jest.Mock).mockResolvedValue(mockTimeOffRequest);

      await expect(service.createRequest(createDto, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('updateRequest', () => {
    it('should update a pending request', async () => {
      const updateDto = {
        end_date: '2024-06-07',
      };
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);
      (prisma.timeOffRequest.update as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        end_date: new Date(updateDto.end_date),
      });

      const result = await service.updateRequest(1, updateDto, 1);

      expect(result.end_date).toEqual(new Date(updateDto.end_date));
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);

      await expect(
        service.updateRequest(1, { reason: 'Updated' }, 2),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if not pending', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        user_id: 1,
        status: 'approved',
      });

      await expect(
        service.updateRequest(1, { reason: 'Updated' }, 1),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cancelRequest', () => {
    it('should cancel a pending request', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);
      (prisma.timeOffRequest.update as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'cancelled',
      });

      const result = await service.cancelRequest(1, 1);

      expect(result.status).toBe('cancelled');
    });

    it('should throw ForbiddenException if not owner', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);

      await expect(service.cancelRequest(1, 2)).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if already processed', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        user_id: 1,
        status: 'approved',
      });

      await expect(service.cancelRequest(1, 1)).rejects.toThrow(BadRequestException);
    });
  });

  describe('decideRequest', () => {
    it('should approve a pending request', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);
      (prisma.timeOffRequest.update as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'approved',
        decided_by: 2,
        decided_at: new Date(),
      });

      const result = await service.decideRequest(1, { status: 'approved' }, 2);

      expect(result.status).toBe('approved');
      expect(result.decided_by).toBe(2);
    });

    it('should reject a pending request', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);
      (prisma.timeOffRequest.update as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'rejected',
        decided_by: 2,
        decided_at: new Date(),
      });

      const result = await service.decideRequest(1, { status: 'rejected' }, 2);

      expect(result.status).toBe('rejected');
      expect(result.decided_by).toBe(2);
    });

    it('should throw NotFoundException if request not found', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.decideRequest(999, { status: 'approved' }, 2)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if not pending', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue({
        ...mockTimeOffRequest,
        status: 'cancelled',
      });

      await expect(service.decideRequest(1, { status: 'approved' }, 2)).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteRequest', () => {
    it('should delete a request', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(mockTimeOffRequest);
      (prisma.timeOffRequest.delete as jest.Mock).mockResolvedValue(mockTimeOffRequest);

      const result = await service.deleteRequest(1);

      expect(result).toEqual(mockTimeOffRequest);
    });

    it('should throw NotFoundException if request not found', async () => {
      (prisma.timeOffRequest.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.deleteRequest(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getSchedule', () => {
    it('should return schedule for date range', async () => {
      const startDate = new Date('2024-06-01');
      const endDate = new Date('2024-06-30');
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      const result = await service.getSchedule(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(prisma.timeOffRequest.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'approved',
            OR: expect.any(Array),
          }),
        }),
      );
    });
  });

  describe('getPendingRequests', () => {
    it('should return pending requests', async () => {
      (prisma.timeOffRequest.findMany as jest.Mock).mockResolvedValue([mockTimeOffRequest]);

      const result = await service.getPendingRequests();

      expect(result).toHaveLength(1);
    });
  });
});
