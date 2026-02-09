/**
 * Mail Service
 */
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter!: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.initTransporter();
  }

  private initTransporter() {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('MAIL_HOST'),
      port: this.config.get<number>('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.config.get<string>('MAIL_USER'),
        pass: this.config.get<string>('MAIL_APP_PASSWORD'),
      },
    });
  }

  async send(options: MailOptions): Promise<boolean> {
    try {
      await this.transporter.sendMail({
        from: this.config.get<string>('MAIL_FROM', 'noreply@vitegourmand.fr'),
        to: options.to,
        subject: options.subject,
        html: options.html,
      });
      this.logger.log(`Email sent to ${options.to}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email to ${options.to}`, error);
      return false;
    }
  }

  async sendPasswordReset(email: string, token: string): Promise<boolean> {
    const resetUrl = `${this.config.get('FRONTEND_URL')}/reset-password?token=${token}`;
    return this.send({
      to: email,
      subject: 'Reset Your Password - Vite Gourmand',
      html: this.getPasswordResetTemplate(resetUrl),
    });
  }

  async sendOrderConfirmation(
    email: string,
    orderNumber: string,
  ): Promise<boolean> {
    return this.send({
      to: email,
      subject: `Order Confirmed - ${orderNumber}`,
      html: this.getOrderConfirmationTemplate(orderNumber),
    });
  }

  private getPasswordResetTemplate(url: string): string {
    return `
      <h1>Reset Your Password</h1>
      <p>Click the link below to reset your password:</p>
      <a href="${url}">${url}</a>
      <p>This link expires in 1 hour.</p>
    `;
  }

  private getOrderConfirmationTemplate(orderNumber: string): string {
    return `
      <h1>Order Confirmed!</h1>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <p>Thank you for choosing Vite Gourmand!</p>
    `;
  }
}
