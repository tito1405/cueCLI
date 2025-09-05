import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import storage from '../storage/local.js';
import config from '../config/config.js';
import logger from '../utils/logger.js';
import executor from '../core/executor.js';

/**
 * Edit an existing prompt using the configured editor
 */
export async function editCommand(name, options) {
  try {
    // Check if prompt exists
    const prompt = storage.getPrompt(name);
    if (!prompt) {
      console.error(chalk.red(`Error: Prompt '${name}' not found`));
      console.log(chalk.gray('Run `cuecli list` to see available prompts'));
      process.exit(1);
    }

    // Determine editor
    const editor = options.editor || config.get('editor') || process.env.EDITOR || 'vi';
    
    // Create temporary file
    const tmpDir = os.tmpdir();
    const tmpFile = path.join(tmpDir, `cuecli-edit-${Date.now()}.md`);
    
    // Write current content to temp file
    const content = prompt.content || '';
    await fs.writeFile(tmpFile, content);
    
    logger.debug(`Opening ${tmpFile} with ${editor}`);
    
    // Open editor
    await new Promise((resolve, reject) => {
      const child = spawn(editor, [tmpFile], {
        stdio: 'inherit',
        shell: true,
      });
      
      child.on('exit', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`Editor exited with code ${code}`));
        }
      });
      
      child.on('error', reject);
    });
    
    // Read edited content
    const newContent = await fs.readFile(tmpFile, 'utf8');
    
    // Clean up temp file
    await fs.remove(tmpFile);
    
    // Check if content changed
    if (newContent === content) {
      console.log(chalk.gray('No changes made'));
      return;
    }
    
    // Update prompt
    storage.setPrompt(name, {
      ...prompt,
      content: newContent,
    });
    
    // Present the edited prompt for execution
    // This is the new standard - after editing, you likely want to execute
    await executor.present(name, newContent, {
      action: 'edited',
      source: 'editor',
      modified: true
    });
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Edit command failed', { error: error.message });
    process.exit(1);
  }
}