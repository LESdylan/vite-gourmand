#!/usr/bin/env npx ts-node

/**
 * CLI Security Test Suite - Entry Point
 *
 * Interactive command-line interface for security validation tests
 *
 * Usage:
 *   npx ts-node test/cli_test/index.ts                    # Interactive mode
 *   npx ts-node test/cli_test/index.ts --all              # Run all tests
 *   npx ts-node test/cli_test/index.ts --test <name>      # Run specific test
 *   npx ts-node test/cli_test/index.ts --fuzzy            # Run with fuzzy testing
 *   npx ts-node test/cli_test/index.ts --list             # List all tests
 *   npx ts-node test/cli_test/index.ts --category <cat>   # Run by category
 *   npx ts-node test/cli_test/index.ts --help             # Show help
 */

import { TestRunner, RunOptions } from './runner';
import { Logger, Colors } from './utils/logger';

interface CliArgs {
  all: boolean;
  test?: string;
  fuzzy: boolean;
  iterations: number;
  list: boolean;
  category?: string;
  verbose: boolean;
  help: boolean;
  interactive: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    all: false,
    fuzzy: false,
    iterations: 100,
    list: false,
    verbose: false,
    help: false,
    interactive: args.length === 0,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--all':
      case '-a':
        result.all = true;
        break;

      case '--test':
      case '-t':
        result.test = args[++i];
        break;

      case '--fuzzy':
      case '-f':
        result.fuzzy = true;
        break;

      case '--iterations':
      case '-i':
        result.iterations = parseInt(args[++i]) || 100;
        break;

      case '--list':
      case '-l':
        result.list = true;
        break;

      case '--category':
      case '-c':
        result.category = args[++i];
        break;

      case '--verbose':
      case '-v':
        result.verbose = true;
        break;

      case '--help':
      case '-h':
        result.help = true;
        break;

      case '--interactive':
        result.interactive = true;
        break;
    }
  }

  return result;
}

function showHelp(): void {
  console.log(`
${Colors.bright}${Colors.cyan}╔═══════════════════════════════════════════════════════════════╗
║           🧪 CLI Security Test Suite - Vite Gourmand          ║
╚═══════════════════════════════════════════════════════════════╝${Colors.reset}

${Colors.bright}USAGE:${Colors.reset}
  npx ts-node test/cli_test/index.ts [OPTIONS]

${Colors.bright}OPTIONS:${Colors.reset}
  ${Colors.cyan}--all, -a${Colors.reset}              Run all tests
  ${Colors.cyan}--test, -t <name>${Colors.reset}     Run a specific test by name
  ${Colors.cyan}--fuzzy, -f${Colors.reset}            Enable fuzzy testing
  ${Colors.cyan}--iterations, -i <n>${Colors.reset}  Number of fuzzy iterations (default: 100)
  ${Colors.cyan}--list, -l${Colors.reset}             List all available tests
  ${Colors.cyan}--category, -c <cat>${Colors.reset}  Run tests in a specific category
  ${Colors.cyan}--verbose, -v${Colors.reset}          Show detailed output
  ${Colors.cyan}--interactive${Colors.reset}          Start interactive mode (default if no args)
  ${Colors.cyan}--help, -h${Colors.reset}             Show this help message

${Colors.bright}EXAMPLES:${Colors.reset}
  ${Colors.dim}# Run all tests${Colors.reset}
  npx ts-node test/cli_test/index.ts --all

  ${Colors.dim}# Run email validation test${Colors.reset}
  npx ts-node test/cli_test/index.ts --test email_validation

  ${Colors.dim}# Run all tests with 50 fuzzy iterations${Colors.reset}
  npx ts-node test/cli_test/index.ts --all --fuzzy --iterations 50

  ${Colors.dim}# Run validation category tests${Colors.reset}
  npx ts-node test/cli_test/index.ts --category validation

  ${Colors.dim}# Interactive mode${Colors.reset}
  npx ts-node test/cli_test/index.ts

${Colors.bright}AVAILABLE TESTS:${Colors.reset}
  ${Colors.green}• email_validation${Colors.reset}      - Validate email formats (RFC 5322)
  ${Colors.green}• verif_credit_card${Colors.reset}     - Credit card validation (Luhn algorithm)
  ${Colors.green}• password_strength${Colors.reset}     - Password strength testing
  ${Colors.green}• first_time_registration${Colors.reset} - First-time registration flow
  ${Colors.green}• reset_password${Colors.reset}        - Password reset flow
  ${Colors.green}• quick_connection${Colors.reset}      - Google OAuth flow validation
  ${Colors.green}• db_mail_connection${Colors.reset}    - DB/Mail connection testing

${Colors.bright}CATEGORIES:${Colors.reset}
  ${Colors.yellow}• validation${Colors.reset}  - Input validation tests
  ${Colors.yellow}• flow${Colors.reset}        - User flow simulation tests
  ${Colors.yellow}• connection${Colors.reset}  - Connection/integration tests
`);
}

async function main(): Promise<void> {
  const args = parseArgs();

  // Show help
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Create runner
  const options: RunOptions = {
    verbose: args.verbose,
    fuzzy: args.fuzzy,
    fuzzyIterations: args.iterations,
    category: args.category,
  };

  const runner = new TestRunner(options);

  // List tests
  if (args.list) {
    runner.listTests();
    process.exit(0);
  }

  // Run specific test
  if (args.test) {
    const result = await runner.runTest(args.test);
    if (args.fuzzy) {
      await runner.runFuzzyTest(args.test, args.iterations);
    }
    process.exit(result?.passed ? 0 : 1);
  }

  // Run all tests
  if (args.all) {
    const summary = await runner.runAll();
    process.exit(summary.failed === 0 ? 0 : 1);
  }

  // Run by category
  if (args.category) {
    const summary = await runner.runCategory(args.category);
    process.exit(summary.failed === 0 ? 0 : 1);
  }

  // Interactive mode
  if (args.interactive) {
    await runner.interactive();
    process.exit(0);
  }

  // Default: show help
  showHelp();
}

// Run the CLI
main().catch((error) => {
  Logger.error(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
