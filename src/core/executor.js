import chalk from 'chalk';
import readline from 'readline';
import { spawn } from 'child_process';
import { copyToClipboard } from '../utils/clipboard.js';

/**
 * Central Execution Engine
 * Philosophy: Every action requires intent verification
 * This is the heart of cuecli - making every operation deliberate and safe
 */
export class ExecutionEngine {
  constructor() {
    this.lastExecutedPrompt = null;
    this.lastAction = null;
    this.executionCount = 0;
  }

  /**
   * Standard execution presenter - used by ALL commands
   * This creates the consistent "ready to execute" experience
   */
  async present(promptName, content, metadata = {}) {
    const { 
      action = 'retrieved',  // What action was just performed
      source = 'library',    // Where the prompt came from
      modified = false        // Was the prompt modified
    } = metadata;

    // Silently copy to clipboard - this is now a background operation
    const copied = await copyToClipboard(content);
    
    // Calculate metrics
    const lines = content.split('\n');
    const lineCount = lines.length;
    const charCount = content.length;
    
    // Clear separation from previous output
    console.log();
    
    // Execution header - this is now the primary focus
    console.log(chalk.cyan('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.cyan('║ ') + chalk.white.bold('PROMPT READY FOR EXECUTION') + ' '.repeat(31) + chalk.cyan('║'));
    console.log(chalk.cyan('╚═══════════════════════════════════════════════════════════╝'));
    
    // Prompt identification
    console.log();
    console.log(chalk.white('  Name:    ') + chalk.yellow.bold(promptName));
    console.log(chalk.white('  Source:  ') + this.getSourceBadge(source));
    console.log(chalk.white('  Status:  ') + this.getStatusBadge(action, modified));
    console.log(chalk.white('  Metrics: ') + chalk.gray(`${lineCount} lines • ${charCount.toLocaleString()} chars`));
    
    // Smart preview - exactly 8 lines max, with intelligent truncation
    console.log();
    console.log(chalk.blue('  ┌─ Preview ' + '─'.repeat(47) + '┐'));
    
    const preview = this.generateSmartPreview(lines, 8);
    preview.forEach(line => {
      const displayLine = this.truncateLine(line, 56);
      console.log(chalk.blue('  │ ') + chalk.white(displayLine.padEnd(56)) + chalk.blue(' │'));
    });
    
    console.log(chalk.blue('  └' + '─'.repeat(58) + '┘'));
    
    // Execution prompt - the main call to action
    console.log();
    const shouldExecute = await this.promptForExecution();
    
    if (shouldExecute) {
      return await this.execute(content, promptName);
    } else {
      // Subtle reminder that it's still copied
      console.log();
      console.log(chalk.gray('  ✓ Prompt copied to clipboard • Use ') + chalk.white('Cmd+V') + chalk.gray(' to paste'));
      return { executed: false, copied };
    }
  }

  /**
   * Generate intelligent preview - shows most relevant parts
   */
  generateSmartPreview(lines, maxLines = 8) {
    const nonEmptyLines = lines.filter(line => line.trim());
    
    if (nonEmptyLines.length <= maxLines) {
      return nonEmptyLines.slice(0, maxLines);
    }
    
    // Smart preview: show first 4 and last 3, with indicator
    const preview = [];
    preview.push(...nonEmptyLines.slice(0, 4));
    preview.push(chalk.dim('         ... ' + (nonEmptyLines.length - 7) + ' more lines ...'));
    preview.push(...nonEmptyLines.slice(-3));
    
    return preview;
  }

  /**
   * Truncate line intelligently
   */
  truncateLine(line, maxLength) {
    if (line.length <= maxLength) return line;
    return line.substring(0, maxLength - 3) + '...';
  }

  /**
   * Get source badge based on where prompt came from
   */
  getSourceBadge(source) {
    const sources = {
      library: chalk.blue('📚 Library'),
      file: chalk.green('📁 File'),
      clipboard: chalk.magenta('📋 Clipboard'),
      stdin: chalk.cyan('⌨️  Input'),
      editor: chalk.yellow('✏️  Editor')
    };
    
    return sources[source] || chalk.gray('📦 ' + source);
  }

  /**
   * Get status badge based on action
   */
  getStatusBadge(action, modified) {
    const badges = {
      retrieved: chalk.green('● Ready'),
      edited: chalk.yellow('● Modified'),
      created: chalk.cyan('● New'),
      imported: chalk.blue('● Imported'),
      exported: chalk.magenta('● Exported')
    };
    
    let badge = badges[action] || chalk.green('● Ready');
    if (modified) badge += chalk.yellow(' [edited]');
    
    return badge;
  }

  /**
   * Prompt for execution with clean interface
   */
  async promptForExecution() {
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      // Clean, clear prompt
      rl.question(
        chalk.yellow.bold('  ▶ Execute prompt? ') + chalk.gray('(y/n) '),
        answer => {
          rl.close();
          const response = answer.toLowerCase().trim();
          resolve(response === 'y' || response === 'yes');
        }
      );
    });
  }

