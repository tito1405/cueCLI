import chalk from 'chalk';
import storage from '../storage/local.js';
import { copyToClipboard } from '../utils/clipboard.js';
import { substituteVariables, parseVariables } from '../utils/template.js';

export async function getCommand(name, options) {
  const startTime = Date.now();

  try {
    // Get the prompt
    const prompt = storage.getPrompt(name);
    
    if (!prompt) {
      console.error(chalk.red(`Error: Prompt '${name}' not found`));
      console.log(chalk.gray('Run `cuecli list` to see available prompts'));
      process.exit(1);
    }

    let content = prompt.content || '';

    // Handle variable substitution if provided
    if (options.vars && options.vars.length > 0) {
      const variables = parseVariables(options.vars);
      content = substituteVariables(content, variables);
    }

    // Output to stdout or clipboard
    if (options.stdout) {
      console.log(content);
    } else {
      const success = await copyToClipboard(content);
      if (success) {
        const elapsed = Date.now() - startTime;
        console.log(chalk.green('✓'), chalk.white(`Copied '${name}' to clipboard`), chalk.gray(`(${elapsed}ms)`));
        
        // Show prompt info
        if (prompt.tags && prompt.tags.length > 0) {
          console.log(chalk.gray('  Tags:'), prompt.tags.join(', '));
        }
        if (prompt.variables && prompt.variables.length > 0) {
          console.log(chalk.gray('  Variables:'), prompt.variables.join(', '));
        }
      } else {
        // Fallback already handled by copyToClipboard
        console.log(content);
      }
    }
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}