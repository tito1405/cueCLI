import chalk from 'chalk';
import fs from 'fs-extra';
import readline from 'readline';
import storage from '../storage/local.js';
import { readFromClipboard } from '../utils/clipboard.js';
import { extractVariables } from '../utils/template.js';

export async function addCommand(name, options) {
  try {
    // Check if prompt already exists
    if (storage.promptExists(name)) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const answer = await new Promise(resolve => {
        rl.question(chalk.yellow(`Prompt '${name}' already exists. Overwrite? (y/N): `), resolve);
      });
      rl.close();

      if (answer.toLowerCase() !== 'y' && answer.toLowerCase() !== 'yes') {
        console.log(chalk.gray('Cancelled'));
        return;
      }
    }

    let content = '';

    // Get content from different sources
    if (options.fromFile) {
      // Read from file
      if (!fs.existsSync(options.fromFile)) {
        console.error(chalk.red(`Error: File '${options.fromFile}' not found`));
        process.exit(1);
      }
      content = fs.readFileSync(options.fromFile, 'utf8');
      console.log(chalk.gray(`Reading from ${options.fromFile}...`));
    } else if (options.fromClipboard) {
      // Read from clipboard
      content = await readFromClipboard();
      console.log(chalk.gray('Reading from clipboard...'));
    } else {
      // Read from stdin (multi-line input)
      console.log(chalk.gray('Enter prompt content (Ctrl+D or Ctrl+C when done):'));
      content = await readFromStdin();
    }

    if (!content || content.trim().length === 0) {
      console.error(chalk.red('Error: Prompt content cannot be empty'));
      process.exit(1);
    }

    // Extract variables from content
    const variables = extractVariables(content);

    // Prepare prompt data
    const promptData = {
      content,
      tags: options.tags || [],
      variables
    };

    // Save the prompt
    const saved = storage.setPrompt(name, promptData);
    
    console.log(chalk.green('✓'), chalk.white(`Prompt '${name}' saved successfully`));
    
    // Show prompt details
    if (saved.tags && saved.tags.length > 0) {
      console.log(chalk.gray('  Tags:'), saved.tags.join(', '));
    }
    if (saved.variables && saved.variables.length > 0) {
      console.log(chalk.gray('  Variables detected:'), saved.variables.join(', '));
    }
    console.log(chalk.gray(`  Version: ${saved.version}`));
    console.log(chalk.gray(`  Size: ${content.length} characters`));
    
    // Usage hint
    console.log(chalk.gray(`\nUse \`cuecli get ${name}\` to copy this prompt to clipboard`));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

function readFromStdin() {
  return new Promise((resolve, reject) => {
    let content = '';
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    rl.on('line', (line) => {
      content += line + '\n';
    });

    rl.on('close', () => {
      resolve(content.trim());
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      rl.close();
      resolve(content.trim());
    });
  });
}