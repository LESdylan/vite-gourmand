/**
 * Auth Service
 * Core authentication business logic
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
  ) {}

  async register(dto: RegisterDto) {
    await this.ensureEmailAvailable(dto.email);
    const user = await this.createUser(dto);
    return this.generateAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.validateCredentials(dto.email, dto.password);
    await this.updateLastLogin(user.id);
    return this.generateAuthResponse(user);
  }

  async getProfile(userId: number) {
    const user = await this.findUserById(userId);
    return this.sanitizeUser(user);
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user) await this.tokenService.createPasswordResetToken(user.id);
    return { message: 'If email exists, reset link sent' };
  }

  async resetPassword(token: string, newPassword: string) {
    const userId = await this.tokenService.validatePasswordResetToken(token);
    const hash = await this.passwordService.hash(newPassword);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { message: 'Password reset successful' };
  }

  async changePassword(userId: number, current: string, newPass: string) {
    const user = await this.findUserById(userId);
    await this.passwordService.verify(current, user.password);
    const hash = await this.passwordService.hash(newPass);
    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hash },
    });
    return { message: 'Password changed successfully' };
  }

  async googleLogin(profile: { email: string; name: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: profile.email },
      include: { Role: true },
    });
    if (!user) user = await this.createOAuthUser(profile);
    return this.generateAuthResponse(user);
  }

  private async ensureEmailAvailable(email: string): Promise<void> {
    const exists = await this.prisma.user.findUnique({ where: { email } });
    if (exists) throw new ConflictException('Email already registered');
  }

  private async createUser(dto: RegisterDto) {
    const hash = await this.passwordService.hash(dto.password);
    return this.prisma.user.create({
      data: { email: dto.email, password: hash, first_name: dto.firstName },
      include: { Role: true },
    });
  }

  private async createOAuthUser(profile: { email: string; name: string }) {
    return this.prisma.user.create({
      data: { email: profile.email, password: '', first_name: profile.name },
      include: { Role: true },
    });
  }

  private async validateCredentials(email: string, pass: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { Role: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    await this.passwordService.verify(pass, user.password);
    return user;
  }

  private async findUserById(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { Role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private async updateLastLogin(userId: number): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { last_login_at: new Date() },
    });
  }

  private generateAuthResponse(user: {
    id: number;
    email: string;
    first_name: string;
    Role: { name: string } | null;
  }) {
    const token = this.tokenService.generateAccessToken({
      sub: user.id,
      email: user.email,
      role: user.Role?.name ?? 'client',
    });
    return { accessToken: token, user: this.sanitizeUser(user) };
  }

  private sanitizeUser(user: {
    id: number;
    email: string;
    first_name: string;
    last_name?: string | null;
    Role?: { name: string } | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.Role?.name ?? 'client',
    };
  }
}
