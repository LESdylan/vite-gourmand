import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  AuthResponseDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { Public, CurrentUser } from '../common';
import type { UserPayload } from '../common/decorators/current-user.decorator';
import { GoogleOAuthGuard } from './guards/google-oauth.guard';

interface GoogleUser {
  email: string;
  firstName: string;
  lastName?: string;
  googleId: string;
}

interface GoogleTokenDto {
  credential: string;
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * POST /auth/register
   * Register a new user
   */
  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  /**
   * POST /auth/login
   * Login with email and password
   */
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  /**
   * POST /auth/refresh
   * Refresh access token using refresh token
   */
  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() dto: RefreshTokenDto): Promise<{ accessToken: string }> {
    return this.authService.refreshToken(dto.refreshToken);
  }

  /**
   * POST /auth/forgot-password
   * Request password reset email
   */
  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  /**
   * POST /auth/reset-password
   * Reset password using token
   */
  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  /**
   * PUT /auth/change-password
   * Change password while logged in
   */
  @Put('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser() user: UserPayload,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  /**
   * GET /auth/me
   * Get current user profile
   */
  @Get('me')
  async getMe(@CurrentUser() user: UserPayload) {
    return user;
  }

  /**
   * GET /auth/google/config
   * Get Google OAuth client ID for frontend
   * This allows frontend to use Google Identity Services without hardcoding the client ID
   */
  @Public()
  @Get('google/config')
  getGoogleConfig() {
    const clientId = this.authService.getGoogleClientId();
    return { clientId };
  }

  /**
   * POST /auth/google/token
   * Verify Google ID token from Google Identity Services and login/register user
   * This is used by the frontend when using Google's popup-based authentication
   */
  @Public()
  @Post('google/token')
  @HttpCode(HttpStatus.OK)
  async googleTokenLogin(@Body() dto: GoogleTokenDto): Promise<AuthResponseDto> {
    return this.authService.verifyGoogleToken(dto.credential);
  }

  /**
   * GET /auth/google
   * Initiate Google OAuth flow (legacy redirect-based flow)
   */
  @Public()
  @Get('google')
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {
    // Guard redirects to Google
  }

  /**
   * GET /auth/google/callback
   * Handle Google OAuth callback
   */
  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOAuthGuard)
  async googleAuthCallback(
    @Req() req: Request & { user: GoogleUser },
    @Res() res: Response,
  ) {
    const authResponse = await this.authService.googleLogin(req.user);
    
    // Redirect to frontend with tokens in URL params
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const params = new URLSearchParams({
      accessToken: authResponse.accessToken,
      refreshToken: authResponse.refreshToken,
      userId: authResponse.user.id.toString(),
      email: authResponse.user.email,
      firstName: authResponse.user.firstName,
      role: authResponse.user.role,
    });
    
    res.redirect(`${frontendUrl}/auth/callback?${params.toString()}`);
  }
}
