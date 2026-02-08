#!/usr/bin/env npx ts-node
/**
 * Interactive Shell for Testing - Vite Gourmand
 * 
 * This shell connects to the real database and allows manual testing
 * of all authentication and validation features.
 * 
 * All users created during a session are automatically cleaned up on exit.
 * 
 * Usage: npx ts-node test/cli_test/interactive.ts
 */

import 'dotenv/config';
import * as readline from 'readline';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { EmailValidator, PhoneValidator, CreditCardValidator, PasswordValidator } from './validators';

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

interface CreatedUser {
  id: number;
  email: string;
  createdAt: Date;
}

interface SessionState {
  createdUsers: CreatedUser[];
  currentUser: CreatedUser | null;
  isRunning: boolean;
}

// ═══════════════════════════════════════════════════════════════
// Console Colors & Formatting
// ═══════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
};

const log = {
  success: (msg: string) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg: string) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  warn: (msg: string) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  info: (msg: string) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  header: (msg: string) => console.log(`\n${colors.bold}${colors.cyan}═══ ${msg} ═══${colors.reset}\n`),
};

// ═══════════════════════════════════════════════════════════════
// Interactive Shell Class
// ═══════════════════════════════════════════════════════════════

class InteractiveShell {
  private prisma: PrismaClient;
  private pool: Pool;
  private rl: readline.Interface;
  private state: SessionState;
  private readonly SALT_ROUNDS = 12;

  constructor() {
    const connectionString = process.env.DATABASE_URL || '';
    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.prisma = new PrismaClient({ adapter });
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.state = {
      createdUsers: [],
      currentUser: null,
      isRunning: true,
    };
  }

  // ─────────────────────────────────────────────────────────────
  // Input Helpers
  // ─────────────────────────────────────────────────────────────

  private async prompt(question: string): Promise<string> {
    return new Promise((resolve) => {
      this.rl.question(`${colors.cyan}${question}${colors.reset} `, resolve);
    });
  }

  private async promptPassword(question: string): Promise<string> {
    return new Promise((resolve) => {
      const stdin = process.stdin;
      const wasRaw = stdin.isRaw;
      
      process.stdout.write(`${colors.cyan}${question}${colors.reset} `);
      
      let password = '';
      stdin.setRawMode(true);
      stdin.resume();
      stdin.setEncoding('utf8');
      
      const onData = (char: string) => {
        if (char === '\r' || char === '\n') {
          stdin.removeListener('data', onData);
          stdin.setRawMode(wasRaw || false);
          console.log();
          resolve(password);
        } else if (char === '\u0003') {
          // Ctrl+C
          process.exit();
        } else if (char === '\u007F' || char === '\b') {
          // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
        } else {
          password += char;
          process.stdout.write('*');
        }
      };
      
      stdin.on('data', onData);
    });
  }

  private async promptConfirm(question: string): Promise<boolean> {
    const answer = await this.prompt(`${question} (o/n)`);
    return answer.toLowerCase().startsWith('o') || answer.toLowerCase() === 'y';
  }

  // ─────────────────────────────────────────────────────────────
  // Menu Display
  // ─────────────────────────────────────────────────────────────

