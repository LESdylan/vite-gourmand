/**
 * Test data generators and fixtures
 * Provides valid and invalid test data for all validators
 */

export const TestData = {
  emails: {
    valid: [
      'user@example.com',
      'user.name@example.com',
      'user+tag@example.org',
      'user_name@example.co.uk',
      'user123@test-domain.com',
      'a@b.co',
      'user@subdomain.example.com',
      'firstname.lastname@company.fr',
      'admin@vitegourmand.fr',
      'test.user+label@gmail.com',
    ],
    invalid: [
      'plainaddress',
      '@missinglocal.com',
      'missing@.com',
      'missing@domain.',
      'spaces in@email.com',
      'missing.at.sign.com',
      'two@@at.com',
      '.startswithdot@email.com',
      'endswith.@email.com',
      'has space@email.com',
      'has"quote@email.com',
      '',
      'a@',
      '@b',
      'user@',
      '@domain.com',
      'user@.domain.com',
      'user@domain..com',
    ],
  },

  phones: {
    valid: [
      '+33612345678',
      '+33 6 12 34 56 78',
      '+1 555 123 4567',
      '+44 20 7946 0958',
      '0612345678', // French format
      '06 12 34 56 78',
      '+33612345678',
      '+49 30 12345678',
      '+81 3 1234 5678',
    ],
    invalid: [
      '12345',
      'phone',
      '+',
      '++33612345678',
      '0000000000',
      'abcdefghij',
      '',
      '123',
      '+1',
      '06 12 34',
    ],
  },

  creditCards: {
    valid: [
      // Visa
      { number: '4111111111111111', type: 'Visa' },
      { number: '4012888888881881', type: 'Visa' },
      { number: '4222222222222', type: 'Visa' },
      // Mastercard
      { number: '5555555555554444', type: 'Mastercard' },
      { number: '5105105105105100', type: 'Mastercard' },
      // American Express
      { number: '378282246310005', type: 'AmEx' },
      { number: '371449635398431', type: 'AmEx' },
      // Discover
      { number: '6011111111111117', type: 'Discover' },
      { number: '6011000990139424', type: 'Discover' },
    ],
    invalid: [
      { number: '4111111111111112', reason: 'Invalid Luhn checksum' },
      { number: '1234567890123456', reason: 'Invalid prefix' },
      { number: '0000000000000000', reason: 'All zeros' },
      { number: '411111111111', reason: 'Too short' },
      { number: '41111111111111111111', reason: 'Too long' },
      { number: 'abcdefghijklmnop', reason: 'Non-numeric' },
      { number: '', reason: 'Empty' },
      { number: '4111-1111-1111-1112', reason: 'With dashes but invalid Luhn' },
    ],
  },

  passwords: {
    strong: [
      { password: 'MyP@ssw0rd!2024', score: 5, reason: 'All criteria met' },
      { password: 'Tr0ub4dor&3', score: 5, reason: 'Complex and long' },
      { password: 'C0rrectH0rse!Battery', score: 5, reason: 'Passphrase style' },
    ],
    medium: [
      { password: 'Password123', score: 3, reason: 'No special chars' },
      { password: 'mypassword!', score: 2, reason: 'No uppercase/numbers' },
      { password: 'ONLYUPPER', score: 2, reason: 'No lowercase/numbers/special' },
    ],
    weak: [
      { password: '123456', score: 1, reason: 'Common password' },
      { password: 'password', score: 1, reason: 'Dictionary word' },
      { password: 'qwerty', score: 1, reason: 'Keyboard pattern' },
      { password: 'abc', score: 0, reason: 'Too short' },
      { password: '', score: 0, reason: 'Empty' },
    ],
    blacklist: [
      'password',
      '123456',
      '12345678',
      'qwerty',
      'abc123',
      'monkey',
      'master',
      'dragon',
      'letmein',
      'baseball',
      'iloveyou',
      'trustno1',
      'sunshine',
      'princess',
      'admin',
      'welcome',
      'shadow',
      'superman',
      'michael',
      'football',
    ],
  },

  users: {
    valid: [
      {
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'jean.dupont@email.fr',
        password: 'SecureP@ss123!',
        phone: '+33612345678',
      },
      {
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'marie.martin@gmail.com',
        password: 'M@rie2024Secure',
        phone: '0623456789',
      },
      {
        firstName: 'Pierre',
        lastName: 'Bernard',
        email: 'p.bernard@company.fr',
        password: 'P1erre!Str0ng',
        phone: '+33 6 34 56 78 90',
      },
    ],
    invalid: [
      {
        data: { firstName: '', lastName: 'Test', email: 'test@test.com', password: 'Test123!' },
        reason: 'Empty first name',
      },
      {
        data: { firstName: 'Test', lastName: '', email: 'test@test.com', password: 'Test123!' },
        reason: 'Empty last name',
      },
      {
        data: { firstName: 'Test', lastName: 'User', email: 'invalid-email', password: 'Test123!' },
        reason: 'Invalid email',
      },
      {
        data: { firstName: 'Test', lastName: 'User', email: 'test@test.com', password: 'weak' },
        reason: 'Weak password',
      },
    ],
  },
};

/**
 * Generate a random string of given length
 */
export function randomString(length: number, charset?: string): string {
  const chars = charset || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random email
 */
export function randomEmail(): string {
  const localPart = randomString(8);
  const domains = ['gmail.com', 'yahoo.fr', 'hotmail.com', 'example.org', 'test.fr'];
  const domain = domains[Math.floor(Math.random() * domains.length)];
  return `${localPart}@${domain}`;
}

/**
 * Generate a random phone number (French format)
 */
export function randomPhone(): string {
  const prefix = ['06', '07'][Math.floor(Math.random() * 2)];
  const number = Math.floor(Math.random() * 100000000)
    .toString()
    .padStart(8, '0');
  return `${prefix}${number}`;
}

/**
 * Generate a valid credit card number using Luhn algorithm
 */
export function generateValidCreditCard(prefix: string = '4'): string {
  // Generate random digits for the card (15 digits for 16 digit card)
  let cardNumber = prefix;
  const targetLength = prefix.startsWith('3') ? 14 : 15; // AmEx is 15 digits

  while (cardNumber.length < targetLength) {
    cardNumber += Math.floor(Math.random() * 10).toString();
  }

  // Calculate Luhn checksum
  let sum = 0;
  let isEven = true;
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return cardNumber + checkDigit.toString();
}

/**
 * Generate a random password with specified strength
 */
export function randomPassword(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return randomString(6, 'abcdefghijklmnopqrstuvwxyz');
    case 'medium':
      return randomString(8, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    case 'strong':
      const lower = randomString(3, 'abcdefghijklmnopqrstuvwxyz');
      const upper = randomString(3, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ');
      const numbers = randomString(2, '0123456789');
      const special = randomString(2, '!@#$%^&*()_+-=[]{}|;:,.<>?');
      return (lower + upper + numbers + special)
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    default:
      return randomString(8);
  }
}
