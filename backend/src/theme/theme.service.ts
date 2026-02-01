/**
 * Theme Service
 * =============
 * Business logic for menu themes
 */

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ThemeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Get all themes
   */
  async findAll() {
    const themes = await this.prisma.theme.findMany({
      include: { _count: { select: { menus: true } } },
    });

    return themes.map((t) => ({
      id: t.id,
      name: t.libelle,
      menuCount: t._count.menus,
    }));
  }

  /**
   * Create new theme (admin)
   */
  async create(name: string) {
    const theme = await this.prisma.theme.create({
      data: { libelle: name },
    });

    return { id: theme.id, name: theme.libelle };
  }

  /**
   * Update theme (admin)
   */
  async update(id: number, name: string) {
    await this.ensureExists(id);

    const theme = await this.prisma.theme.update({
      where: { id },
      data: { libelle: name },
    });

    return { id: theme.id, name: theme.libelle };
  }

  /**
   * Delete theme (admin)
   */
  async remove(id: number) {
    await this.ensureExists(id);
    await this.prisma.theme.delete({ where: { id } });
    return { message: 'Theme deleted successfully' };
  }

  private async ensureExists(id: number): Promise<void> {
    const exists = await this.prisma.theme.findUnique({ where: { id } });
    if (!exists) {
      throw new NotFoundException(`Theme with ID ${id} not found`);
    }
  }
}
