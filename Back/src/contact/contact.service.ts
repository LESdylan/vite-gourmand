/**
 * Contact Service
 */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma';
import { CreateContactMessageDto } from './dto/contact.dto';

@Injectable()
export class ContactService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(options?: { limit?: number; offset?: number }) {
    return this.prisma.contactMessage.findMany({
      orderBy: { created_at: 'desc' },
      take: options?.limit || 50,
      skip: options?.offset || 0,
    });
  }

  async findById(id: number) {
    const message = await this.prisma.contactMessage.findUnique({ where: { id } });
    if (!message) throw new NotFoundException('Contact message not found');
    return message;
  }

  async create(dto: CreateContactMessageDto) {
    return this.prisma.contactMessage.create({
      data: {
        title: dto.title,
        description: dto.description,
        email: dto.email,
      },
    });
  }

  async delete(id: number) {
    await this.findById(id);
    await this.prisma.contactMessage.delete({ where: { id } });
    return { message: 'Contact message deleted successfully' };
  }

  async count() {
    return this.prisma.contactMessage.count();
  }
}