  private displayMenu(): void {
    console.log(`
${colors.bold}╔═══════════════════════════════════════════════════════════════╗
║        🧪 Vite Gourmand - Shell de Test Interactif            ║
╚═══════════════════════════════════════════════════════════════╝${colors.reset}
`);
    
    console.log(`  ${colors.yellow}[1]${colors.reset} 📝 Inscription (register)`);
    console.log(`  ${colors.yellow}[2]${colors.reset} 🔐 Connexion (login)`);
    console.log(`  ${colors.yellow}[3]${colors.reset} 🔑 Connexion Google (oauth)`);
    console.log(`  ${colors.yellow}[4]${colors.reset} 🔄 Reset mot de passe (reset)`);
    console.log(`  ${colors.yellow}[5]${colors.reset} 💳 Valider carte bancaire (card)`);
    console.log(`  ${colors.yellow}[6]${colors.reset} 📧 Valider email (email)`);
    console.log(`  ${colors.yellow}[7]${colors.reset} 🔒 Tester force mot de passe (password)`);
    console.log(`  ${colors.yellow}[8]${colors.reset} 📋 Voir utilisateurs créés (users)`);
    console.log(`  ${colors.yellow}[9]${colors.reset} 🧹 Nettoyer les utilisateurs (clean)`);
    console.log(`  ${colors.yellow}[0]${colors.reset} ❌ Quitter (exit)`);
    console.log();
    
    if (this.state.currentUser) {
      console.log(`${colors.dim}Connecté en tant que: ${this.state.currentUser.email}${colors.reset}\n`);
    }
    if (this.state.createdUsers.length > 0) {
      console.log(`${colors.dim}Utilisateurs de test: ${this.state.createdUsers.length}${colors.reset}\n`);
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Commands Implementation
  // ─────────────────────────────────────────────────────────────

  private async handleRegister(): Promise<void> {
    log.header('📝 Inscription d\'un nouveau compte');

    // Collect data
    const email = await this.prompt('Email:');
    
    // Validate email first
    const emailValidation = EmailValidator.validate(email);
    if (!emailValidation.isValid) {
      log.error(`Email invalide: ${emailValidation.errors.join(', ')}`);
      const suggestion = EmailValidator.suggestCorrection(email);
      if (suggestion && suggestion !== email) {
        log.info(`Suggestion: ${suggestion}`);
      }
      return;
    }

    // Check if email exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      log.error('Cet email est déjà enregistré');
      return;
    }

    const password = await this.promptPassword('Mot de passe:');
    
    // Validate password
    const pwdValidation = PasswordValidator.validate(password);
    if (!pwdValidation.isValid) {
      log.error('Mot de passe trop faible');
      console.log(`  Force: ${this.getStrengthBadge(pwdValidation.strength)} (score: ${pwdValidation.score}/5)`);
      if (pwdValidation.suggestions.length > 0) {
        console.log('  Suggestions:');
        pwdValidation.suggestions.forEach(s => console.log(`    - ${s}`));
      }
      return;
    }

    const firstName = await this.prompt('Prénom:');
    const phone = await this.prompt('Téléphone (ex: +33612345678):');
    
    // Validate phone
    const phoneValidation = PhoneValidator.validate(phone, { country: 'FR' });
    if (!phoneValidation.isValid) {
      log.warn(`Téléphone invalide: ${phoneValidation.errors.join(', ')}`);
      log.info('Continuation avec le téléphone tel quel...');
    }

    const city = await this.prompt('Ville:');
    const postalAddress = await this.prompt('Code postal:');
    const country = await this.prompt('Pays (défaut: France):') || 'France';

    try {
      // Get or create client role
      let role = await this.prisma.role.findFirst({
        where: { libelle: 'client' },
      });
      if (!role) {
        role = await this.prisma.role.create({
          data: { libelle: 'client' },
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, this.SALT_ROUNDS);

      // Create user
      const user = await this.prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          first_name: firstName,
          telephone_number: phoneValidation.normalized || phone,
          city,
          country,
          postal_address: postalAddress,
          roleId: role.id,
          gdprConsent: true,
          gdprConsentDate: new Date(),
        },
        include: { role: true },
      });

      // Track created user
      this.state.createdUsers.push({
        id: user.id,
        email: user.email,
        createdAt: new Date(),
      });

      log.success('Inscription réussie !');
      console.log(`  ${colors.dim}ID:${colors.reset} ${user.id}`);
      console.log(`  ${colors.dim}Email:${colors.reset} ${user.email}`);
      console.log(`  ${colors.dim}Rôle:${colors.reset} ${user.role?.libelle || 'client'}`);

    } catch (error: any) {
      log.error(`Erreur lors de l'inscription: ${error.message}`);
    }
  }

