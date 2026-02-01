import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto, RegisterDto, AuthResponseDto, TokenPayload } from './dto';
import { MESSAGES } from '../common/constants';

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
