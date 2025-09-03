import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

// Log levels
const LogLevel = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Logger class for consistent logging across cueCli
export class Logger {
  constructor(options = {}) {
    this.level = options.level || (process.env.DEBUG ? LogLevel.DEBUG : LogLevel.INFO);
    this.colors = options.colors !== false;
    this.timestamps = options.timestamps || false;
    this.logFile = options.logFile || null;
    this.context = options.context || 'cuecli';
    
    // Set up file logging if requested
    if (this.logFile) {
      const logDir = path.dirname(this.logFile);
      fs.ensureDirSync(logDir);
    }
  }

  // Format timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Format log message
  formatMessage(level, message, data) {
    const levelName = Object.keys(LogLevel).find(key => LogLevel[key] === level);
    const timestamp = this.timestamps ? `[${this.getTimestamp()}] ` : '';
    const context = `[${this.context}]`;
    const dataStr = data ? ` ${JSON.stringify(data)}` : '';
    
    return `${timestamp}${context} ${levelName}: ${message}${dataStr}`;
  }

  // Write to file if enabled
  writeToFile(message) {
    if (this.logFile) {
      try {
        fs.appendFileSync(this.logFile, message + '\n');
      } catch (error) {
        // Fail silently to avoid recursive logging
      }
    }
  }

  // Core logging method
  log(level, message, data = null) {
    if (level > this.level) return;

    const formattedMessage = this.formatMessage(level, message, data);
    
    // Write to file
    this.writeToFile(formattedMessage);

    // Console output with colors
    if (this.colors) {
      const coloredOutput = this.getColoredOutput(level, message, data);
      console.log(coloredOutput);
    } else {
      console.log(formattedMessage);
    }
  }

  // Get colored output for console
  getColoredOutput(level, message, data) {
    const timestamp = this.timestamps ? chalk.gray(`[${this.getTimestamp()}] `) : '';
    const context = chalk.cyan(`[${this.context}]`);
    
    let levelStr, messageStr;
    
    switch (level) {
      case LogLevel.ERROR:
        levelStr = chalk.red('ERROR');
        messageStr = chalk.red(message);
        break;
      case LogLevel.WARN:
        levelStr = chalk.yellow('WARN');
        messageStr = chalk.yellow(message);
        break;
      case LogLevel.INFO:
        levelStr = chalk.green('INFO');
        messageStr = chalk.white(message);
        break;
      case LogLevel.DEBUG:
        levelStr = chalk.blue('DEBUG');
        messageStr = chalk.gray(message);
        break;
      case LogLevel.TRACE:
        levelStr = chalk.magenta('TRACE');
        messageStr = chalk.gray(message);
        break;
      default:
        levelStr = 'LOG';
        messageStr = message;
    }

    const dataStr = data ? chalk.gray(` ${JSON.stringify(data)}`) : '';
    
    return `${timestamp}${context} ${levelStr}: ${messageStr}${dataStr}`;
  }

  // Convenience methods
  error(message, data) {
    this.log(LogLevel.ERROR, message, data);
  }

  warn(message, data) {
    this.log(LogLevel.WARN, message, data);
  }

  info(message, data) {
    this.log(LogLevel.INFO, message, data);
  }

  debug(message, data) {
    this.log(LogLevel.DEBUG, message, data);
  }

  trace(message, data) {
    this.log(LogLevel.TRACE, message, data);
  }

  // Success message (special case)
  success(message, data) {
    const timestamp = this.timestamps ? chalk.gray(`[${this.getTimestamp()}] `) : '';
    const output = `${timestamp}${chalk.green('✓')} ${chalk.white(message)}`;
    console.log(output);
    
    const logMessage = `${this.timestamps ? `[${this.getTimestamp()}] ` : ''}SUCCESS: ${message}`;
    this.writeToFile(logMessage);
  }

  // Failure message (special case)
  failure(message, data) {
    const timestamp = this.timestamps ? chalk.gray(`[${this.getTimestamp()}] `) : '';
    const output = `${timestamp}${chalk.red('✗')} ${chalk.red(message)}`;
    console.log(output);
    
    const logMessage = `${this.timestamps ? `[${this.getTimestamp()}] ` : ''}FAILURE: ${message}`;
    this.writeToFile(logMessage);
  }

  // Progress indicator
  progress(message) {
    if (this.level >= LogLevel.INFO) {
      process.stdout.write(`\r${chalk.cyan('⟳')} ${message}...`);
    }
  }

  // Clear progress line
  clearProgress() {
    if (this.level >= LogLevel.INFO) {
      process.stdout.write('\r\x1b[K');
    }
  }

  // Create child logger with context
  child(context) {
    return new Logger({
      level: this.level,
      colors: this.colors,
      timestamps: this.timestamps,
      logFile: this.logFile,
      context: `${this.context}:${context}`
    });
  }

  // Set log level
  setLevel(level) {
    if (typeof level === 'string') {
      this.level = LogLevel[level.toUpperCase()] || LogLevel.INFO;
    } else {
      this.level = level;
    }
  }

  // Enable/disable colors
  setColors(enabled) {
    this.colors = enabled;
  }

  // Enable/disable timestamps
  setTimestamps(enabled) {
    this.timestamps = enabled;
  }
}

// Create default logger instance
const defaultLogger = new Logger({
  level: process.env.LOG_LEVEL ? LogLevel[process.env.LOG_LEVEL.toUpperCase()] : LogLevel.INFO,
  colors: process.env.NO_COLOR !== 'true',
  timestamps: process.env.LOG_TIMESTAMPS === 'true',
  logFile: process.env.LOG_FILE || null
});

// Export both the class and default instance
export default defaultLogger;
export { LogLevel };