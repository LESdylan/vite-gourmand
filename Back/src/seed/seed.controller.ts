/**
 * Seed Controller - API endpoints for database seeding
 */
import { Controller, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SeedService } from './seed.service';
import { Roles } from '../common';

@ApiTags('Seed')
@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @Post('menus')
  @Roles('admin')
  @ApiOperation({ summary: 'Seed menus with Unsplash images' })
  @ApiResponse({ status: 201, description: 'Menus seeded successfully' })
  async seedMenus() {
    const result = await this.seedService.seedMenusWithImages();
    return {
      success: true,
      message: `Created ${result.created} menus (${result.errors} errors)`,
      ...result,
    };
  }
}
