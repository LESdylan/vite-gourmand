/**
 * Review Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { ReviewService } from '../review/review.service';
import { PrismaService } from '../prisma';

describe('ReviewService', () => {
  let service: ReviewService;
  let prisma: PrismaService;

  const mockReview = {
    id: 'review-1',
    userId: 'user-1',
    dishId: 'dish-1',
    rating: 5,
    comment: 'Excellent!',
    status: 'APPROVED',
    createdAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewService,
        {
          provide: PrismaService,
          useValue: {
            review: {
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

    service = module.get<ReviewService>(ReviewService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByDish', () => {
    it('should return reviews for dish', async () => {
      jest.spyOn(prisma.review, 'findMany').mockResolvedValue([mockReview] as any);
      jest.spyOn(prisma.review, 'count').mockResolvedValue(1);

      const result = await service.findByDish('dish-1', { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create new review', async () => {
      jest.spyOn(prisma.review, 'create').mockResolvedValue(mockReview as any);

      const result = await service.create('user-1', {
        dishId: 'dish-1',
        rating: 5,
        comment: 'Excellent!',
      });

      expect(result.rating).toBe(5);
    });
  });

  describe('update', () => {
    it('should update own review', async () => {
      const updated = { ...mockReview, comment: 'Updated comment' };
      jest.spyOn(prisma.review, 'findUnique').mockResolvedValue(mockReview as any);
      jest.spyOn(prisma.review, 'update').mockResolvedValue(updated as any);

      const result = await service.update('review-1', 'user-1', {
        comment: 'Updated comment',
      });
      expect(result.comment).toBe('Updated comment');
    });

    it('should throw ForbiddenException for other users review', async () => {
      jest.spyOn(prisma.review, 'findUnique').mockResolvedValue(mockReview as any);

      await expect(
        service.update('review-1', 'other-user', { comment: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('delete', () => {
    it('should delete own review', async () => {
      jest.spyOn(prisma.review, 'findUnique').mockResolvedValue(mockReview as any);
      jest.spyOn(prisma.review, 'delete').mockResolvedValue(mockReview as any);

      await expect(service.delete('review-1', 'user-1')).resolves.not.toThrow();
    });
  });

  describe('moderate', () => {
    it('should approve review', async () => {
      const approved = { ...mockReview, status: 'APPROVED' };
      jest.spyOn(prisma.review, 'findUnique').mockResolvedValue(mockReview as any);
      jest.spyOn(prisma.review, 'update').mockResolvedValue(approved as any);

      const result = await service.moderate('review-1', { status: 'APPROVED' });
      expect(result.status).toBe('APPROVED');
    });

    it('should reject review', async () => {
      const rejected = { ...mockReview, status: 'REJECTED' };
      jest.spyOn(prisma.review, 'findUnique').mockResolvedValue(mockReview as any);
      jest.spyOn(prisma.review, 'update').mockResolvedValue(rejected as any);

      const result = await service.moderate('review-1', { status: 'REJECTED' });
      expect(result.status).toBe('REJECTED');
    });
  });
});
