/**
 * GDPR Service
 */
import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateUserConsentDto, UpdateUserConsentDto, CreateDataDeletionRequestDto, ProcessDataDeletionRequestDto, DataDeletionStatus } from './dto/gdpr.dto';

@Injectable()
export class GdprService {
  constructor(private prisma: PrismaService) {}

  // ============ User Consent ============

  /**
   * Get all consents for user
   */
  async getUserConsents(userId: number) {
    return this.prisma.userConsent.findMany({
      where: { user_id: userId },
      orderBy: { consent_type: 'asc' },
    });
  }

  /**
   * Get specific consent for user
   */
  async getUserConsent(userId: number, consentType: string) {
    return this.prisma.userConsent.findFirst({
      where: {
        user_id: userId,
        consent_type: consentType,
      },
    });
  }

  /**
   * Set user consent (create or update)
   */
  async setUserConsent(userId: number, dto: CreateUserConsentDto) {
    const existing = await this.prisma.userConsent.findFirst({
      where: { user_id: userId, consent_type: dto.consent_type },
    });

    if (existing) {
      return this.prisma.userConsent.update({
        where: { id: existing.id },
        data: {
          is_granted: dto.consented,
          granted_at: dto.consented ? new Date() : null,
          revoked_at: dto.consented ? null : new Date(),
        },
      });
    }

    return this.prisma.userConsent.create({
      data: {
        user_id: userId,
        consent_type: dto.consent_type,
        is_granted: dto.consented,
        granted_at: dto.consented ? new Date() : null,
      },
    });
  }

  /**
   * Update consent
   */
  async updateConsent(userId: number, consentType: string, dto: UpdateUserConsentDto) {
    const consent = await this.prisma.userConsent.findFirst({
      where: {
        user_id: userId,
        consent_type: consentType,
      },
    });

    if (!consent) {
      throw new NotFoundException('Consent not found');
    }

    return this.prisma.userConsent.update({
      where: { id: consent.id },
      data: {
        is_granted: dto.consented,
        granted_at: dto.consented ? new Date() : consent.granted_at,
        revoked_at: dto.consented ? null : new Date(),
      },
    });
  }

  /**
   * Withdraw all consents (except essential)
   */
  async withdrawAllConsents(userId: number) {
    return this.prisma.userConsent.updateMany({
      where: {
        user_id: userId,
        consent_type: { not: 'essential' },
      },
      data: {
        is_granted: false,
        revoked_at: new Date(),
      },
    });
  }

  // ============ Data Deletion Requests ============

  /**
   * Create data deletion request
   */
  async createDeletionRequest(userId: number, dto: CreateDataDeletionRequestDto) {
    // Check if user already has a pending request
    const existing = await this.prisma.dataDeletionRequest.findFirst({
      where: {
        user_id: userId,
        status: { in: ['pending', 'in_progress'] },
      },
    });

    if (existing) {
      throw new ConflictException('You already have a pending data deletion request');
    }

    return this.prisma.dataDeletionRequest.create({
      data: {
        user_id: userId,
        reason: dto.reason,
        status: 'pending',
      },
    });
  }

  /**
   * Get my deletion request
   */
  async getMyDeletionRequest(userId: number) {
    return this.prisma.dataDeletionRequest.findFirst({
      where: { user_id: userId },
      orderBy: { requested_at: 'desc' },
    });
  }

  /**
   * Cancel my deletion request
   */
  async cancelDeletionRequest(userId: number) {
    const request = await this.prisma.dataDeletionRequest.findFirst({
      where: {
        user_id: userId,
        status: 'pending',
      },
    });

    if (!request) {
      throw new NotFoundException('No pending deletion request found');
    }

    return this.prisma.dataDeletionRequest.delete({
      where: { id: request.id },
    });
  }

  /**
   * Get all deletion requests (admin)
   */
  async getAllDeletionRequests(options: { status?: string }) {
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }

    return this.prisma.dataDeletionRequest.findMany({
      where,
      include: {
        User_DataDeletionRequest_user_idToUser: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            created_at: true,
          },
        },
        User_DataDeletionRequest_processed_byToUser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { requested_at: 'desc' },
    });
  }

  /**
   * Get pending deletion requests (admin)
   */
  async getPendingDeletionRequests() {
    return this.getAllDeletionRequests({ status: 'pending' });
  }

  /**
   * Get deletion request by ID (admin)
   */
  async getDeletionRequestById(id: number) {
    const request = await this.prisma.dataDeletionRequest.findUnique({
      where: { id },
      include: {
        User_DataDeletionRequest_user_idToUser: {
          select: {
            id: true,
            email: true,
            first_name: true,
            last_name: true,
            created_at: true,
          },
        },
        User_DataDeletionRequest_processed_byToUser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found');
    }

    return request;
  }

  /**
   * Process deletion request (admin)
   */
  async processDeletionRequest(id: number, dto: ProcessDataDeletionRequestDto, adminId: number) {
    const request = await this.prisma.dataDeletionRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Deletion request not found');
    }

    if (request.status === 'completed') {
      throw new BadRequestException('Request already completed');
    }

    const updateData: any = {
      status: dto.status,
      processed_by: adminId,
      processed_at: new Date(),
    };

    // If completed, perform actual data deletion/anonymization
    if (dto.status === DataDeletionStatus.COMPLETED && request.user_id) {
      await this.performDataDeletion(request.user_id);
    }

    return this.prisma.dataDeletionRequest.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Perform actual data deletion/anonymization
   */
  private async performDataDeletion(userId: number) {
    // Anonymize user data instead of hard delete (preserve order history for business records)
    const anonymizedEmail = `deleted-${userId}@anonymized.local`;

    await this.prisma.$transaction([
      // Anonymize user profile
      this.prisma.user.update({
        where: { id: userId },
        data: {
          email: anonymizedEmail,
          first_name: 'Deleted',
          last_name: 'User',
          phone_number: null,
          is_active: false,
        },
      }),
      // Delete all consents
      this.prisma.userConsent.deleteMany({
        where: { user_id: userId },
      }),
      // Delete sessions
      this.prisma.userSession.deleteMany({
        where: { user_id: userId },
      }),
      // Delete addresses
      this.prisma.userAddress.deleteMany({
        where: { user_id: userId },
      }),
      // Delete loyalty account and transactions
      this.prisma.loyaltyTransaction.deleteMany({
        where: { LoyaltyAccount: { user_id: userId } },
      }),
      this.prisma.loyaltyAccount.deleteMany({
        where: { user_id: userId },
      }),
      // Anonymize reviews (keep ratings but remove personal info)
      this.prisma.publish.updateMany({
        where: { user_id: userId },
        data: {
          description: '[Deleted by user request]',
        },
      }),
    ]);
  }

  /**
   * Export user data (GDPR data portability)
   */
  async exportUserData(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        UserAddress: true,
        Order: true,
        Publish_Publish_user_idToUser: true,
        UserConsent: true,
        LoyaltyAccount: {
          include: {
            LoyaltyTransaction: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data from export
    const { password, ...exportData } = user;

    return {
      exportedAt: new Date().toISOString(),
      data: exportData,
    };
  }
}
