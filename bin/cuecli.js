#!/usr/bin/env node

import { program } from 'commander';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs-extra';

// Import commands
import { getCommand } from '../src/commands/get.js';
import { listCommand } from '../src/commands/list.js';
import { addCommand } from '../src/commands/add.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

program
  .name('cuecli')
  .description('CLI tool for managing reusable prompts')
  .version(packageJson.version);

// Get command
program
  .command('get <name>')
  .description('Copy prompt to clipboard')
  .option('--vars <vars...>', 'Variables to substitute (format: KEY=value)')
  .option('--stdout', 'Output to stdout instead of clipboard')
  .action(getCommand);

// List command
program
  .command('list')
  .alias('ls')
  .description('List all prompts')
  .option('--tags <tags...>', 'Filter by tags')
  .option('--json', 'Output as JSON')
  .action(listCommand);

// Add command
program
  .command('add <name>')
  .description('Add a new prompt')
  .option('--from-file <path>', 'Add prompt from file')
  .option('--from-clipboard', 'Add prompt from clipboard')
  .option('--tags <tags...>', 'Add tags to prompt')
  .action(addCommand);

// Error handling
program.exitOverride();

try {
  await program.parseAsync(process.argv);
} catch (error) {
  if (error.code === 'commander.missingArgument') {
    console.error(chalk.red('Error:'), error.message);
  } else if (error.code === 'commander.unknownCommand') {
    console.error(chalk.red('Unknown command'));
  } else {
    console.error(chalk.red('Error:'), error.message);
  }
  process.exit(1);
}