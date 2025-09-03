import chalk from 'chalk';
import storage from '../storage/local.js';

export function listCommand(options) {
  try {
    let prompts = storage.getAllPrompts();

    // Filter by tags if specified
    if (options.tags && options.tags.length > 0) {
      prompts = storage.getPromptsByTags(options.tags);
    }

    const promptEntries = Object.entries(prompts);

    if (promptEntries.length === 0) {
      if (options.tags) {
        console.log(chalk.yellow('No prompts found with the specified tags'));
      } else {
        console.log(chalk.yellow('No prompts found'));
        console.log(chalk.gray('Run `cuecli add <name>` to create your first prompt'));
      }
      return;
    }

    // Output as JSON if requested
    if (options.json) {
      console.log(JSON.stringify(prompts, null, 2));
      return;
    }

    // Display prompts in a formatted list
    console.log(chalk.bold(`\nFound ${promptEntries.length} prompt${promptEntries.length === 1 ? '' : 's'}:\n`));

    // Sort by name
    promptEntries.sort((a, b) => a[0].localeCompare(b[0]));

    for (const [name, prompt] of promptEntries) {
      // Name and version
      console.log(chalk.cyan('•'), chalk.white(name), chalk.gray(`v${prompt.version || 1}`));
      
      // Content preview (first line or 50 chars)
      if (prompt.content) {
        const preview = prompt.content.split('\n')[0].substring(0, 50);
        const ellipsis = prompt.content.length > 50 || prompt.content.includes('\n') ? '...' : '';
        console.log(chalk.gray(`  ${preview}${ellipsis}`));
      }

      // Tags
      if (prompt.tags && prompt.tags.length > 0) {
        console.log(chalk.gray('  Tags:'), chalk.blue(prompt.tags.join(', ')));
      }

      // Variables
      if (prompt.variables && prompt.variables.length > 0) {
        console.log(chalk.gray('  Variables:'), chalk.magenta(prompt.variables.join(', ')));
      }

      // Last modified
      if (prompt.modified) {
        const date = new Date(prompt.modified);
        const relative = getRelativeTime(date);
        console.log(chalk.gray(`  Modified: ${relative}`));
      }

      console.log(); // Empty line between prompts
    }

    // Footer with usage hint
    console.log(chalk.gray('Use `cuecli get <name>` to copy a prompt to clipboard'));
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

function getRelativeTime(date) {
  const now = new Date();
  const diffMs = now - date;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  } else {
    return 'just now';
  }
}