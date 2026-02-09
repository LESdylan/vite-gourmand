/**
 * Analytics Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AnalyticsService } from '../analytics/analytics.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(null), // No MongoDB URI for tests
          },
        },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('trackEvent', () => {
    it('should handle tracking without MongoDB', async () => {
      // Should not throw even without MongoDB
      await expect(
        service.trackEvent({
          eventType: 'page_view',
          userId: 'user-1',
          data: { page: '/home' },
          timestamp: new Date(),
        }),
      ).resolves.not.toThrow();
    });
  });

  describe('getEventsByType', () => {
    it('should return empty array without MongoDB', async () => {
      const result = await service.getEventsByType('page_view');
      expect(result).toEqual([]);
    });
  });

  describe('getEventStats', () => {
    it('should return empty object without MongoDB', async () => {
      const result = await service.getEventStats(7);
      expect(result).toEqual({});
    });
  });
});
