/**
 * cueCLI - AI Prompt Management Library
 * 
 * This module exports the core functionality of cueCLI for programmatic use.
 * For CLI usage, install globally: npm install -g cuecli
 */

// Import core modules
import storage from './storage/local.js';
import sanitizer, { Sanitizer } from './utils/sanitizer.js';
import logger from './utils/logger.js';

// Export storage functionality
export { LocalStorage } from './storage/local.js';
export { default as storage } from './storage/local.js';

// Export command functions
export { getCommand } from './commands/enhanced-get.js';
export { listCommand } from './commands/list.js';
export { addCommand } from './commands/add.js';
export { editCommand } from './commands/edit.js';
export { exportCommand, importCommand } from './commands/export.js';

// Export utilities
export { Sanitizer, sanitizer };
export { copyToClipboard } from './utils/clipboard.js';
export { substituteVariables, parseVariables } from './utils/template.js';
export { logger };

// Export version
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '..', 'package.json'), 'utf8'));

export const version = packageJson.version;

// Default export
export default {
  storage,
  sanitizer,
  logger,
  version
};