  private async handleLogin(): Promise<void> {
    log.header('🔐 Connexion');

    const email = await this.prompt('Email:');
    const password = await this.promptPassword('Mot de passe:');

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        include: { role: true },
      });

      if (!user) {
        log.error('Utilisateur non trouvé');
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        log.error('Mot de passe incorrect');
        return;
      }

      // Set current user
      this.state.currentUser = {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      };

      log.success('Connexion réussie !');
      console.log(`  ${colors.dim}ID:${colors.reset} ${user.id}`);
      console.log(`  ${colors.dim}Nom:${colors.reset} ${user.first_name}`);
      console.log(`  ${colors.dim}Rôle:${colors.reset} ${user.role?.libelle || 'client'}`);

      // Generate mock JWT
      const mockPayload = {
        id: user.id,
        email: user.email,
        role: user.role?.libelle || 'client',
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 3600,
      };
      console.log(`  ${colors.dim}Token payload:${colors.reset}`);
      console.log(`    ${JSON.stringify(mockPayload, null, 2).split('\n').join('\n    ')}`);

    } catch (error: any) {
      log.error(`Erreur lors de la connexion: ${error.message}`);
    }
  }

  private async handleGoogleOAuth(): Promise<void> {
    log.header('🔑 Simulation Google OAuth');

    log.info('Simulation d\'une réponse Google OAuth...\n');

    const mockGoogleProfile = {
      id: crypto.randomBytes(16).toString('hex'),
      email: `google.user.${Date.now()}@gmail.com`,
      name: 'Jean Test',
      given_name: 'Jean',
      family_name: 'Test',
      picture: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      verified_email: true,
    };

    console.log(`  ${colors.dim}Profil Google simulé:${colors.reset}`);
    console.log(`    ${JSON.stringify(mockGoogleProfile, null, 2).split('\n').join('\n    ')}`);
    console.log();

    const confirm = await this.promptConfirm('Créer cet utilisateur dans la DB ?');
    
    if (confirm) {
      try {
        // Get or create client role
        let role = await this.prisma.role.findFirst({
          where: { libelle: 'client' },
        });
        if (!role) {
          role = await this.prisma.role.create({
            data: { libelle: 'client' },
          });
        }

        // Create user with random password (OAuth users don't use password)
        const randomPassword = crypto.randomBytes(32).toString('hex');
        const hashedPassword = await bcrypt.hash(randomPassword, this.SALT_ROUNDS);

        const user = await this.prisma.user.create({
          data: {
            email: mockGoogleProfile.email,
            password: hashedPassword,
            first_name: mockGoogleProfile.given_name,
            telephone_number: '',
            city: '',
            country: 'France',
            postal_address: '',
            roleId: role.id,
            gdprConsent: true,
            gdprConsentDate: new Date(),
          },
          include: { role: true },
        });

        // Track created user
        this.state.createdUsers.push({
          id: user.id,
          email: user.email,
          createdAt: new Date(),
        });

        this.state.currentUser = {
          id: user.id,
          email: user.email,
          createdAt: new Date(),
        };

        log.success('Utilisateur Google créé !');
        console.log(`  ${colors.dim}ID:${colors.reset} ${user.id}`);
        console.log(`  ${colors.dim}Email:${colors.reset} ${user.email}`);

      } catch (error: any) {
        log.error(`Erreur: ${error.message}`);
      }
    }
  }

  private async handlePasswordReset(): Promise<void> {
    log.header('🔄 Reset du mot de passe');

    const email = await this.prompt('Email de l\'utilisateur:');

    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        log.error('Utilisateur non trouvé');
        return;
      }

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour

      // Store token
      await this.prisma.passwordResetToken.create({
        data: {
          token: hashedToken,
          userId: user.id,
          expiresAt,
        },
      });

      log.success('Token de reset généré !');
      console.log(`  ${colors.dim}Token (non hashé):${colors.reset} ${token}`);
      console.log(`  ${colors.dim}Token (hashé SHA256):${colors.reset} ${hashedToken}`);
      console.log(`  ${colors.dim}Expire à:${colors.reset} ${expiresAt.toISOString()}`);
      console.log();
      log.info(`Lien simulé: https://vite-gourmand.fr/reset-password?token=${token}`);
      console.log();

      // Ask if user wants to complete the reset
      const confirm = await this.promptConfirm('Compléter le reset maintenant ?');
      
      if (confirm) {
        const newPassword = await this.promptPassword('Nouveau mot de passe:');
        
        // Validate new password
        const pwdValidation = PasswordValidator.validate(newPassword);
        if (!pwdValidation.isValid) {
          log.error('Mot de passe trop faible');
          return;
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, this.SALT_ROUNDS);
        await this.prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });

        // Delete used token
        await this.prisma.passwordResetToken.deleteMany({
          where: { userId: user.id },
        });

        log.success('Mot de passe réinitialisé !');
      }

    } catch (error: any) {
      log.error(`Erreur: ${error.message}`);
    }
  }

  private async handleCreditCardValidation(): Promise<void> {
    log.header('💳 Validation de carte bancaire');

    const cardNumber = await this.prompt('Numéro de carte (espaces acceptés):');

    const result = CreditCardValidator.validate(cardNumber);

    if (result.isValid) {
      log.success('Carte valide !');
      console.log(`  ${colors.dim}Type:${colors.reset} ${result.cardType}`);
      console.log(`  ${colors.dim}Émetteur:${colors.reset} ${result.issuer}`);
      console.log(`  ${colors.dim}Numéro normalisé:${colors.reset} ${result.normalized}`);
      console.log(`  ${colors.dim}Chiffre de contrôle:${colors.reset} ${result.checkDigit}`);
      console.log(`  ${colors.dim}Format affichage:${colors.reset} ${CreditCardValidator.format(cardNumber)}`);
      console.log(`  ${colors.dim}Format masqué:${colors.reset} ${CreditCardValidator.mask(cardNumber)}`);
    } else {
      log.error('Carte invalide');
      result.errors.forEach(e => console.log(`  - ${e}`));
    }

    console.log();
    log.info('Cartes de test valides (Luhn):');
    console.log('  Visa:       4111 1111 1111 1111');
    console.log('  Mastercard: 5555 5555 5555 4444');
    console.log('  AmEx:       3782 822463 10005');
  }

  private async handleEmailValidation(): Promise<void> {
    log.header('📧 Validation d\'email');

    const email = await this.prompt('Email à valider:');

    const result = EmailValidator.validate(email);

    if (result.isValid) {
      log.success('Email valide !');
      console.log(`  ${colors.dim}Normalisé:${colors.reset} ${result.normalized}`);
      if (result.parts) {
        console.log(`  ${colors.dim}Local:${colors.reset} ${result.parts.local}`);
        console.log(`  ${colors.dim}Domaine:${colors.reset} ${result.parts.domain}`);
        console.log(`  ${colors.dim}TLD:${colors.reset} ${result.parts.tld}`);
      }
    } else {
      log.error('Email invalide');
      result.errors.forEach(e => console.log(`  - ${e}`));
      const suggestion = EmailValidator.suggestCorrection(email);
      if (suggestion && suggestion !== email) {
        log.info(`Suggestion: ${suggestion}`);
      }
    }

    // Check if email exists in DB
    console.log();
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      log.info(`Email trouvé en base (ID: ${existingUser.id})`);
    } else {
      log.info('Email non trouvé en base');
    }
  }

  private async handlePasswordStrength(): Promise<void> {
    log.header('🔒 Test de force du mot de passe');

    const password = await this.promptPassword('Mot de passe à tester:');

    const result = PasswordValidator.validate(password);

    console.log(`  Force: ${this.getStrengthBadge(result.strength)}`);
    console.log(`  ${colors.dim}Score:${colors.reset} ${result.score}/5`);
    console.log(`  ${colors.dim}Entropie:${colors.reset} ${result.entropy.toFixed(1)} bits`);
    console.log();
    
    console.log(`  ${colors.dim}Temps de crack:${colors.reset}`);
    console.log(`    Online (1k/s):   ${result.crackTime.online}`);
    console.log(`    Offline slow:    ${result.crackTime.offlineSlow}`);
    console.log(`    Offline fast:    ${result.crackTime.offlineFast}`);
    console.log();
    
    console.log(`  ${colors.dim}Critères:${colors.reset}`);
    Object.entries(result.criteria).forEach(([key, value]) => {
      const icon = value ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(`    ${icon} ${key}`);
    });

    if (result.suggestions.length > 0) {
      console.log();
      log.info('Suggestions:');
      result.suggestions.forEach(s => console.log(`    - ${s}`));
    }

    // Offer to generate secure password
    console.log();
    const generate = await this.promptConfirm('Générer un mot de passe sécurisé ?');
    if (generate) {
      const generated = PasswordValidator.generate(16);
      log.success(`Mot de passe généré: ${generated}`);
      const genResult = PasswordValidator.validate(generated);
      console.log(`  Entropie: ${genResult.entropy.toFixed(1)} bits`);
    }
  }

  private async handleListUsers(): Promise<void> {
    log.header('📋 Utilisateurs créés dans cette session');

    if (this.state.createdUsers.length === 0) {
      log.info('Aucun utilisateur créé dans cette session');
      return;
    }

    console.log(`  ${colors.dim}ID${colors.reset.padEnd(10)}${colors.dim}Email${colors.reset.padEnd(40)}${colors.dim}Créé à${colors.reset}`);
    console.log(`  ${'─'.repeat(60)}`);
    
    for (const user of this.state.createdUsers) {
      console.log(`  ${String(user.id).padEnd(10)}${user.email.padEnd(40)}${user.createdAt.toLocaleTimeString()}`);
    }

    // Also show total users in DB
    console.log();
    const totalUsers = await this.prisma.user.count();
    log.info(`Total utilisateurs en base: ${totalUsers}`);
  }

  private async handleCleanup(): Promise<void> {
    log.header('🧹 Nettoyage des utilisateurs de test');

    if (this.state.createdUsers.length === 0) {
      log.info('Aucun utilisateur à nettoyer');
      return;
    }

    const confirm = await this.promptConfirm(
      `Supprimer ${this.state.createdUsers.length} utilisateur(s) de test ?`
    );

    if (confirm) {
      await this.cleanupUsers();
    }
  }

  private async cleanupUsers(): Promise<void> {
    for (const user of this.state.createdUsers) {
      try {
        // Delete password reset tokens first
        await this.prisma.passwordResetToken.deleteMany({
          where: { userId: user.id },
        });
        
        // Delete user
        await this.prisma.user.delete({
          where: { id: user.id },
        });
        
        log.success(`Supprimé: ${user.email} (ID: ${user.id})`);
      } catch (error: any) {
        log.error(`Impossible de supprimer ${user.email}: ${error.message}`);
      }
    }
    
    this.state.createdUsers = [];
    this.state.currentUser = null;
  }

  // ─────────────────────────────────────────────────────────────
  // Utility Methods
  // ─────────────────────────────────────────────────────────────

  private getStrengthBadge(strength: string): string {
    switch (strength) {
      case 'very_weak':
        return `${colors.bgRed}${colors.white} TRÈS FAIBLE ${colors.reset}`;
      case 'weak':
        return `${colors.red} FAIBLE ${colors.reset}`;
      case 'fair':
        return `${colors.yellow} MOYEN ${colors.reset}`;
      case 'strong':
        return `${colors.green} FORT ${colors.reset}`;
      case 'very_strong':
        return `${colors.bgGreen}${colors.white} TRÈS FORT ${colors.reset}`;
      default:
        return strength;
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Main Loop
  // ─────────────────────────────────────────────────────────────

  async run(): Promise<void> {
    console.clear();
    
    // Test database connection
    try {
      await this.prisma.$connect();
      log.success('Connexion à la base de données établie\n');
    } catch (error: any) {
      log.error(`Impossible de se connecter à la base de données: ${error.message}`);
      log.info('Assurez-vous que Docker est démarré: docker compose up -d');
      process.exit(1);
    }

    while (this.state.isRunning) {
      this.displayMenu();
      
      const input = await this.prompt('>');
      const command = input.trim().toLowerCase();

      console.log();

      switch (command) {
        case '1':
        case 'register':
          await this.handleRegister();
          break;
        
        case '2':
        case 'login':
          await this.handleLogin();
          break;
        
        case '3':
        case 'oauth':
        case 'google':
          await this.handleGoogleOAuth();
          break;
        
        case '4':
        case 'reset':
          await this.handlePasswordReset();
          break;
        
        case '5':
        case 'card':
          await this.handleCreditCardValidation();
          break;
        
        case '6':
        case 'email':
          await this.handleEmailValidation();
          break;
        
        case '7':
        case 'password':
          await this.handlePasswordStrength();
          break;
        
        case '8':
        case 'users':
          await this.handleListUsers();
          break;
        
        case '9':
        case 'clean':
          await this.handleCleanup();
          break;
        
        case '0':
        case 'exit':
        case 'quit':
        case 'q':
          this.state.isRunning = false;
          break;
        
        case 'help':
        case '?':
          // Just show menu again
          break;
        
        case 'clear':
        case 'cls':
          console.clear();
          break;
        
        default:
          if (command) {
            log.warn(`Commande inconnue: ${command}`);
          }
      }

      console.log();
    }

    // Cleanup on exit
    if (this.state.createdUsers.length > 0) {
      console.log();
      log.header('🧹 Nettoyage des utilisateurs de test');
      await this.cleanupUsers();
    }

    console.log(`\n${colors.cyan}👋 Au revoir !${colors.reset}\n`);
    
    await this.prisma.$disconnect();
    await this.pool.end();
    this.rl.close();
  }
}

// ═══════════════════════════════════════════════════════════════
// Entry Point
// ═══════════════════════════════════════════════════════════════

async function main() {
  const shell = new InteractiveShell();
  
  // Handle Ctrl+C gracefully
  process.on('SIGINT', async () => {
    console.log('\n');
    process.exit(0);
  });

  await shell.run();
}

main().catch(console.error);
