/**
 * User Controller
 * ===============
 * REST API endpoints for user profile operations
 */

import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Post,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto';
import { CurrentUser } from '../common';
import type { UserPayload } from '../common/decorators/current-user.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * GET /api/users/me - Get current user profile
   */
  @Get('me')
  getProfile(@CurrentUser() user: UserPayload) {
    return this.userService.findOne(user.id);
  }

  /**
   * PUT /api/users/me - Update current user profile
   */
  @Put('me')
  updateProfile(
    @CurrentUser() user: UserPayload,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.userService.update(user.id, dto);
  }

  /**
   * DELETE /api/users/me - Delete current user account (RGPD)
   */
  @Delete('me')
  deleteAccount(@CurrentUser() user: UserPayload) {
    return this.userService.remove(user.id);
  }

  /**
   * POST /api/users/me/gdpr-consent - Update GDPR consent
   */
  @Post('me/gdpr-consent')
  updateGdprConsent(
    @CurrentUser() user: UserPayload,
    @Body() body: { consent: boolean; marketing: boolean },
  ) {
    return this.userService.updateGdprConsent(
      user.id,
      body.consent,
      body.marketing,
    );
  }

  /**
   * GET /api/users/me/export - Export user data (RGPD)
   */
  @Get('me/export')
  exportData(@CurrentUser() user: UserPayload) {
    return this.userService.exportData(user.id);
  }
}
