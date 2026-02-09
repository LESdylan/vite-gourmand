/**
 * Time Off Service
 */
import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateTimeOffRequestDto, UpdateTimeOffRequestDto, DecideTimeOffRequestDto, TimeOffRequestStatus } from './dto/timeoff.dto';

@Injectable()
export class TimeOffService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create time off request (employee)
   */
  async createRequest(dto: CreateTimeOffRequestDto, userId: number) {
    const startDate = new Date(dto.start_date);
    const endDate = new Date(dto.end_date);

    if (endDate < startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Check for overlapping requests
    const overlapping = await this.prisma.timeOffRequest.findFirst({
      where: {
        user_id: userId,
        status: { in: ['pending', 'approved'] },
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
        ],
      },
    });

    if (overlapping) {
      throw new BadRequestException('You have an overlapping time-off request');
    }

    return this.prisma.timeOffRequest.create({
      data: {
        user_id: userId,
        type: dto.request_type,
        start_date: startDate,
        end_date: endDate,
        reason: dto.reason,
        status: 'pending',
      },
    });
  }

  /**
   * Get my requests (employee)
   */
  async getMyRequests(userId: number) {
    return this.prisma.timeOffRequest.findMany({
      where: { user_id: userId },
      orderBy: { requested_at: 'desc' },
    });
  }

  /**
   * Get all requests (admin)
   */
  async findAll(options: { status?: string; userId?: number }) {
    const where: any = {};

    if (options.status) {
      where.status = options.status;
    }

    if (options.userId) {
      where.user_id = options.userId;
    }

    return this.prisma.timeOffRequest.findMany({
      where,
      include: {
        User_TimeOffRequest_user_idToUser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        User_TimeOffRequest_decided_byToUser: {
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
   * Get pending requests (admin)
   */
  async getPendingRequests() {
    return this.findAll({ status: 'pending' });
  }

  /**
   * Get request by ID
   */
  async findById(id: number) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
      include: {
        User_TimeOffRequest_user_idToUser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            email: true,
          },
        },
        User_TimeOffRequest_decided_byToUser: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
          },
        },
      },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    return request;
  }

  /**
   * Update request (employee can only update pending requests)
   */
  async updateRequest(id: number, dto: UpdateTimeOffRequestDto, userId: number) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    if (request.user_id !== userId) {
      throw new ForbiddenException('You can only update your own requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Can only update pending requests');
    }

    const updateData: any = {};

    if (dto.request_type) updateData.type = dto.request_type;
    if (dto.reason !== undefined) updateData.reason = dto.reason;
    if (dto.start_date) updateData.start_date = new Date(dto.start_date);
    if (dto.end_date) updateData.end_date = new Date(dto.end_date);

    if (updateData.start_date && updateData.end_date) {
      if (updateData.end_date < updateData.start_date) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    return this.prisma.timeOffRequest.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Cancel request (employee)
   */
  async cancelRequest(id: number, userId: number) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    if (request.user_id !== userId) {
      throw new ForbiddenException('You can only cancel your own requests');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Can only cancel pending requests');
    }

    return this.prisma.timeOffRequest.update({
      where: { id },
      data: { status: 'cancelled' },
    });
  }

  /**
   * Decide on request (admin approve/reject)
   */
  async decideRequest(id: number, dto: DecideTimeOffRequestDto, deciderId: number) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    if (request.status !== 'pending') {
      throw new BadRequestException('Can only decide on pending requests');
    }

    return this.prisma.timeOffRequest.update({
      where: { id },
      data: {
        status: dto.status,
        decided_by: deciderId,
        decided_at: new Date(),
      },
    });
  }

  /**
   * Delete request (admin only)
   */
  async deleteRequest(id: number) {
    const request = await this.prisma.timeOffRequest.findUnique({
      where: { id },
    });

    if (!request) {
      throw new NotFoundException('Time off request not found');
    }

    return this.prisma.timeOffRequest.delete({
      where: { id },
    });
  }

  /**
   * Get employee schedule (who is off on given date range)
   */
  async getSchedule(startDate: Date, endDate: Date) {
    return this.prisma.timeOffRequest.findMany({
      where: {
        status: 'approved',
        OR: [
          {
            start_date: { lte: endDate },
            end_date: { gte: startDate },
          },
        ],
      },
      include: {
        User_TimeOffRequest_user_idToUser: {
          select: {
            first_name: true,
            last_name: true,
          },
        },
      },
      orderBy: { start_date: 'asc' },
    });
  }
}
