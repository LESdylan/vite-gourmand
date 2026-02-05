#!/usr/bin/env node
/**
 * vg - Vite Gourmand CLI
 * Fly.io-style developer tools
 */

import { Command } from 'commander';
import { createLogsCommand } from '../dist/commands/logs.js';

const program = new Command();

program
  .name('vg')
  .description('Vite Gourmand CLI - Developer tools')
  .version('1.0.0');

program.addCommand(createLogsCommand());

program.parse();
