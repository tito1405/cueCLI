import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import storage from '../storage/local.js';
import { substituteVariables, parseVariables } from '../utils/template.js';
import sanitizer from '../utils/sanitizer.js';
import logger from '../utils/logger.js';
import executor from '../core/executor.js';

/**
 * Enhanced get command with multiple output options and sanitization
 */
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

    // Always scan for sensitive data
    const findings = sanitizer.scan(content);
    
    // Sanitize by default unless --raw flag is used
    if (!options.raw && findings.length > 0) {
      // Sanitize the content
      content = sanitizer.sanitize(content);
      const stats = sanitizer.getStats();
      
      if (stats.totalRedacted > 0) {
        console.log(chalk.yellow(`🔒 Sanitized ${stats.totalRedacted} sensitive item(s) for safety`));
        if (options.verbose || options.scanOnly) {
          Object.entries(stats.byType).forEach(([type, count]) => {
            console.log(chalk.gray(`  - ${type}: ${count}`));
          });
        }
        console.log(chalk.gray('  Use --raw flag to bypass sanitization'));
      }
    } else if (options.raw && findings.length > 0) {
      // Warning when using raw with sensitive data
      console.log(chalk.red('⚠️  WARNING: Output contains sensitive data'));
      findings.forEach(f => {
        console.log(chalk.yellow(`  - ${f.type}: ${f.count} occurrence(s)`));
      });
    }

    // Handle explicit execution flag (power users)
    if (options.execute) {
      await executor.quickExecute(content, name);
      return;
    }

    // Handle different output methods
    if (options.output) {
      await handleOutput(content, options.output, name);
    } else if (options.stdout) {
      // Output to stdout
      console.log(content);
    } else if (options.file) {
      // Save to file
      const filePath = path.resolve(options.file);
      await fs.writeFile(filePath, content);
      console.log(chalk.green('✓'), `Saved to ${filePath}`);
    } else if (options.append) {
      // Append to file
      const filePath = path.resolve(options.append);
      await fs.appendFile(filePath, '\n' + content);
      console.log(chalk.green('✓'), `Appended to ${filePath}`);
    } else if (options.pipe) {
      // Output for piping (no formatting)
      process.stdout.write(content);
    } else if (options.preview) {
      // Show preview with syntax highlighting (if available)
      const lines = content.split('\n');
      const previewLines = options.lines || 10;
      
      console.log(chalk.cyan(`Preview of '${name}':`));
      console.log(chalk.gray('─'.repeat(50)));
      
      lines.slice(0, previewLines).forEach((line, i) => {
        console.log(chalk.gray(`${String(i + 1).padStart(3)} │`), line);
      });
      
      if (lines.length > previewLines) {
        console.log(chalk.gray(`... (${lines.length - previewLines} more lines)`));
      }
      console.log(chalk.gray('─'.repeat(50)));
    } else {
      // DEFAULT BEHAVIOR: Present for execution
      // This is the new standard - every get is a potential execution
      // ONLY when no specific output method is requested
      await executor.present(name, content, {
        action: 'retrieved',
        source: 'library',
        modified: false
      });
    }

    // Log usage for analytics (if enabled in future)
    // Note: Telemetry disabled by default for privacy
    logger.trace('Prompt retrieved', {
      name,
      method: options.stdout ? 'stdout' : options.file ? 'file' : 'clipboard',
      sanitized: options.sanitize || false,
      elapsed: Date.now() - startTime,
    });

  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    logger.error('Get command failed', { error: error.message });
    process.exit(1);
  }
}

/**
 * Handle special output formats
 */
async function handleOutput(content, format, name) {
  switch (format) {
  case 'json':
    console.log(JSON.stringify({
      name,
      content,
      timestamp: new Date().toISOString(),
    }, null, 2));
    break;
      
  case 'markdown':
    console.log(`# ${name}\n\n${content}`);
    break;
      
  case 'html': {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>${name}</title>
  <meta charset="utf-8">
  <style>
    body { font-family: system-ui; max-width: 800px; margin: 40px auto; padding: 20px; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; overflow-x: auto; }
  </style>
</head>
<body>
  <h1>${name}</h1>
  <pre>${escapeHtml(content)}</pre>
  <footer>
    <small>Generated by cueCli at ${new Date().toISOString()}</small>
  </footer>
</body>
</html>`;
    console.log(html);
    break;
  }
      
  case 'base64':
    console.log(Buffer.from(content).toString('base64'));
    break;
      
  case 'url':
    console.log(encodeURIComponent(content));
    break;
      
  default:
    console.log(content);
  }
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    '\'': '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

