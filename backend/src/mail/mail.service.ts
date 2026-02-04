/**
 * Mail Service
 * Handles email sending using multiple providers:
 * - Titan (SMTP) - Custom domain email (primary for production)
 * - Resend - Modern email API with better deliverability
 * - Gmail - Fallback via Nodemailer
 * 
 * Priority: Titan > Resend > Gmail > None
 */

import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import * as nodemailer from 'nodemailer';

export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

type MailProvider = 'titan' | 'resend' | 'gmail' | 'none';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private nodemailerTransporter: nodemailer.Transporter | null = null;
  private titanTransporter: nodemailer.Transporter | null = null;
  private provider: MailProvider;
  private fromEmail: string;
  private gmailFromEmail: string | null = null;

  constructor(private configService: ConfigService) {
    // Titan SMTP Configuration (Custom domain - highest priority)
    const titanEmail = this.configService.get<string>('TITAN_EMAIL');
    const titanPassword = this.configService.get<string>('TITAN_PASSWORD');
    const titanHost = this.configService.get<string>('TITAN_SMTP_HOST') || 'smtp.titan.email';
    const titanPort = parseInt(this.configService.get<string>('TITAN_SMTP_PORT') || '465', 10);

    // Resend Configuration
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    
    // Gmail Configuration (fallback)
    const gmailUser = this.configService.get<string>('MAIL');
    const gmailPassword = this.configService.get<string>('MAIL_APP_PASSWORD');

    // Configure Gmail as fallback if available
    if (gmailUser && gmailPassword) {
      this.nodemailerTransporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: gmailUser,
          pass: gmailPassword,
        },
      });
      this.gmailFromEmail = gmailUser;
    }

    // Configure Resend if available
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
    }

    // Priority: Titan > Resend > Gmail > None
    if (titanEmail && titanPassword) {
      this.titanTransporter = nodemailer.createTransport({
        host: titanHost,
        port: titanPort,
        secure: true, // Port 465 uses implicit TLS
        auth: {
          user: titanEmail,
          pass: titanPassword,
        },
        tls: {
          rejectUnauthorized: true, // Verify certificates
        },
      });
      this.provider = 'titan';
      this.fromEmail = titanEmail;
      this.logger.log(`📧 Mail service configured with Titan SMTP (from: ${this.fromEmail})`);
      this.logger.log(`📧 Using ${titanHost}:${titanPort} with SSL/TLS`);
    } else if (resendApiKey) {
      this.provider = 'resend';
      this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
      this.logger.log(`📧 Mail service configured with Resend (from: ${this.fromEmail})`);
    } else if (gmailUser && gmailPassword) {
      this.provider = 'gmail';
      this.fromEmail = gmailUser;
      this.logger.log(`📧 Mail service configured with Gmail (from: ${this.fromEmail})`);
    } else {
      this.provider = 'none';
      this.fromEmail = 'noreply@vitegourmand.local';
      this.logger.warn('⚠️ Mail service not configured.');
      this.logger.warn('Set TITAN_EMAIL + TITAN_PASSWORD for custom domain (recommended)');
      this.logger.warn('Or RESEND_API_KEY for Resend, or MAIL + MAIL_APP_PASSWORD for Gmail');
    }

    // Log fallback availability
    if (this.provider !== 'gmail' && this.nodemailerTransporter) {
      this.logger.log(`📧 Gmail configured as fallback (from: ${this.gmailFromEmail})`);
    }
  }

  /**
   * Check if mail service is properly configured
   */
  isMailConfigured(): boolean {
    return this.provider !== 'none';
  }

  /**
   * Get current mail provider
   */
  getProvider(): MailProvider {
    return this.provider;
  }

  /**
   * Send an email
   */
  async sendMail(options: MailOptions): Promise<boolean> {
    if (this.provider === 'none') {
      this.logger.warn(`📧 Mail not sent (not configured): ${options.subject} to ${options.to}`);
      this.logger.warn('Email content would be:');
      this.logger.warn(options.text || options.html || '(no content)');
      return false;
    }

    try {
      switch (this.provider) {
        case 'titan':
          return await this.sendWithTitan(options);
        case 'resend':
          return await this.sendWithResend(options);
        case 'gmail':
          return await this.sendWithNodemailer(options);
        default:
          return false;
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error);
      
      // Try Gmail fallback if available
      if (this.provider !== 'gmail' && this.nodemailerTransporter) {
        this.logger.log(`🔄 Primary mail failed, falling back to Gmail...`);
        try {
          return await this.sendWithNodemailer(options);
        } catch (fallbackError) {
          this.logger.error(`❌ Gmail fallback also failed:`, fallbackError);
        }
      }
      
      return false;
    }
  }

  /**
   * Send email using Titan SMTP
   */
  private async sendWithTitan(options: MailOptions): Promise<boolean> {
    const info = await this.titanTransporter!.sendMail({
      from: `"Vite Gourmand" <${this.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    this.logger.log(`✅ Email sent via Titan to: ${options.to}`);
    this.logger.log(`📧 Message ID: ${info.messageId}`);
    return true;
  }

  /**
   * Send email using Resend
   */
  private async sendWithResend(options: MailOptions): Promise<boolean> {
    const emailPayload: {
      from: string;
      to: string;
      subject: string;
      text?: string;
      html?: string;
    } = {
      from: `Vite Gourmand <${this.fromEmail}>`,
      to: options.to,
      subject: options.subject,
    };

    if (options.text) emailPayload.text = options.text;
    if (options.html) emailPayload.html = options.html;

    const { data, error } = await this.resend!.emails.send(emailPayload as any);

    if (error) {
      this.logger.error(`❌ Resend error:`, error);
      throw error; // Will trigger fallback
    }

    this.logger.log(`✅ Email sent via Resend to: ${options.to}`);
    this.logger.log(`📧 Message ID: ${data?.id}`);
    return true;
  }

  /**
   * Send email using Nodemailer (Gmail)
   */
  private async sendWithNodemailer(options: MailOptions): Promise<boolean> {
    const senderEmail = this.gmailFromEmail || this.fromEmail;
    const info = await this.nodemailerTransporter!.sendMail({
      from: `"Vite Gourmand" <${senderEmail}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    });

    this.logger.log(`✅ Email sent via Gmail to: ${options.to}`);
    this.logger.log(`📧 Message ID: ${info.messageId}`);
    return true;
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(to: string, token: string, firstName?: string): Promise<boolean> {
    const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    const resetLink = `${frontendUrl}/test?reset-token=${token}`;

    const subject = '🔐 Réinitialisation de votre mot de passe - Vite Gourmand';
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 20px; }
          .warning { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 6px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Vite Gourmand</h1>
          </div>
          <div class="content">
            <h2>Bonjour${firstName ? ` ${firstName}` : ''} !</h2>
            <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
            <p>Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :</p>
            
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Réinitialiser mon mot de passe</a>
            </p>
            
            <p>Ou copiez ce lien dans votre navigateur :</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px; font-size: 12px;">
              ${resetLink}
            </p>
            
            <div class="warning">
              <strong>⚠️ Ce lien expire dans 1 heure.</strong><br>
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </div>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} Vite Gourmand - Restaurant gastronomique</p>
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
Bonjour${firstName ? ` ${firstName}` : ''} !

Vous avez demandé la réinitialisation de votre mot de passe.

Cliquez sur ce lien pour créer un nouveau mot de passe :
${resetLink}

⚠️ Ce lien expire dans 1 heure.
Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.

© ${new Date().getFullYear()} Vite Gourmand - Restaurant gastronomique
    `;

    return this.sendMail({ to, subject, html, text });
  }
}
