/**
 * CLI Logger with colored output
 * Pure terminal output utilities
 */

export const Colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',

  // Background
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m',
} as const;

export class Logger {
  private static timestamp(): string {
    return new Date().toISOString().substring(11, 23);
  }

  static info(message: string): void {
    console.log(
      `${Colors.cyan}[${this.timestamp()}]${Colors.reset} ${Colors.blue}ℹ${Colors.reset} ${message}`,
    );
  }

  static success(message: string): void {
    console.log(
      `${Colors.cyan}[${this.timestamp()}]${Colors.reset} ${Colors.green}✓${Colors.reset} ${message}`,
    );
  }

  static error(message: string): void {
    console.log(
      `${Colors.cyan}[${this.timestamp()}]${Colors.reset} ${Colors.red}✗${Colors.reset} ${message}`,
    );
  }

  static warn(message: string): void {
    console.log(
      `${Colors.cyan}[${this.timestamp()}]${Colors.reset} ${Colors.yellow}⚠${Colors.reset} ${message}`,
    );
  }

  static header(title: string): void {
    const line = '═'.repeat(60);
    console.log(`\n${Colors.bright}${Colors.magenta}${line}${Colors.reset}`);
    console.log(
      `${Colors.bright}${Colors.magenta}  ${title}${Colors.reset}`,
    );
    console.log(`${Colors.bright}${Colors.magenta}${line}${Colors.reset}\n`);
  }

  static subheader(title: string): void {
    console.log(
      `\n${Colors.bright}${Colors.cyan}── ${title} ──${Colors.reset}\n`,
    );
  }

  static table(data: Record<string, unknown>): void {
    const maxKeyLen = Math.max(...Object.keys(data).map((k) => k.length));
    for (const [key, value] of Object.entries(data)) {
      const paddedKey = key.padEnd(maxKeyLen);
      console.log(
        `  ${Colors.dim}${paddedKey}${Colors.reset} │ ${Colors.white}${value}${Colors.reset}`,
      );
    }
  }

  static progress(current: number, total: number, label: string): void {
    const percentage = Math.round((current / total) * 100);
    const filled = Math.round(percentage / 5);
    const empty = 20 - filled;
    const bar = `[${'█'.repeat(filled)}${'░'.repeat(empty)}]`;

    process.stdout.write(
      `\r${Colors.cyan}${bar}${Colors.reset} ${percentage}% - ${label}`,
    );
    if (current === total) console.log('');
  }

  static divider(): void {
    console.log(`${Colors.dim}${'─'.repeat(60)}${Colors.reset}`);
  }

  static newline(): void {
    console.log('');
  }

  static prompt(message: string): void {
    process.stdout.write(`${Colors.yellow}? ${Colors.reset}${message}: `);
  }

  static menu(options: { key: string; label: string }[]): void {
    console.log('');
    for (const opt of options) {
      console.log(
        `  ${Colors.bright}${Colors.cyan}[${opt.key}]${Colors.reset} ${opt.label}`,
      );
    }
    console.log('');
  }

  static testResult(
    name: string,
    passed: boolean,
    details?: string,
  ): void {
    const status = passed
      ? `${Colors.green}PASS${Colors.reset}`
      : `${Colors.red}FAIL${Colors.reset}`;
    console.log(`  ${status} ${name}`);
    if (details) {
      console.log(`       ${Colors.dim}${details}${Colors.reset}`);
    }
  }

  static summary(
    passed: number,
    failed: number,
    duration: number,
  ): void {
    this.newline();
    this.divider();
    const total = passed + failed;
    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : 0;

    console.log(
      `  ${Colors.bright}Tests:${Colors.reset}    ${Colors.green}${passed} passed${Colors.reset}, ${Colors.red}${failed} failed${Colors.reset}, ${total} total`,
    );
    console.log(
      `  ${Colors.bright}Rate:${Colors.reset}     ${passRate}%`,
    );
    console.log(
      `  ${Colors.bright}Duration:${Colors.reset} ${duration}ms`,
    );
    this.divider();
  }
}
