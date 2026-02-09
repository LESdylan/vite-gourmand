/**
 * Mail Service Unit Tests
 */
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';

// Mock nodemailer
jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

describe('MailService', () => {
  let service: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                MAIL_HOST: 'smtp.test.com',
                MAIL_PORT: '587',
                MAIL_USER: 'test@test.com',
                MAIL_APP_PASSWORD: 'password',
                MAIL_FROM: 'noreply@test.com',
                FRONTEND_URL: 'http://localhost:3000',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('send', () => {
    it('should send email successfully', async () => {
      const result = await service.send({
        to: 'recipient@test.com',
        subject: 'Test Subject',
        html: '<p>Test content</p>',
      });

      expect(result).toBe(true);
    });
  });

  describe('sendPasswordReset', () => {
    it('should send password reset email', async () => {
      const result = await service.sendPasswordReset(
        'user@test.com',
        'reset-token-123',
      );

      expect(result).toBe(true);
    });
  });

  describe('sendOrderConfirmation', () => {
    it('should send order confirmation email', async () => {
      const result = await service.sendOrderConfirmation(
        'user@test.com',
        'ORD-12345',
      );

      expect(result).toBe(true);
    });
  });
});
