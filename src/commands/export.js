import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import storage from '../storage/local.js';
import sanitizer from '../utils/sanitizer.js';
import executor from '../core/executor.js';

/**
 * Export prompts in various formats
 */
export async function exportCommand(options) {
  try {
    const prompts = storage.getAllPrompts();
    const promptNames = options.prompts || Object.keys(prompts);
    
    // Filter prompts to export
    const exportData = {};
    for (const name of promptNames) {
      if (prompts[name]) {
        exportData[name] = prompts[name];
      }
    }
    
    if (Object.keys(exportData).length === 0) {
      console.error(chalk.red('No prompts to export'));
      process.exit(1);
    }
    
    // Sanitize by default unless --raw is specified
    let sanitizedCount = 0;
    if (!options.raw) {
      for (const name in exportData) {
        if (exportData[name].content) {
          const findings = sanitizer.scan(exportData[name].content);
          if (findings.length > 0) {
            exportData[name].content = sanitizer.sanitize(exportData[name].content);
            sanitizedCount++;
          }
        }
      }
      if (sanitizedCount > 0) {
        console.log(chalk.yellow(`🔒 Sanitized sensitive data in ${sanitizedCount} prompt(s) for safety`));
        console.log(chalk.gray('  Use --raw flag to export without sanitization'));
      }
    } else {
      // Check if there's sensitive data when using --raw
      let hasSensitiveData = false;
      for (const name in exportData) {
        if (exportData[name].content) {
          const findings = sanitizer.scan(exportData[name].content);
          if (findings.length > 0) {
            hasSensitiveData = true;
            break;
          }
        }
      }
      if (hasSensitiveData) {
        console.log(chalk.red('⚠️  WARNING: Exporting with sensitive data intact'));
      }
    }
    
    // Prepare export format
    const exportPackage = {
      version: '1.0.0',
      exported: new Date().toISOString(),
      source: 'cuecli',
      prompts: exportData,
      metadata: {
        count: Object.keys(exportData).length,
        tags: [...new Set(Object.values(exportData).flatMap(p => p.tags || []))],
      }
    };
    
    // Handle different export formats
    let output;
    const format = options.format || 'json';
    
    switch (format) {
    case 'json':
      output = JSON.stringify(exportPackage, null, 2);
      break;
        
    case 'yaml':
      // Would need to add yaml package
      console.error(chalk.red('YAML format not yet implemented'));
      process.exit(1);
      break;
        
    case 'markdown':
      output = generateMarkdownExport(exportPackage);
      break;
        
    case 'minimal':
      // Just the prompts without metadata
      output = JSON.stringify(exportData, null, 2);
      break;
        
    default:
      output = JSON.stringify(exportPackage, null, 2);
    }
    
    // Output handling
    if (options.output) {
      const outputPath = path.resolve(options.output);
      const promptCount = Object.keys(exportData).length;
      
      // Verify intent before exporting to file
      const result = await executor.verifyAction('export', {
        'File': outputPath,
        'Prompts': promptCount + ' prompt(s)',
        'Format': format,
        'Sanitized': sanitizedCount > 0 ? `Yes (${sanitizedCount} prompts)` : 'No'
      }, async () => {
        await fs.writeFile(outputPath, output);
        console.log(chalk.green('✓'), `Exported ${promptCount} prompt(s) to ${outputPath}`);
        return true;
      });
      
      if (!result.confirmed) {
        process.exit(0);
      }
    } else {
      // Output to stdout (no verification needed)
      console.log(output);
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Import prompts from file
 */
export async function importCommand(file, options) {
  try {
    const filePath = path.resolve(file);
    
    if (!await fs.pathExists(filePath)) {
      console.error(chalk.red(`Error: File '${filePath}' not found`));
      process.exit(1);
    }
    
    const content = await fs.readFile(filePath, 'utf8');
    let importData;
    
    try {
      importData = JSON.parse(content);
    } catch (parseError) {
      console.error(chalk.red('Error: Invalid JSON format'));
      process.exit(1);
    }
    
    // Handle different import formats
    let promptsToImport = {};
    
    if (importData.prompts && importData.version) {
      // Full export format
      promptsToImport = importData.prompts;
    } else if (typeof importData === 'object') {
      // Assume it's a direct prompts object
      promptsToImport = importData;
    } else {
      console.error(chalk.red('Error: Unrecognized import format'));
      process.exit(1);
    }
    
    // Prepare import details for verification
    const promptCount = Object.keys(promptsToImport).length;
    const importDetails = {
      'Source': filePath,
      'Prompts': `${promptCount} prompt(s)`,
      'Strategy': options.overwrite ? 'Overwrite existing' : options.merge ? 'Merge with existing' : 'Skip existing'
    };
    
    // Check for existing prompts
    const existing = Object.keys(promptsToImport).filter(name => storage.promptExists(name));
    if (existing.length > 0) {
      importDetails['Conflicts'] = `${existing.length} existing prompt(s)`;
    }
    
    // Verify intent before importing
    const result = await executor.verifyAction('import', importDetails, async () => {
      // Import prompts
      let imported = 0;
      let skipped = 0;
      let updated = 0;
      
      for (const [name, promptData] of Object.entries(promptsToImport)) {
        const exists = storage.promptExists(name);
        
        if (exists && !options.overwrite) {
          if (options.merge) {
            // Merge tags and keep newer content
            const existing = storage.getPrompt(name);
            const merged = {
              ...existing,
              ...promptData,
              tags: [...new Set([...(existing.tags || []), ...(promptData.tags || [])])],
            };
            storage.setPrompt(name, merged);
            updated++;
          } else {
            skipped++;
            if (options.verbose) {
              console.log(chalk.yellow(`  Skipped existing: ${name}`));
            }
          }
        } else {
          storage.setPrompt(name, promptData);
          imported++;
          if (options.verbose) {
            console.log(chalk.green(`  Imported: ${name}`));
          }
        }
      }
      
      // Report results
      console.log(chalk.green('✓'), 'Import complete:');
      if (imported > 0) console.log(chalk.green(`  ${imported} prompt(s) imported`));
      if (updated > 0) console.log(chalk.blue(`  ${updated} prompt(s) merged`));
      if (skipped > 0) console.log(chalk.yellow(`  ${skipped} prompt(s) skipped`));
      
      return { imported, updated, skipped };
    });
    
    if (!result.confirmed) {
      process.exit(0);
    }
    
    if (result.result && result.result.skipped > 0 && !options.overwrite && !options.merge) {
      console.log(chalk.gray('\nUse --overwrite to replace existing prompts'));
      console.log(chalk.gray('Use --merge to merge with existing prompts'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

/**
 * Generate markdown export format
 */
function generateMarkdownExport(exportPackage) {
  let markdown = '# Exported Prompts\n\n';
  markdown += `**Exported:** ${exportPackage.exported}\n`;
  markdown += `**Count:** ${exportPackage.metadata.count}\n`;
  markdown += `**Tags:** ${exportPackage.metadata.tags.join(', ')}\n\n`;
  markdown += '---\n\n';
  
  for (const [name, prompt] of Object.entries(exportPackage.prompts)) {
    markdown += `## ${name}\n\n`;
    
    if (prompt.tags && prompt.tags.length > 0) {
      markdown += `**Tags:** ${prompt.tags.join(', ')}\n\n`;
    }
    
    if (prompt.variables && prompt.variables.length > 0) {
      markdown += `**Variables:** ${prompt.variables.join(', ')}\n\n`;
    }
    
    markdown += `\`\`\`\n${prompt.content || ''}\n\`\`\`\n\n`;
    
    if (prompt.created) {
      markdown += `*Created: ${prompt.created}*\n`;
    }
    if (prompt.modified) {
      markdown += `*Modified: ${prompt.modified}*\n`;
    }
    
    markdown += '\n---\n\n';
  }
  
  return markdown;
}