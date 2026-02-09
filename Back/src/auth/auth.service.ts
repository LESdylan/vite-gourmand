/**
 * Auth Service
 * Core authentication business logic
 */
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { MailService } from '../mail';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private googleClient: OAuth2Client | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      this.googleClient = new OAuth2Client(clientId);
    }
  }

  async register(dto: RegisterDto) {
    await this.ensureEmailAvailable(dto.email);
    const user = await this.createUser(dto);
    
    // Send welcome email (non-blocking)
    this.sendWelcomeEmail(user.email, user.first_name).catch(err => 
      this.logger.error(`Failed to send welcome email: ${err.message}`)
    );
    
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
    if (user) {
      const token = await this.tokenService.createPasswordResetToken(user.id);
      // Send password reset email (non-blocking)
      this.mailService.sendPasswordReset(user.email, token).catch(err => 
        this.logger.error(`Failed to send reset email: ${err.message}`)
      );
    }
    return { message: 'If email exists, reset link sent' };
  }

  async verifyResetToken(token: string) {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!record) {
      return { valid: false, message: 'Token not found' };
    }
    if (record.used) {
      return { valid: false, message: 'Token has already been used' };
    }
    if (new Date() > record.expires_at) {
      return { valid: false, message: 'Token has expired' };
    }

    return { valid: true, message: 'Token is valid' };
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

  async googleTokenLogin(credential: string) {
    if (!this.googleClient) {
      throw new UnauthorizedException('Google OAuth not configured');
    }

    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken: credential,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return this.googleLogin({
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
      });
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Failed to verify Google token');
    }
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

  private async sendWelcomeEmail(email: string, firstName: string): Promise<void> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    await this.mailService.send({
      to: email,
      subject: 'Bienvenue chez Vite & Gourmand ! 🎉',
      html: this.getWelcomeEmailTemplate(firstName, frontendUrl),
    });
  }

  private getWelcomeEmailTemplate(firstName: string, frontendUrl: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #faf7f5; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: linear-gradient(135deg, #722F37 0%, #8a3a44 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
    .header p { color: #f0d0d4; margin: 10px 0 0; font-size: 14px; }
    .content { padding: 40px 30px; color: #333; }
    .content h2 { color: #722F37; margin: 0 0 20px; }
    .content p { line-height: 1.6; margin: 0 0 16px; }
    .btn { display: inline-block; background: #722F37; color: #ffffff !important; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .btn:hover { background: #5a252c; }
    .features { background: #faf7f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .features ul { margin: 0; padding-left: 20px; }
    .features li { margin: 8px 0; color: #555; }
    .footer { background: #f5f0ed; padding: 20px 30px; text-align: center; font-size: 12px; color: #888; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🍽️ Vite & Gourmand</h1>
      <p>Traiteur d'exception pour vos événements</p>
    </div>
    <div class="content">
      <h2>Bienvenue ${firstName} ! 👋</h2>
      <p>Nous sommes ravis de vous compter parmi nous. Votre compte a été créé avec succès.</p>
      
      <div class="features">
        <p><strong>Avec votre compte, vous pouvez :</strong></p>
        <ul>
          <li>🍴 Découvrir nos menus raffinés</li>
          <li>📅 Réserver pour vos événements</li>
          <li>⭐ Accumuler des points de fidélité</li>
          <li>💬 Contacter notre équipe facilement</li>
        </ul>
      </div>

      <p>Prêt à explorer nos délices culinaires ?</p>
      <a href="${frontendUrl}/menus" class="btn">Découvrir nos menus</a>
      
      <p style="margin-top: 30px; font-size: 14px; color: #666;">
        Si vous avez des questions, n'hésitez pas à nous contacter.<br>
        À très bientôt !
      </p>
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Vite & Gourmand - Tous droits réservés</p>
      <p>Cet email a été envoyé suite à la création de votre compte.</p>
    </div>
  </div>
</body>
</html>`;
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