  /**
   * Execute the prompt
   */
  async execute(content, promptName) {
    console.log();
    console.log(chalk.green.bold('  ⚡ EXECUTING...'));
    console.log();
    
    // Determine shell
    const shell = process.platform === 'win32' ? 'cmd.exe' : '/bin/sh';
    const shellArgs = process.platform === 'win32' ? ['/c'] : ['-c'];
    
    return new Promise((resolve, reject) => {
      const child = spawn(shell, [...shellArgs, content], {
        stdio: 'inherit',
        shell: true
      });
      
      child.on('error', error => {
        console.error(chalk.red('\n  ✗ Execution failed:'), error.message);
        reject(error);
      });
      
      child.on('exit', code => {
        console.log();
        console.log(chalk.cyan('═══════════════════════════════════════════════════════════'));
        
        if (code === 0) {
          console.log(chalk.green.bold('  ✓ EXECUTION COMPLETED'));
          this.lastExecutedPrompt = promptName;
          this.executionCount++;
        } else {
          console.log(chalk.yellow.bold(`  ⚠ EXIT CODE: ${code}`));
        }
        
        console.log(chalk.cyan('═══════════════════════════════════════════════════════════'));
        console.log();
        
        resolve({ executed: true, exitCode: code });
      });
    });
  }

  /**
   * Quick execution without preview (for power users)
   */
  async quickExecute(content, promptName) {
    await copyToClipboard(content);
    console.log();
    console.log(chalk.green('⚡'), chalk.white.bold('Quick executing:'), chalk.yellow(promptName));
    return await this.execute(content, promptName);
  }

  /**
   * Universal action verifier - for ANY operation that changes state
   */
  async verifyAction(actionType, details, callback) {
    // Clear separation
    console.log();
    
    // Action header
    console.log(chalk.yellow('╔═══════════════════════════════════════════════════════════╗'));
    console.log(chalk.yellow('║ ') + chalk.white.bold('ACTION VERIFICATION REQUIRED') + ' '.repeat(30) + chalk.yellow('║'));
    console.log(chalk.yellow('╚═══════════════════════════════════════════════════════════╝'));
    
    // Action details
    console.log();
    console.log(chalk.white('  Action:  ') + this.getActionBadge(actionType));
    
    // Display details based on action type
    if (typeof details === 'string') {
      console.log(chalk.white('  Target:  ') + chalk.cyan(details));
    } else if (Array.isArray(details)) {
      console.log(chalk.white('  Targets: ') + chalk.cyan(details.length + ' items'));
      details.slice(0, 3).forEach(item => {
        console.log(chalk.gray('    • ') + chalk.white(item));
      });
      if (details.length > 3) {
        console.log(chalk.gray('    • ...and ' + (details.length - 3) + ' more'));
      }
    } else if (typeof details === 'object') {
      Object.entries(details).forEach(([key, value]) => {
        console.log(chalk.white('  ' + key + ':') + ' '.repeat(Math.max(0, 8 - key.length)) + chalk.cyan(value));
      });
    }
    
    // Confirmation prompt
    console.log();
    const confirmed = await this.promptForConfirmation(actionType);
    
    if (confirmed) {
      console.log();
      console.log(chalk.green.bold('  ⚡ EXECUTING...'));
      console.log();
      
      try {
        const result = await callback();
        this.lastAction = { type: actionType, details, timestamp: Date.now() };
        return { confirmed: true, result };
      } catch (error) {
        console.error(chalk.red('  ✗ Action failed:'), error.message);
        return { confirmed: true, error };
      }
    } else {
      console.log();
      console.log(chalk.gray('  ✗ Action cancelled'));
      return { confirmed: false };
    }
  }

  /**
   * Get action type badge
   */
  getActionBadge(actionType) {
    const badges = {
      delete: chalk.red('🗑️  Delete'),
      export: chalk.blue('📤 Export'),
      import: chalk.green('📥 Import'),
      backup: chalk.yellow('💾 Backup'),
      restore: chalk.magenta('♻️  Restore'),
      clear: chalk.red('🧹 Clear'),
      sync: chalk.cyan('🔄 Sync')
    };
    
    return badges[actionType] || chalk.gray('⚙️  ' + actionType);
  }

  /**
   * Prompt for confirmation with action-specific message
   */
  async promptForConfirmation(actionType) {
    const messages = {
      delete: 'Delete this prompt?',
      export: 'Export prompts?',
      import: 'Import prompts?',
      clear: 'Clear all data?',
      default: 'Proceed with action?'
    };
    
    const message = messages[actionType] || messages.default;
    
    return new Promise(resolve => {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      rl.question(
        chalk.yellow.bold('  ▶ ' + message + ' ') + chalk.gray('(y/n) '),
        answer => {
          rl.close();
          const response = answer.toLowerCase().trim();
          resolve(response === 'y' || response === 'yes');
        }
      );
    });
  }
}

// Singleton instance
export default new ExecutionEngine();