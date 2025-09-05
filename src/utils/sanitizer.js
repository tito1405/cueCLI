import chalk from 'chalk';

/**
 * Sanitizer utility for cleaning sensitive data from prompts
 */
export class Sanitizer {
  constructor(options = {}) {
    // Default patterns for sensitive data
    this.patterns = {
      // API Keys and tokens
      apiKeys: [
        /sk-[a-zA-Z0-9]{32,}/gi,  // Common API key format
        /api[_-]?key[\s:=]+['"]?([a-zA-Z0-9-_]{20,})['"]?/gi,
        /token[\s:=]+['"]?([a-zA-Z0-9\-_]{20,})['"]?/gi,
        /bearer\s+[a-zA-Z0-9\-_.]+/gi,
      ],
      
      // AWS credentials
      aws: [
        /AKIA[0-9A-Z]{16}/gi,  // AWS Access Key
        /aws[_-]?secret[_-]?access[_-]?key[\s:=]+['"]?([a-zA-Z0-9/+=]{40})['"]?/gi,
      ],
      
      // URLs with credentials
      urls: [
        /https?:\/\/[^:]+:[^@]+@[^\s]+/gi,  // URLs with embedded credentials
      ],
      
      // Email addresses (optional)
      emails: [
        /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
      ],
      
      // Credit card numbers
      creditCards: [
        /\b(?:\d{4}[\s-]?){3}\d{4}\b/g,  // Basic credit card pattern
      ],
      
      // SSH private keys
      sshKeys: [
        /-----BEGIN (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |DSA |EC |OPENSSH )?PRIVATE KEY-----/gi,
      ],
      
      // Environment variables
      envVars: [
        /(?:export\s+)?([A-Z_]{2,}=[^\s]+)/g,
      ],
      
      // Passwords in common formats
      passwords: [
        /password[\s:=]+['"]?([^\s'"]+)['"]?/gi,
        /pwd[\s:=]+['"]?([^\s'"]+)['"]?/gi,
        /pass[\s:=]+['"]?([^\s'"]+)['"]?/gi,
      ],
    };

    // User-defined patterns
    this.customPatterns = options.customPatterns || [];
    
    // Sanitization options
    this.options = {
      replaceWith: options.replaceWith || '[REDACTED]',
      enabledChecks: options.enabledChecks || ['apiKeys', 'aws', 'urls', 'sshKeys', 'passwords'],
      preserveStructure: options.preserveStructure !== false,
      verbose: options.verbose || false,
    };

    // Statistics
    this.stats = {
      totalRedacted: 0,
      byType: {},
    };
  }

  /**
   * Sanitize content by removing sensitive data
   */
  sanitize(content) {
    if (!content) return content;

    let sanitized = content;
    this.resetStats();

    // Apply enabled pattern checks
    for (const checkType of this.options.enabledChecks) {
      if (this.patterns[checkType]) {
        for (const pattern of this.patterns[checkType]) {
          const matches = sanitized.match(pattern);
          if (matches) {
            this.stats.byType[checkType] = (this.stats.byType[checkType] || 0) + matches.length;
            this.stats.totalRedacted += matches.length;
            
            if (this.options.preserveStructure) {
              // Preserve structure by replacing with same-length redaction
              sanitized = sanitized.replace(pattern, match => {
                return this.options.replaceWith.padEnd(match.length, '*').substring(0, match.length);
              });
            } else {
              sanitized = sanitized.replace(pattern, this.options.replaceWith);
            }
          }
        }
      }
    }

    // Apply custom patterns
    for (const pattern of this.customPatterns) {
      const matches = sanitized.match(pattern);
      if (matches) {
        this.stats.byType['custom'] = (this.stats.byType['custom'] || 0) + matches.length;
        this.stats.totalRedacted += matches.length;
        sanitized = sanitized.replace(pattern, this.options.replaceWith);
      }
    }

    return sanitized;
  }

  /**
   * Scan content and report potential sensitive data without modifying
   */
  scan(content) {
    const findings = [];
    
    for (const [checkType, patterns] of Object.entries(this.patterns)) {
      if (this.options.enabledChecks.includes(checkType)) {
        for (const pattern of patterns) {
          const matches = content.match(pattern);
          if (matches) {
            findings.push({
              type: checkType,
              count: matches.length,
              samples: matches.slice(0, 3).map(m => 
                m.substring(0, 10) + '...' + (m.length > 10 ? `[${m.length} chars]` : '')
              ),
            });
          }
        }
      }
    }

    return findings;
  }

  /**
   * Interactive sanitization with user confirmation
   */
  async interactiveSanitize(content) {
    const findings = this.scan(content);
    
    if (findings.length === 0) {
      if (this.options.verbose) {
        console.log(chalk.green('✓ No sensitive data detected'));
      }
      return content;
    }

    console.log(chalk.yellow('\n⚠️  Potential sensitive data detected:'));
    for (const finding of findings) {
      console.log(chalk.gray(`  - ${finding.type}: ${finding.count} occurrence(s)`));
      if (this.options.verbose && finding.samples.length > 0) {
        console.log(chalk.gray(`    Examples: ${finding.samples.join(', ')}`));
      }
    }

    // In a real implementation, you'd prompt for user confirmation here
    // For now, we'll return the sanitized version
    return this.sanitize(content);
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalRedacted: 0,
      byType: {},
    };
  }

  /**
   * Get sanitization statistics
   */
  getStats() {
    return this.stats;
  }

  /**
   * Add custom pattern
   */
  addCustomPattern(pattern) {
    if (pattern instanceof RegExp) {
      this.customPatterns.push(pattern);
    } else {
      this.customPatterns.push(new RegExp(pattern, 'gi'));
    }
  }

  /**
   * Configure sanitization options
   */
  configure(options) {
    this.options = { ...this.options, ...options };
  }

  /**
   * Create a sanitization report
   */
  createReport(content) {
    const findings = this.scan(content);
    const sanitized = this.sanitize(content);
    
    return {
      original: {
        length: content.length,
        lines: content.split('\n').length,
      },
      sanitized: {
        length: sanitized.length,
        lines: sanitized.split('\n').length,
      },
      findings,
      stats: this.getStats(),
      timestamp: new Date().toISOString(),
    };
  }
}

// Export singleton instance with default config
export default new Sanitizer();

// Also export the class for custom instances
export { Sanitizer as SanitizerClass };