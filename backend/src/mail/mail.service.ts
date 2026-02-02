/**
 * Mail Service
 * Handles email sending using Resend (primary) or Nodemailer/Gmail (fallback)
 * 
 * Resend: Modern email API with better deliverability
 * - Free tier: 3,000 emails/month
 * - Built-in email authentication (SPF, DKIM, DMARC)
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

type MailProvider = 'resend' | 'gmail' | 'none';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend | null = null;
  private nodemailerTransporter: nodemailer.Transporter | null = null;
  private provider: MailProvider;
  private fromEmail: string;
  private gmailFromEmail: string | null = null;

  constructor(private configService: ConfigService) {
    const resendApiKey = this.configService.get<string>('RESEND_API_KEY');
    const gmailUser = this.configService.get<string>('MAIL');
    const gmailPassword = this.configService.get<string>('MAIL_APP_PASSWORD');

    // Always configure Gmail as fallback if available
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

    // Priority: Resend > Gmail > None
    if (resendApiKey) {
      this.resend = new Resend(resendApiKey);
      this.provider = 'resend';
      // Resend free tier requires using onboarding@resend.dev or your verified domain
      this.fromEmail = this.configService.get<string>('RESEND_FROM_EMAIL') || 'onboarding@resend.dev';
      this.logger.log(`📧 Mail service configured with Resend (from: ${this.fromEmail})`);
      if (this.nodemailerTransporter) {
        this.logger.log(`📧 Gmail configured as fallback (from: ${this.gmailFromEmail})`);
      }
    } else if (gmailUser && gmailPassword) {
      this.provider = 'gmail';
      this.fromEmail = gmailUser;
      this.logger.log(`📧 Mail service configured with Gmail (from: ${this.fromEmail})`);
    } else {
      this.provider = 'none';
      this.fromEmail = 'noreply@vitegourmand.local';
      this.logger.warn('⚠️ Mail service not configured.');
      this.logger.warn('Set RESEND_API_KEY for Resend (recommended) or MAIL + MAIL_APP_PASSWORD for Gmail');
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
      if (this.provider === 'resend') {
        return await this.sendWithResend(options);
      } else {
        return await this.sendWithNodemailer(options);
      }
    } catch (error) {
      this.logger.error(`❌ Failed to send email to ${options.to}:`, error);
      return false;
    }
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
      
      // If Resend fails with domain validation error (403), fall back to Gmail
      const resendError = error as any;
      if (resendError.statusCode === 403 && this.nodemailerTransporter) {
        this.logger.log(`🔄 Resend requires domain verification, falling back to Gmail...`);
        return await this.sendWithNodemailer(options);
      }
      
      return false;
    }

    this.logger.log(`✅ Email sent via Resend to: ${options.to}`);
    this.logger.log(`📧 Message ID: ${data?.id}`);
    return true;
  }

  /**
   * Send email using Nodemailer (Gmail)
   */
  private async sendWithNodemailer(options: MailOptions): Promise<boolean> {
    // Use gmailFromEmail when it's a fallback from Resend
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
    this.logger.log(`📧 Response: ${info.response}`);
    this.logger.log(`📧 Accepted: ${JSON.stringify(info.accepted)}`);
    this.logger.log(`📧 Rejected: ${JSON.stringify(info.rejected)}`);
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
