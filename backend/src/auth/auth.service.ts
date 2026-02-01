import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import {
  LoginDto,
  RegisterDto,
  AuthResponseDto,
  TokenPayload,
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from './dto';
import { MESSAGES } from '../common/constants';
import {
  generateResetToken,
  hashToken,
  calculateExpiryDate,
  isTokenValid,
} from './password-reset.helpers';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly SALT_ROUNDS = 12;

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  /**
   * Register a new user
   */
  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, this.SALT_ROUNDS);

    // Get default role (client)
    let role = await this.prisma.role.findFirst({
      where: { libelle: 'client' },
    });

    // Create default role if it doesn't exist
    if (!role) {
      role = await this.prisma.role.create({
        data: { libelle: 'client' },
      });
    }

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        first_name: dto.firstName,
        telephone_number: dto.telephoneNumber || '',
        city: dto.city || '',
        country: dto.country || 'France',
        postal_address: dto.postalAddress || '',
        roleId: role.id,
      },
      include: { role: true },
    });

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role?.libelle || 'client',
      firstName: user.first_name,
    });

    this.logger.log(`User registered: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        role: user.role?.libelle || 'client',
      },
      ...tokens,
    };
  }

  /**
   * Login user
   */
  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { role: true },
    });

    if (!user) {
      this.logger.warn(`Login failed: user not found - ${dto.email}`);
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      this.logger.warn(`Login failed: invalid credentials - ${dto.email}`);
      throw new UnauthorizedException(MESSAGES.INVALID_CREDENTIALS);
    }

    // Generate tokens
    const tokens = await this.generateTokens({
      id: user.id,
      email: user.email,
      role: user.role?.libelle || 'client',
      firstName: user.first_name,
    });

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        role: user.role?.libelle || 'client',
      },
      ...tokens,
    };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify<TokenPayload>(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.id },
        include: { role: true },
      });

      if (!user) {
        throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
      }

      const accessToken = this.jwtService.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role?.libelle || 'client',
          firstName: user.first_name,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: '15m',
        },
      );

      return { accessToken };
    } catch {
      throw new UnauthorizedException(MESSAGES.UNAUTHORIZED);
    }
  }

  /**
   * Validate user by ID (used by JWT strategy)
   */
  async validateUser(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      role: user.role?.libelle || 'client',
    };
  }

  /**
   * Request password reset - generates token
   */
  async forgotPassword(dto: ForgotPasswordDto): Promise<{ message: string; token?: string }> {
    const user = await this.findUserByEmail(dto.email);

    // Always return success to prevent email enumeration
    if (!user) {
      return this.getPasswordResetSuccessMessage();
    }

    await this.invalidateExistingTokens(user.id);
    const token = await this.createResetToken(user.id);

    this.logger.log(`Password reset requested for: ${dto.email}`);

    // In production, send email instead of returning token
    return this.getPasswordResetSuccessMessage(token);
  }

  /**
   * Reset password using token
   */
  async resetPassword(dto: ResetPasswordDto): Promise<{ message: string }> {
    const tokenRecord = await this.findAndValidateToken(dto.token);
    await this.updateUserPassword(tokenRecord.userId, dto.newPassword);
    await this.markTokenAsUsed(tokenRecord.id);

    this.logger.log(`Password reset completed for user ID: ${tokenRecord.userId}`);

    return { message: 'Password has been reset successfully' };
  }

  /**
   * Change password while logged in
   */
  async changePassword(userId: number, dto: ChangePasswordDto): Promise<{ message: string }> {
    const user = await this.findUserById(userId);
    await this.verifyCurrentPassword(dto.currentPassword, user.password);
    this.ensureNewPasswordIsDifferent(dto.currentPassword, dto.newPassword);
    await this.updateUserPassword(userId, dto.newPassword);

    this.logger.log(`Password changed for user ID: ${userId}`);

    return { message: 'Password changed successfully' };
  }

  // ============================================
  // Password Reset Private Helpers
  // ============================================

  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  private async findUserById(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  private async invalidateExistingTokens(userId: number): Promise<void> {
    await this.prisma.passwordResetToken.updateMany({
      where: { userId, used: false },
      data: { used: true },
    });
  }

  private async createResetToken(userId: number): Promise<string> {
    const plainToken = generateResetToken();
    const hashedToken = hashToken(plainToken);

    await this.prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        userId,
        expiresAt: calculateExpiryDate(),
      },
    });

    return plainToken;
  }

  private getPasswordResetSuccessMessage(token?: string) {
    const message = 'If your email is registered, you will receive a password reset link';
    // In development, return token for testing
    if (process.env.NODE_ENV !== 'production' && token) {
      return { message, token };
    }
    return { message };
  }

  private async findAndValidateToken(plainToken: string) {
    const hashedToken = hashToken(plainToken);

    const tokenRecord = await this.prisma.passwordResetToken.findUnique({
      where: { token: hashedToken },
    });

    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!isTokenValid(tokenRecord)) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    return tokenRecord;
  }

  private async updateUserPassword(userId: number, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  private async markTokenAsUsed(tokenId: number): Promise<void> {
    await this.prisma.passwordResetToken.update({
      where: { id: tokenId },
      data: { used: true },
    });
  }

  private async verifyCurrentPassword(currentPassword: string, storedHash: string): Promise<void> {
    const isValid = await bcrypt.compare(currentPassword, storedHash);
    if (!isValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }
  }

  private ensureNewPasswordIsDifferent(currentPassword: string, newPassword: string): void {
    if (currentPassword === newPassword) {
      throw new BadRequestException('New password must be different from current password');
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(payload: TokenPayload): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}
